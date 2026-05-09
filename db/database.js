/**
 * SQLite Database Module (using sql.js)
 * 数据库初始化与操作模块
 * 包含：用户表、留言表、博客表、配置表、作品表
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'amber.db');

let db = null;

// 初始化数据库
async function initDatabase() {
    const SQL = await initSqlJs();

    // 尝试加载已有数据库
    try {
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
            console.log('✅ 已加载现有数据库');
        } else {
            db = new SQL.Database();
            console.log('✅ 创建新数据库');
        }
    } catch (e) {
        db = new SQL.Database();
        console.log('✅ 创建新数据库（加载失败）');
    }

    // 创建表结构
    createTables();

    // 数据库迁移：添加缺失的列
    migrateDatabase();

    // 初始化默认数据
    initDefaultData();

    // 保存数据库
    saveDatabase();

    console.log('✅ 数据库初始化完成');
}

// 数据库迁移：添加sort_order列到已有表
function migrateDatabase() {
    const tables = ['works', 'education', 'projects', 'certificates', 'blogs', 'experiences'];
    tables.forEach(table => {
        try {
            db.run(`ALTER TABLE ${table} ADD COLUMN sort_order INTEGER DEFAULT 0`);
            console.log(`✅ ${table} 表已添加 sort_order 列`);
        } catch (e) {
            // 列可能已存在，忽略错误
        }
    });
}

// 保存数据库到文件
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    }
}

// 创建表结构
function createTables() {
    // 用户表 - 管理员账户
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 留言表 - 访客留言
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_name TEXT NOT NULL,
            content TEXT NOT NULL,
            reply TEXT DEFAULT '',
            reply_at DATETIME,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 博客文章表
    db.run(`
        CREATE TABLE IF NOT EXISTS blogs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            category TEXT DEFAULT '通用',
            tags TEXT DEFAULT '',
            status TEXT DEFAULT 'published',
            views INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 配置表 - 网站配置和个人信息
    db.run(`
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 作品表 - 项目展示
    db.run(`
        CREATE TABLE IF NOT EXISTS works (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image_url TEXT,
            link TEXT,
            tags TEXT DEFAULT '',
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 技能表
    db.run(`
        CREATE TABLE IF NOT EXISTS skills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            level INTEGER DEFAULT 50,
            category TEXT DEFAULT '技能',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 工作经历表
    db.run(`
        CREATE TABLE IF NOT EXISTS experiences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT DEFAULT 'work',
            title TEXT NOT NULL,
            company TEXT DEFAULT '',
            location TEXT DEFAULT '',
            start_date TEXT,
            end_date TEXT,
            current INTEGER DEFAULT 0,
            description TEXT,
            achievements TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 教育经历表
    db.run(`
        CREATE TABLE IF NOT EXISTS education (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            school TEXT NOT NULL,
            degree TEXT DEFAULT '',
            major TEXT DEFAULT '',
            start_date TEXT,
            end_date TEXT,
            gpa TEXT,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 项目经历表
    db.run(`
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT DEFAULT '',
            start_date TEXT,
            end_date TEXT,
            description TEXT,
            achievements TEXT,
            technologies TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 证书荣誉表
    db.run(`
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT DEFAULT 'certificate',
            issuer TEXT DEFAULT '',
            date TEXT,
            description TEXT,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 社交链接表
    db.run(`
        CREATE TABLE IF NOT EXISTS socials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            platform TEXT NOT NULL,
            url TEXT NOT NULL,
            icon TEXT DEFAULT 'fa-link',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 访客统计表
    db.run(`
        CREATE TABLE IF NOT EXISTS stats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE UNIQUE NOT NULL,
            visitors INTEGER DEFAULT 0,
            page_views INTEGER DEFAULT 0
        )
    `);
}

// 初始化默认数据
function initDefaultData() {
    // 检查并更新管理员账号
    const adminExists = db.exec("SELECT id FROM users WHERE username = 'admin'");
    const amberExists = db.exec("SELECT id FROM users WHERE username = 'Amber'");

    const hashedPassword = bcrypt.hashSync('Qjx0823!', 10);

    // 如果存在旧的admin账号，删除它
    if (adminExists.length > 0 && adminExists[0].values.length > 0) {
        db.run("DELETE FROM users WHERE username = 'admin'");
    }

    // 创建新账号（如果不存在）
    if (amberExists.length === 0 || amberExists[0].values.length === 0) {
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['Amber', hashedPassword, 'admin']);
        console.log('✅ 默认管理员账户已创建: Amber / Qjx0823!');
    } else {
        // 如果Amber已存在，只更新密码
        db.run("UPDATE users SET password = ? WHERE username = 'Amber'", [hashedPassword]);
        console.log('✅ 管理员密码已更新: Amber / Qjx0823!');
    }

    // 初始化默认配置 - 屈佳欣(Amber)真实信息
    const defaultConfigs = [
        ['site_name', '屈佳欣 Portfolio'],
        ['site_title', '数据分析师 | 屈佳欣 Amber'],
        ['site_description', '数据分析师屈佳欣的个人求职网站'],
        ['avatar_url', '/public/assets/avatar.jpg'],
        ['hero_image', '/public/assets/hero.jpg'],
        ['name', '屈佳欣'],
        ['title', '数据分析师'],
        ['job_intent', '数据分析师（上海/苏州）'],
        ['expected_city', '上海、苏州'],
        ['expected_salary', '面议'],
        ['bio', '本科经济统计学专业，拥有1年2个月知名家具企业海外事业部全职工作经验，深耕海外产品销售数据、业务运营数据全流程分析与管理工作，具备扎实的多维度数据拆解、内外部数据挖掘、市场调研及报告撰写能力。熟练运用SQL、Excel完成海量数据统计、清洗与可视化分析，可独立输出销售分析、市场调研、库存优化等专业报告，持有CDA Level1数据分析师认证。具备极强的数据敏感度、跨部门协调能力与执行力，擅长海量数据整理维护、市场机会挖掘、业务数据赋能，可快速适配快消行业数据分析、数据管理、决策支持等相关工作，精准为团队及管理层提供高效数据服务。'],
        ['email', '3234260391@qq.com'],
        ['phone', '19525384607'],
        ['location', '陕西咸阳'],
        ['work_years', '1年2个月'],
        ['education_bg', '吉林财经大学 经济统计学 本科（GPA 4.16/5）'],
        ['certifications', 'CDA Level1、CET-4(519)、CET-6(461)、计算机二级'],
        ['skills_label', '技能特长'],
        ['works_label', '作品展示'],
        ['blog_label', '博客文章'],
        ['contact_label', '联系方式'],
        ['message_label', '留言板']
    ];

    defaultConfigs.forEach(([key, value]) => {
        const exists = db.exec("SELECT id FROM config WHERE key = ?", [key]);
        if (exists.length === 0 || exists[0].values.length === 0) {
            db.run('INSERT INTO config (key, value) VALUES (?, ?)', [key, value]);
        }
    });

    // 初始化工作经历
    const expCount = db.exec('SELECT COUNT(*) as count FROM experiences');
    if (expCount.length === 0 || expCount[0].values[0][0] === 0) {
        const sampleExperiences = [
            {
                type: 'work',
                title: '产品专员',
                company: '广东精一家具股份有限公司 海外事业部',
                location: '佛山',
                start_date: '2025.02',
                end_date: '至今',
                current: 1,
                description: '负责海外产品销售数据分析、业务运营数据全流程分析管理工作，负责业务数据的日常监控、报表制作与数据可视化输出，支撑业务决策。',
                achievements: '月度/季度/年度销售数据分析报告（800+次）|海关外部数据挖掘市场增长点|CIFF展会竞品调研PPT|库存周转指标体系搭建|累计处理数据8000+条|整理维护产品资料50000+条|翻译产品中文信息3000+|荣获闪耀新星奖项'
            }
        ];

        sampleExperiences.forEach(exp => {
            db.run('INSERT INTO experiences (type, title, company, location, start_date, end_date, current, description, achievements, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [exp.type, exp.title, exp.company, exp.location, exp.start_date, exp.end_date, exp.current, exp.description, exp.achievements, 0]);
        });
    }

    // 初始化教育经历
    const eduCount = db.exec('SELECT COUNT(*) as count FROM education');
    if (eduCount.length === 0 || eduCount[0].values[0][0] === 0) {
        const sampleEducation = [
            {
                school: '吉林财经大学',
                degree: '本科',
                major: '经济统计学',
                start_date: '2021.09',
                end_date: '2025.07',
                gpa: 'GPA 4.16/5',
                description: '经济统计学专业，系统学习统计学、经济学、数据分析等课程。主修课程：Python数据分析、国民经济统计学、企业经营统计学、C语言程序设计、数据挖掘、时间序列分析、应用多元统计分析、微积分、概率论、线性代数、机器学习、计量经济学、统计学、会计学。'
            }
        ];

        sampleEducation.forEach(edu => {
            db.run('INSERT INTO education (school, degree, major, start_date, end_date, gpa, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [edu.school, edu.degree, edu.major, edu.start_date, edu.end_date, edu.gpa, edu.description, 0]);
        });
    }

    // 初始化项目经历
    const projCount = db.exec('SELECT COUNT(*) as count FROM projects');
    if (projCount.length === 0 || projCount[0].values[0][0] === 0) {
        const sampleProjects = [
            {
                name: '桑榆未晚，让"音"伴老——长春市老年人智能音箱市场现状及需求调查',
                role: '项目负责人',
                start_date: '2022.11',
                end_date: '2023.04',
                description: '探究基于老年人角度对长春市智能音箱的发展与改善路径，为产品开发商、销售商、使用者及其家属提供可行策略。',
                achievements: '负责深度访谈安排、调查问卷逻辑设计、数据收集分析|撰写50页+调研报告|项目获省级优秀项目荣誉',
                technologies: 'SPSS、Excel、问卷星'
            },
            {
                name: '线上家教志愿者',
                role: '志愿者教师',
                start_date: '2022.01',
                end_date: '2023.08',
                description: '帮助初中生利用寒暑假时间进行英语和数学科目的查漏补缺，根据学生特点提供针对性辅导。',
                achievements: '帮助学生成绩提升近20分',
                technologies: '在线教学平台'
            },
            {
                name: '同心志愿者协会干事',
                role: '干事',
                start_date: '2021.12',
                end_date: '2023.06',
                description: '运用PS、AI设计活动宣传海报，收集整理数据文件，整理书籍名单（3500本）和捐赠人员名单（1200人）。',
                achievements: '参与组织爱心书屋、学伴+等志愿活动|获省级优秀抗疫志愿者证书',
                technologies: 'PS、AI'
            }
        ];

        sampleProjects.forEach(proj => {
            db.run('INSERT INTO projects (name, role, start_date, end_date, description, achievements, technologies, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [proj.name, proj.role, proj.start_date, proj.end_date, proj.description, proj.achievements, proj.technologies, 0]);
        });
    }

    // 初始化证书荣誉
    const certCount = db.exec('SELECT COUNT(*) as count FROM certificates');
    if (certCount.length === 0 || certCount[0].values[0][0] === 0) {
        const sampleCertificates = [
            { name: 'CDA Level1', type: 'certificate', issuer: 'CDA数据分析师协会', date: '2024.03', description: '数据分析师职业技能认证' },
            { name: 'CET-4 (519分)', type: 'certificate', issuer: '教育部', date: '2021.06', description: '大学英语四级考试' },
            { name: 'CET-6 (461分)', type: 'certificate', issuer: '教育部', date: '2021.12', description: '大学英语六级考试' },
            { name: '计算机二级', type: 'certificate', issuer: '教育部考试中心', date: '2022.09', description: '全国计算机等级考试二级' },
            { name: '全国大学生市调大赛省一', type: 'honor', issuer: '中国商业统计学会', date: '2023.07', description: '第十三届全国大学生市场调查与分析大赛省级一等奖' },
            { name: '统计建模大赛省一', type: 'honor', issuer: '中国统计教育学会', date: '2023.08', description: '全国大学生统计建模大赛省级一等奖' },
            { name: '商科综合能力大赛国二', type: 'honor', issuer: '中国高等教育学会', date: '2023.11', description: '全国大学生商科综合能力大赛全国二等奖' },
            { name: '省级优秀抗疫志愿者', type: 'honor', issuer: '吉林省志愿者协会', date: '2022.05', description: '疫情防控志愿服务荣誉证书' },
            { name: '优秀学伴+志愿者', type: 'honor', issuer: '同心志愿者协会', date: '2023.06', description: '学伴+志愿服务荣誉证书' }
        ];

        sampleCertificates.forEach(cert => {
            db.run('INSERT INTO certificates (name, type, issuer, date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
                [cert.name, cert.type, cert.issuer, cert.date, cert.description, 0]);
        });
    }

    // 初始化示例博客文章 - 屈佳欣(Amber)的10篇专业博客
    const blogCount = db.exec('SELECT COUNT(*) as count FROM blogs');
    if (blogCount.length === 0 || blogCount[0].values[0][0] === 0) {
        const sampleBlogs = [
            {
                title: '海外家具销售数据复盘：从8000+条数据挖掘增长机会',
                content: '作为一名产品专员，我负责海外事业部月度、季度、年度销售复盘，通过多维度下钻分析挖掘增长机会。\n\n核心工作：\n1. 数据整理：累计处理8000+业务数据，建立标准化数据处理流程\n2. 多维度分析：从产品、地区、客户、渠道等多个维度进行下钻分析\n3. 报告输出：输出专业销售分析报告，支撑管理层决策\n\n关键发现：\n- 识别出3个高增长产品线，建议重点拓展\n- 发现2个潜在市场机会，制定对标分析报告\n- 优化库存周转策略，降低滞销库存20%\n\n工具运用：\n主要使用SQL进行数据提取，Excel完成数据清洗和可视化，Power BI制作分析看板。',
                category: '数据分析',
                tags: '销售分析,SQL,Excel,海外业务'
            },
            {
                title: '海关数据挖掘实战：快速定位海外市场增长点',
                content: '在海外业务拓展中，海关数据是挖掘市场机会的重要来源。本文分享我如何利用海关数据进行分析。\n\n数据来源：\n通过海关总署公开数据、UN Comtrade等渠道获取进出口数据\n\n分析方法：\n1. 市场容量分析：计算目标市场的整体进口规模和增速\n2. 竞争格局分析：识别主要竞争对手和市场集中度\n3. 趋势预测：基于历史数据预测未来市场走势\n\n实战案例：\n通过分析某品类海关数据，成功识别出一个年增速超30%的细分市场，为业务团队提供了明确的市场拓展方向。\n\n工具技巧：\n使用Python的pandas库进行数据处理，matplotlib进行可视化呈现。',
                category: '市场分析',
                tags: '海关数据,Python,市场分析,海外市场'
            },
            {
                title: 'Excel数据分析：海量订单清洗与可视化全流程',
                content: '日常工作中，Excel仍然是最常用的数据分析工具。本文分享我处理海量订单数据的经验。\n\n数据清洗技巧：\n1. 去重处理：使用COUNTIF函数识别重复订单\n2. 格式统一：日期、金额等字段的标准化处理\n3. 缺失值处理：建立数据质量检查清单\n\n数据分析方法：\n- 透视表进行多维度汇总分析\n- 条件格式识别异常数据\n- 数据验证确保输入准确性\n\n可视化呈现：\n- 使用动态图表展示销售趋势\n- 制作仪表盘实时监控关键指标\n- 图表配色遵循马卡龙低饱和风格\n\n效率提升：\n通过VBA编写自动化脚本，将原本3小时的数据处理工作缩短至15分钟。',
                category: '技术分享',
                tags: 'Excel,数据清洗,可视化,自动化'
            },
            {
                title: 'SQL业务取数技巧：多表关联与复杂查询实践',
                content: 'SQL是数据分析师的核心技能。本文总结我在实际业务中的SQL取数技巧。\n\n高频场景：\n1. 订单数据查询：关联订单表、用户表、产品表\n2. 库存分析：多表联合计算库存周转率\n3. 业绩统计：复杂聚合统计销售业绩\n\n优化技巧：\n- 避免SELECT *，只取需要的字段\n- 使用EXPLAIN分析查询计划\n- 合理创建索引加速查询\n- 利用WITH AS提高可读性\n\n实战示例：\n```sql\nSELECT \n    p.category,\n    COUNT(DISTINCT o.order_id) as order_count,\n    SUM(o.amount) as total_amount\nFROM orders o\nJOIN products p ON o.product_id = p.id\nWHERE o.create_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)\nGROUP BY p.category\n```\n\n通过这样的查询，可以快速了解各品类的销售表现。',
                category: '技术分享',
                tags: 'SQL,数据库,查询优化,业务分析'
            },
            {
                title: '库存周转指标体系搭建与效率优化',
                content: '库存管理是业务运营的重要环节。本文分享我如何搭建库存周转指标体系。\n\n核心指标：\n1. 库存周转率 = 销售成本 / 平均库存\n2. 库存周转天数 = 365 / 库存周转率\n3. 滞销库存占比 = 滞销库存金额 / 总库存金额\n\n分析维度：\n- 按产品分类分析周转效率\n- 按地区分析库存分布\n- 按时间趋势分析季节性\n\n优化建议：\n- 建立安全库存预警机制\n- 定期清理滞销库存\n- 优化补货策略和周期\n\n实施效果：\n通过指标监控和优化，库存周转天数从45天缩短至32天，滞销库存占比下降15%。',
                category: '业务分析',
                tags: '库存管理,指标体系,运营优化'
            },
            {
                title: 'CIFF展会调研与竞品分析报告撰写',
                content: 'CIFF广州家博会是家具行业最重要的展会之一。我负责收集竞品信息并输出调研报告。\n\n调研内容：\n1. 产品分析：收集竞品新品、设计风格、材质工艺\n2. 定价策略：整理竞品价格体系和促销政策\n3. 市场数据：了解竞品渠道布局和目标客户\n\n分析方法：\n- SWOT分析竞品优劣势\n- 对标分析找差距\n- 趋势分析预判方向\n\n报告输出：\n制作完整的PPT调研报告，包含：\n- 展会概览\n- 竞品分析\n- 机会洞察\n- 建议策略\n\n价值输出：\n报告为产品规划和定价策略提供了重要参考依据。',
                category: '市场分析',
                tags: '竞品分析,CIFF,展会调研,家具行业'
            },
            {
                title: '数据分析师求职：从家具行业转向电商零售',
                content: '随着职业发展，我开始寻求从家具行业转向电商零售的机会。分享我的求职思考。\n\n转型动机：\n1. 家具行业数据分析场景相对单一\n2. 电商零售行业数据更丰富、分析需求更强烈\n3. 个人职业发展需要更大的平台\n\n能力匹配：\n- 数据分析能力（SQL、Excel、Python）可迁移\n- 业务理解和数据敏感度是核心优势\n- 跨行业适应能力和学习能力\n\n目标岗位：\n数据分析师、电商数据分析师、运营分析师等\n\n期望城市：\n苏州、西安、南京、上海\n\n期望薪资：\n12-14K\n\n虽然行业不同，但数据分析的核心方法论是相通的。',
                category: '求职分享',
                tags: '求职,转行,数据分析师,职业规划'
            },
            {
                title: 'CDA Level1备考与学习方法总结',
                content: '2024年3月，我通过了CDA Level1数据分析师认证。分享我的备考经验。\n\n考试内容：\n- 数据分析概述\n- 数据获取与处理\n- 模型分析\n- 结果呈现\n\n学习资源：\n1. CDA官方教材\n2. 人大经济论坛资料\n3. 模拟题库练习\n\n学习方法：\n- 理论+实践结合\n- 重点掌握SQL和业务分析\n- 多做模拟题熟悉题型\n\n考试技巧：\n- 先易后难，合理分配时间\n- 遇到不确定的题目相信第一直觉\n- 保持良好心态\n\n证书价值：\n系统化梳理了数据分析知识体系，验证了专业能力。',
                category: '学习分享',
                tags: 'CDA,数据分析,证书,学习方法'
            },
            {
                title: '5w+产品信息库维护：数据治理实践',
                content: '在工作中，我负责维护50000+产品信息库。这是我的数据治理实践经验。\n\n挑战：\n- 数据量大，更新频繁\n- 多数据源，质量参差不齐\n- 跨部门协作，沟通成本高\n\n解决方案：\n1. 标准化：建立产品信息规范，统一字段定义\n2. 流程化：制定数据更新流程，确保及时准确\n3. 工具化：开发数据管理工具，提高效率\n\n质量保障：\n- 建立数据质量检查机制\n- 定期清理重复和过期数据\n- 制定数据字典便于查询\n\n成果：\n产品信息完整率从75%提升至95%，查询效率提升3倍。',
                category: '业务分析',
                tags: '数据治理,产品信息,数据质量,流程优化'
            },
            {
                title: '用数据赋能前端业务与销售团队获客',
                content: '数据分析的最终目的是赋能业务。本文分享我如何通过数据支持前端业务和获客。\n\n数据赋能场景：\n1. 销售支持：提供客户画像和销售线索\n2. 市场投放：分析渠道效果，优化投放策略\n3. 产品迭代：基于用户反馈指导产品改进\n\n关键数据：\n- 客户转化漏斗分析\n- 渠道ROI分析\n- 用户行为路径分析\n\n协作方式：\n- 定期给销售团队发送数据报表\n- 参与业务会议，提供数据支持\n- 建立数据答疑机制\n\n价值体现：\n通过数据支持，帮助销售团队识别高潜力客户，转化率提升18%。',
                category: '数据分析',
                tags: '数据赋能,业务支持,获客,销售分析'
            }
        ];

        sampleBlogs.forEach(blog => {
            db.run('INSERT INTO blogs (title, content, category, tags, sort_order) VALUES (?, ?, ?, ?, ?)',
                [blog.title, blog.content, blog.category, blog.tags, 0]);
        });
    }

    // 初始化示例技能 - 屈佳欣的技能
    const skillsCount = db.exec('SELECT COUNT(*) as count FROM skills');
    if (skillsCount.length === 0 || skillsCount[0].values[0][0] === 0) {
        const sampleSkills = [
            { name: 'SQL', level: 88, category: '数据分析工具' },
            { name: 'Excel', level: 90, category: '数据分析工具' },
            { name: 'Python', level: 80, category: '数据分析工具' },
            { name: 'SPSS', level: 75, category: '数据分析工具' },
            { name: 'R语言', level: 65, category: '数据分析工具' },
            { name: 'EViews', level: 60, category: '数据分析工具' },
            { name: 'Tableau', level: 82, category: '可视化工具' },
            { name: 'Power BI', level: 80, category: '可视化工具' },
            { name: 'MySQL', level: 78, category: '数据库' },
            { name: 'PS', level: 60, category: '设计工具' },
            { name: 'AI', level: 55, category: '设计工具' },
            { name: 'Word/PPT', level: 85, category: '办公技能' },
            { name: 'Access', level: 70, category: '办公技能' },
            { name: '数据敏感度', level: 88, category: '业务能力' },
            { name: '跨部门协调', level: 85, category: '软技能' },
            { name: '市场分析', level: 82, category: '业务能力' },
            { name: '报告撰写', level: 88, category: '业务能力' }
        ];

        sampleSkills.forEach(skill => {
            db.run('INSERT INTO skills (name, level, category) VALUES (?, ?, ?)',
                [skill.name, skill.level, skill.category]);
        });
    }
}

// ============ 用户相关操作 ============

/**
 * 用户登录验证
 */
function verifyUser(username, password) {
    const result = db.exec('SELECT * FROM users WHERE username = ?', [username]);
    if (result.length > 0 && result[0].values.length > 0) {
        const user = result[0].values[0];
        const userObj = {
            id: user[0],
            username: user[1],
            password: user[2],
            role: user[3]
        };
        if (bcrypt.compareSync(password, userObj.password)) {
            return { id: userObj.id, username: userObj.username, role: userObj.role };
        }
    }
    return null;
}

/**
 * 获取用户信息
 */
function getUserById(id) {
    const result = db.exec('SELECT id, username, role, created_at FROM users WHERE id = ?', [id]);
    if (result.length > 0 && result[0].values.length > 0) {
        const user = result[0].values[0];
        return {
            id: user[0],
            username: user[1],
            role: user[2],
            created_at: user[3]
        };
    }
    return null;
}

// ============ 留言相关操作 ============

function getApprovedMessages() {
    const result = db.exec('SELECT * FROM messages WHERE status = ? ORDER BY created_at DESC', ['approved']);
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], visitor_name: row[1], content: row[2],
        reply: row[3], reply_at: row[4], status: row[5], created_at: row[6]
    }));
}

function getAllMessages() {
    const result = db.exec('SELECT * FROM messages ORDER BY created_at DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], visitor_name: row[1], content: row[2],
        reply: row[3], reply_at: row[4], status: row[5], created_at: row[6]
    }));
}

function getPendingMessageCount() {
    const result = db.exec('SELECT COUNT(*) as count FROM messages WHERE status = ?', ['pending']);
    return result.length > 0 ? result[0].values[0][0] : 0;
}

function addMessage(visitorName, content) {
    db.run('INSERT INTO messages (visitor_name, content) VALUES (?, ?)', [visitorName, content]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateMessageStatus(id, status) {
    db.run('UPDATE messages SET status = ? WHERE id = ?', [status, id]);
    saveDatabase();
    return true;
}

function replyMessage(id, reply) {
    db.run('UPDATE messages SET reply = ?, reply_at = datetime(\'now\') WHERE id = ?', [reply, id]);
    saveDatabase();
    return true;
}

function deleteMessage(id) {
    db.run('DELETE FROM messages WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 博客相关操作 ============

function getPublishedBlogs() {
    const result = db.exec('SELECT * FROM blogs WHERE status = ? ORDER BY sort_order ASC, created_at DESC', ['published']);
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], title: row[1], content: row[2],
        category: row[3], tags: row[4], status: row[5],
        views: row[6], sort_order: row[7], created_at: row[8], updated_at: row[9]
    }));
}

function getAllBlogs() {
    const result = db.exec('SELECT * FROM blogs ORDER BY sort_order ASC, created_at DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], title: row[1], content: row[2],
        category: row[3], tags: row[4], status: row[5],
        views: row[6], sort_order: row[7], created_at: row[8], updated_at: row[9]
    }));
}

function getBlogById(id) {
    const result = db.exec('SELECT * FROM blogs WHERE id = ?', [id]);
    if (result.length === 0 || result[0].values.length === 0) return null;
    const row = result[0].values[0];
    return {
        id: row[0], title: row[1], content: row[2],
        category: row[3], tags: row[4], status: row[5],
        views: row[6], sort_order: row[7], created_at: row[8], updated_at: row[9]
    };
}

function incrementBlogViews(id) {
    db.run('UPDATE blogs SET views = views + 1 WHERE id = ?', [id]);
    saveDatabase();
}

function createBlog(blog) {
    db.run('INSERT INTO blogs (title, content, category, tags, status, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [blog.title, blog.content, blog.category || '通用', blog.tags || '', blog.status || 'published', blog.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateBlog(id, blog) {
    db.run('UPDATE blogs SET title = ?, content = ?, category = ?, tags = ?, status = ?, sort_order = ?, updated_at = datetime(\'now\') WHERE id = ?',
        [blog.title, blog.content, blog.category, blog.tags, blog.status, blog.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteBlog(id) {
    db.run('DELETE FROM blogs WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

function getBlogCategories() {
    const result = db.exec('SELECT category, COUNT(*) as count FROM blogs WHERE status = ? GROUP BY category', ['published']);
    if (result.length === 0) return [];
    return result[0].values.map(row => ({ category: row[0], count: row[1] }));
}

function getBlogTags() {
    const blogs = getPublishedBlogs();
    const tagSet = new Set();
    blogs.forEach(blog => {
        if (blog.tags) {
            blog.tags.split(',').forEach(tag => tagSet.add(tag.trim()));
        }
    });
    return Array.from(tagSet);
}

// ============ 配置相关操作 ============

function getAllConfig() {
    const result = db.exec('SELECT key, value FROM config');
    if (result.length === 0) return {};
    const configObj = {};
    result[0].values.forEach(row => {
        configObj[row[0]] = row[1];
    });
    return configObj;
}

function getConfig(key) {
    const result = db.exec('SELECT value FROM config WHERE key = ?', [key]);
    return result.length > 0 && result[0].values.length > 0 ? result[0].values[0][0] : null;
}

function updateConfig(key, value) {
    const exists = db.exec("SELECT id FROM config WHERE key = ?", [key]);
    if (exists.length > 0 && exists[0].values.length > 0) {
        db.run('UPDATE config SET value = ?, updated_at = datetime(\'now\') WHERE key = ?', [value, key]);
    } else {
        db.run('INSERT INTO config (key, value) VALUES (?, ?)', [key, value]);
    }
    saveDatabase();
    return true;
}

function updateConfigs(configs) {
    Object.entries(configs).forEach(([key, value]) => {
        updateConfig(key, value);
    });
}

// ============ 作品相关操作 ============

function getAllWorks() {
    const result = db.exec('SELECT * FROM works ORDER BY sort_order ASC, created_at DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], title: row[1], description: row[2],
        image_url: row[3], link: row[4], tags: row[5], created_at: row[6], sort_order: row[7]
    }));
}

function addWork(work) {
    db.run('INSERT INTO works (title, description, image_url, link, tags, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [work.title, work.description || '', work.image_url || '', work.link || '', work.tags || '', work.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateWork(id, work) {
    db.run('UPDATE works SET title = ?, description = ?, image_url = ?, link = ?, tags = ?, sort_order = ? WHERE id = ?',
        [work.title, work.description, work.image_url, work.link, work.tags, work.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteWork(id) {
    db.run('DELETE FROM works WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 技能相关操作 ============

function getAllSkills() {
    const result = db.exec('SELECT * FROM skills ORDER BY category, level DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], name: row[1], level: row[2], category: row[3], created_at: row[4]
    }));
}

function addSkill(skill) {
    db.run('INSERT INTO skills (name, level, category) VALUES (?, ?, ?)',
        [skill.name, skill.level || 50, skill.category || '技能']);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateSkill(id, skill) {
    db.run('UPDATE skills SET name = ?, level = ?, category = ? WHERE id = ?',
        [skill.name, skill.level, skill.category, id]);
    saveDatabase();
    return true;
}

function deleteSkill(id) {
    db.run('DELETE FROM skills WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 工作经历相关操作 ============

function getAllExperiences() {
    const result = db.exec('SELECT * FROM experiences ORDER BY sort_order ASC, start_date DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], type: row[1], title: row[2], company: row[3],
        location: row[4], start_date: row[5], end_date: row[6],
        current: row[7], description: row[8], achievements: row[9], sort_order: row[10], created_at: row[11]
    }));
}

function addExperience(exp) {
    db.run('INSERT INTO experiences (type, title, company, location, start_date, end_date, current, description, achievements, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [exp.type || 'work', exp.title, exp.company || '', exp.location || '', exp.start_date || '', exp.end_date || '', exp.current || 0, exp.description || '', exp.achievements || '', exp.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateExperience(id, exp) {
    db.run('UPDATE experiences SET type = ?, title = ?, company = ?, location = ?, start_date = ?, end_date = ?, current = ?, description = ?, achievements = ?, sort_order = ? WHERE id = ?',
        [exp.type, exp.title, exp.company, exp.location, exp.start_date, exp.end_date, exp.current, exp.description, exp.achievements, exp.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteExperience(id) {
    db.run('DELETE FROM experiences WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 教育经历相关操作 ============

function getAllEducation() {
    const result = db.exec('SELECT * FROM education ORDER BY sort_order ASC, start_date DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], school: row[1], degree: row[2], major: row[3],
        start_date: row[4], end_date: row[5], gpa: row[6], description: row[7], sort_order: row[8], created_at: row[9]
    }));
}

function addEducation(edu) {
    db.run('INSERT INTO education (school, degree, major, start_date, end_date, gpa, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [edu.school, edu.degree || '', edu.major || '', edu.start_date || '', edu.end_date || '', edu.gpa || '', edu.description || '', edu.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateEducation(id, edu) {
    db.run('UPDATE education SET school = ?, degree = ?, major = ?, start_date = ?, end_date = ?, gpa = ?, description = ?, sort_order = ? WHERE id = ?',
        [edu.school, edu.degree, edu.major, edu.start_date, edu.end_date, edu.gpa, edu.description, edu.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteEducation(id) {
    db.run('DELETE FROM education WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 项目经历相关操作 ============

function getAllProjects() {
    const result = db.exec('SELECT * FROM projects ORDER BY sort_order ASC, start_date DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], name: row[1], role: row[2], start_date: row[3],
        end_date: row[4], description: row[5], achievements: row[6], technologies: row[7], sort_order: row[8], created_at: row[9]
    }));
}

function addProject(proj) {
    db.run('INSERT INTO projects (name, role, start_date, end_date, description, achievements, technologies, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [proj.name, proj.role || '', proj.start_date || '', proj.end_date || '', proj.description || '', proj.achievements || '', proj.technologies || '', proj.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateProject(id, proj) {
    db.run('UPDATE projects SET name = ?, role = ?, start_date = ?, end_date = ?, description = ?, achievements = ?, technologies = ?, sort_order = ? WHERE id = ?',
        [proj.name, proj.role, proj.start_date, proj.end_date, proj.description, proj.achievements, proj.technologies, proj.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteProject(id) {
    db.run('DELETE FROM projects WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 证书荣誉相关操作 ============

function getAllCertificates() {
    const result = db.exec('SELECT * FROM certificates ORDER BY sort_order ASC, date DESC');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], name: row[1], type: row[2], issuer: row[3],
        date: row[4], description: row[5], sort_order: row[6], created_at: row[7]
    }));
}

function addCertificate(cert) {
    db.run('INSERT INTO certificates (name, type, issuer, date, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [cert.name, cert.type || 'certificate', cert.issuer || '', cert.date || '', cert.description || '', cert.sort_order || 0]);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function updateCertificate(id, cert) {
    db.run('UPDATE certificates SET name = ?, type = ?, issuer = ?, date = ?, description = ?, sort_order = ? WHERE id = ?',
        [cert.name, cert.type, cert.issuer, cert.date, cert.description, cert.sort_order || 0, id]);
    saveDatabase();
    return true;
}

function deleteCertificate(id) {
    db.run('DELETE FROM certificates WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 社交链接相关操作 ============

function getAllSocials() {
    const result = db.exec('SELECT * FROM socials ORDER BY id');
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], platform: row[1], url: row[2], icon: row[3], created_at: row[4]
    }));
}

function addSocial(social) {
    db.run('INSERT INTO socials (platform, url, icon) VALUES (?, ?, ?)',
        [social.platform, social.url, social.icon || 'fa-link']);
    saveDatabase();
    const result = db.exec('SELECT last_insert_rowid()');
    return { id: result[0].values[0][0], success: true };
}

function deleteSocial(id) {
    db.run('DELETE FROM socials WHERE id = ?', [id]);
    saveDatabase();
    return true;
}

// ============ 统计相关操作 ============

function updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const existing = db.exec('SELECT * FROM stats WHERE date = ?', [today]);

    if (existing.length > 0 && existing[0].values.length > 0) {
        db.run('UPDATE stats SET visitors = visitors + 1, page_views = page_views + 1 WHERE date = ?', [today]);
    } else {
        db.run('INSERT INTO stats (date, visitors, page_views) VALUES (?, 1, 1)', [today]);
    }
    saveDatabase();
}

function getStats(days = 30) {
    const result = db.exec('SELECT * FROM stats ORDER BY date DESC LIMIT ?', [days]);
    if (result.length === 0) return [];
    return result[0].values.map(row => ({
        id: row[0], date: row[1], visitors: row[2], page_views: row[3]
    }));
}

function getTotalStats() {
    const blogResult = db.exec('SELECT COUNT(*) as count FROM blogs WHERE status = ?', ['published']);
    const messageResult = db.exec('SELECT COUNT(*) as count FROM messages WHERE status = ?', ['approved']);
    const workResult = db.exec('SELECT COUNT(*) as count FROM works');
    const viewsResult = db.exec('SELECT SUM(views) as total FROM blogs');

    return {
        blogCount: blogResult.length > 0 ? blogResult[0].values[0][0] : 0,
        messageCount: messageResult.length > 0 ? messageResult[0].values[0][0] : 0,
        workCount: workResult.length > 0 ? workResult[0].values[0][0] : 0,
        totalViews: viewsResult.length > 0 && viewsResult[0].values[0][0] ? viewsResult[0].values[0][0] : 0
    };
}

// ============ 数据导入 ============

function importCSVData(type, data) {
    switch(type) {
        case 'blogs':
            data.forEach(row => {
                db.run('INSERT INTO blogs (title, content, category, tags) VALUES (?, ?, ?, ?)',
                    [row.title, row.content, row.category || '通用', row.tags || '']);
            });
            break;
        case 'works':
            data.forEach(row => {
                db.run('INSERT INTO works (title, description, image_url, link) VALUES (?, ?, ?, ?)',
                    [row.title, row.description || '', row.image_url || '', row.link || '']);
            });
            break;
        case 'skills':
            data.forEach(row => {
                db.run('INSERT INTO skills (name, level, category) VALUES (?, ?, ?)',
                    [row.name, row.level || 50, row.category || '技能']);
            });
            break;
    }
    saveDatabase();
}

module.exports = {
    initDatabase,
    // 用户
    verifyUser,
    getUserById,
    // 留言
    getApprovedMessages,
    getAllMessages,
    getPendingMessageCount,
    addMessage,
    updateMessageStatus,
    replyMessage,
    deleteMessage,
    // 博客
    getPublishedBlogs,
    getAllBlogs,
    getBlogById,
    incrementBlogViews,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogCategories,
    getBlogTags,
    // 配置
    getAllConfig,
    getConfig,
    updateConfig,
    updateConfigs,
    // 作品
    getAllWorks,
    addWork,
    updateWork,
    deleteWork,
    // 技能
    getAllSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    // 工作经历
    getAllExperiences,
    addExperience,
    updateExperience,
    deleteExperience,
    // 教育经历
    getAllEducation,
    addEducation,
    updateEducation,
    deleteEducation,
    // 项目经历
    getAllProjects,
    addProject,
    updateProject,
    deleteProject,
    // 证书荣誉
    getAllCertificates,
    addCertificate,
    updateCertificate,
    deleteCertificate,
    // 社交
    getAllSocials,
    addSocial,
    deleteSocial,
    // 统计
    updateDailyStats,
    getStats,
    getTotalStats,
    // 导入
    importCSVData
};
