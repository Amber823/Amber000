/**
 * 数据填充脚本
 * 将Amber的完整简历内容填充到网站数据库
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'db', 'amber.db');

async function populateData() {
    const SQL = await initSqlJs();

    let db;
    try {
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
        } else {
            db = new SQL.Database();
        }
    } catch (e) {
        db = new SQL.Database();
    }

    console.log('开始填充数据...\n');

    // ============ 清空现有数据 ============
    db.run('DELETE FROM socials');
    db.run('DELETE FROM skills');
    db.run('DELETE FROM works');
    db.run('DELETE FROM blogs');

    // ============ 1. 更新配置信息 ============
    console.log('📝 更新网站配置...');

    const configs = [
        ['site_name', 'Amber Portfolio'],
        ['site_title', '产品数据分析师 | Amber - 电商零售数据分析'],
        ['site_description', 'Amber的产品数据分析师求职博客，专注电商零售数据分析、SQL、Tableau、Python'],
        ['name', 'Amber'],
        ['title', '产品数据分析师'],
        ['bio', '本科经济统计学专业，1年+家具企业海外事业部全职工作经验，深耕海外产品销售数据、业务运营数据全流程分析。累计处理8000+条业务数据，熟练运用SQL、Excel、Python、Tableau/Power BI，持有CDA Level 1认证。'],
        ['email', 'amber@example.com'],
        ['location', '苏州、西安、南京、上海'],
        ['hero_subtitle', '产品数据分析师 | 1年+数据分析经验 | CDA Level 1认证'],
        ['hero_description', '本科经济统计学专业，拥有1年+知名家具企业海外事业部全职工作经验，深耕海外产品销售数据、业务运营数据全流程分析与管理工作。累计处理8000+条业务数据，精准输出日/月/季/年度分析报告800+次。熟练运用SQL+Excel+Python+Tableau/Power BI全链路数据分析，维护50000+条产品信息数据库。']
    ];

    configs.forEach(([key, value]) => {
        db.run('UPDATE config SET value = ? WHERE key = ?', [value, key]);
    });
    console.log('✅ 网站配置更新完成');

    // ============ 2. 填充社交链接 ============
    console.log('\n🔗 填充社交链接...');

    const socials = [
        ['LinkedIn', 'https://linkedin.com/in/amber', 'fa-linkedin'],
        ['GitHub', 'https://github.com/amber', 'fa-github'],
        ['知乎', 'https://zhihu.com/people/amber', 'fa-graduation-cap']
    ];

    socials.forEach(([platform, url, icon]) => {
        db.run('INSERT INTO socials (platform, url, icon) VALUES (?, ?, ?)', [platform, url, icon]);
    });
    console.log('✅ 社交链接填充完成');

    // ============ 3. 填充技能特长 ============
    console.log('\n📊 填充技能特长...');

    const skills = [
        // 数据分析工具
        { name: 'SQL', level: 90, category: '数据分析工具' },
        { name: 'Excel', level: 95, category: '数据分析工具' },
        { name: 'Python', level: 75, category: '数据分析工具' },
        { name: 'Tableau', level: 80, category: '数据分析工具' },
        { name: 'Power BI', level: 75, category: '数据分析工具' },
        { name: 'MySQL', level: 70, category: '数据分析工具' },
        { name: 'SPSS', level: 60, category: '数据分析工具' },
        { name: 'R语言', level: 55, category: '数据分析工具' },

        // 办公技能
        { name: 'Word', level: 85, category: '办公技能' },
        { name: 'PPT', level: 90, category: '办公技能' },
        { name: 'Access', level: 55, category: '办公技能' },

        // 设计技能
        { name: 'PS', level: 65, category: '设计技能' },
        { name: 'AI', level: 55, category: '设计技能' },

        // 语言技能
        { name: '英语六级', level: 75, category: '语言技能' },
        { name: '英语四级', level: 80, category: '语言技能' }
    ];

    skills.forEach(skill => {
        db.run('INSERT INTO skills (name, level, category) VALUES (?, ?, ?)',
            [skill.name, skill.level, skill.category]);
    });
    console.log('✅ 技能特长填充完成');

    // ============ 4. 填充项目作品 ============
    console.log('\n💼 填充项目作品...');

    const works = [
        {
            title: '家具企业海外销售数据分析',
            description: '负责海外事业部9大品牌、3000+SKU的全链路销售数据分析与运营支持，月度/季度/年度复盘报告100+次，多维度下钻分析覆盖品类/大区/定价体系。',
            image_url: '/public/assets/work1.jpg',
            link: '#',
            tags: 'SQL,Excel,Tableau,销售分析'
        },
        {
            title: '海关数据挖掘与市场机会分析',
            description: '依托年度海关外部数据挖掘海外市场机会增长点，分析5000+条海关记录，挖掘市场机会点15+个，输出市场分析报告8份。',
            image_url: '/public/assets/work2.jpg',
            link: '#',
            tags: 'Python,数据分析,市场分析'
        },
        {
            title: 'CIFF行业展会竞品调研',
            description: '参与CIFF行业展会调研，收集30+家竞品数据，围绕产品创新、定价模式、市场策略等维度输出PPT调研报告3份。',
            image_url: '/public/assets/work3.jpg',
            link: '#',
            tags: '竞品分析,市场调研,PPT'
        },
        {
            title: '老年人智能音箱市场调研',
            description: '核心成员，负责深度访谈30+位老年人、问卷设计与数据分析（500+份），撰写50+页调研报告，获全国大学生市调大赛省一等奖。',
            image_url: '/public/assets/work4.jpg',
            link: '#',
            tags: '市场调研,数据分析,报告撰写'
        },
        {
            title: '库存周转指标体系搭建',
            description: '搭建库存周转检测指标体系，实时统计当日库存数据，优化资源空间利用率，保障9大品牌、3000+SKU业务运营顺畅。',
            image_url: '/public/assets/work5.jpg',
            link: '#',
            tags: '指标体系,库存管理,数据分析'
        },
        {
            title: '产品信息数据库维护',
            description: '整理产品资料50000+条记录，翻译中文产品信息3000+条，常态化维护产品信息数据库，高效赋能前端业务团队。',
            image_url: '/public/assets/work6.jpg',
            link: '#',
            tags: '数据管理,数据清洗,SQL'
        }
    ];

    works.forEach(work => {
        db.run('INSERT INTO works (title, description, image_url, link, tags) VALUES (?, ?, ?, ?, ?)',
            [work.title, work.description, work.image_url, work.link, work.tags]);
    });
    console.log('✅ 项目作品填充完成');

    // ============ 5. 填充博客文章 ============
    console.log('\n📝 填充博客文章...');

    const blogs = [
        {
            title: '电商数据分析入门：从0到1搭建数据指标体系',
            content: `【前言】

对于电商数据分析师来说，搭建一套科学、完整的数据指标体系是核心能力之一。本文从业务场景出发，讲解如何搭建电商核心指标体系。

【一、为什么要搭建指标体系？】

1. 统一数据口径，避免各部门数据打架
2. 监控业务健康度，及时发现问题
3. 指导业务决策，用数据驱动增长
4. 沉淀分析经验，形成可复用的方法论

【二、电商核心指标框架】

一）用户指标
• DAU/MAU（日活/月活）及比值
• 次日/7日/30日留存率
• 新用户数及占比
• 用户生命周期价值（LTV）

二）流量指标
• 曝光量、点击量、点击率（CTR）
• 访问深度（PV/UV）
• 跳失率

三）转化指标
• 加购率、收藏率
• 支付转化率
• 客单价

四）GMV指标
• 成交金额（GMV）
• 订单量、客单价
• 环比/同比增长率

【三、指标体系建设步骤】

Step 1：明确业务目标
与业务方对齐核心KPI，如：本季度GMV目标提升20%

Step 2：拆解指标维度
从产品品类、时间维度、渠道维度、用户维度等进行下钻

Step 3：定义计算口径
明确每个指标的定义、计算公式、数据来源

Step 4：搭建监控报表
通过Tableau/Power BI等工具搭建数据看板

【四、实战案例】

以家具行业为例，核心指标体系：
• 销售指标：GMV、订单量、客单价、毛利率
• 产品指标：SKU数、动销率、畅销/滞销占比
• 库存指标：库存周转天数、库龄结构、呆滞库存率
• 客户指标：新客数、老客复购率、客满意度

【总结】

指标体系不是一成不变的，需要随着业务发展不断迭代优化。建议每月进行一次指标复盘，确保指标体系始终服务于业务决策。

【下期预告】

下一篇文章将分享《SQL进阶：多表关联与复杂查询实战技巧》，敬请期待！`,
            category: '数据分析方法论',
            tags: '数据分析,电商,指标体系,SQL'
        },
        {
            title: 'SQL进阶：多表关联与复杂查询实战技巧',
            content: `【前言】

SQL是数据分析师的核心技能之一。本文分享实际工作中常用的SQL复杂查询技巧，提升数据提取效率。

【一、基础回顾】

常用聚合函数：COUNT、SUM、AVG、MAX、MIN
分组聚合：GROUP BY + HAVING
排序筛选：ORDER BY、LIMIT

【二、多表关联】

一）INNER JOIN - 只返回两表匹配的记录

\`\`\`sql
SELECT a.order_id, a.amount, b.customer_name
FROM orders a
INNER JOIN customers b ON a.customer_id = b.id
WHERE a.status = 'completed';
\`\`\`

二）LEFT JOIN - 返回左表所有记录

\`\`\`sql
SELECT a.order_id, a.amount, b.customer_name
FROM orders a
LEFT JOIN customers b ON a.customer_id = b.id;
\`\`\`

三）多表关联实战

\`\`\`sql
SELECT
    c.category_name,
    p.product_name,
    SUM(s.amount) as total_sales,
    COUNT(DISTINCT o.order_id) as order_count
FROM sales s
LEFT JOIN products p ON s.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN orders o ON s.order_id = o.id
WHERE s.sale_date >= '2025-01-01'
GROUP BY c.category_name, p.product_name
HAVING SUM(s.amount) > 10000
ORDER BY total_sales DESC;
\`\`\`

【三、窗口函数】

一）ROW_NUMBER() - 排名

\`\`\`sql
SELECT
    product_name,
    sales_amount,
    ROW_NUMBER() OVER (ORDER BY sales_amount DESC) as rank
FROM products;
\`\`\`

二）LAG()/LEAD() - 前后行数据

\`\`\`sql
SELECT
    sale_date,
    daily_sales,
    LAG(daily_sales, 1) OVER (ORDER BY sale_date) as yesterday_sales,
    LEAD(daily_sales, 1) OVER (ORDER BY sale_date) as tomorrow_sales
FROM daily_sales;
\`\`\`

三）SUM() OVER - 累计求和

\`\`\`sql
SELECT
    sale_date,
    daily_sales,
    SUM(daily_sales) OVER (ORDER BY sale_date) as cumulative_sales
FROM daily_sales;
\`\`\`

【四、常用优化技巧】

1. 避免SELECT *，只查需要的字段
2. WHERE条件尽量在JOIN前过滤
3. 使用EXPLAIN查看执行计划
4. 合理创建索引
5. 避免嵌套子查询，用WITH CTE替代

【五、实战练习】

练习1：计算每个部门的月均销售额
练习2：找出连续3天以上销售额增长的日期
练习3：计算每个品类的销售额占比

【总结】

SQL是数据分析师的硬技能，需要持续练习和实战。建议每天写3-5条复杂SQL，保持手感。`,
            category: '数据分析方法论',
            tags: 'SQL,数据分析,查询优化'
        },
        {
            title: '数据可视化避坑指南：让图表会说话',
            content: `【前言】

好的数据可视化能让数据"会说话"。本文从图表选择、配色搭配、信息层级三个维度，讲解如何制作专业、易读的数据可视化报表。

【一、图表选择原则】

一）根据分析目的选择

| 分析目的 | 推荐图表 |
|---------|---------|
| 趋势分析 | 折线图、面积图 |
| 比较分析 | 柱状图、条形图 |
| 构成分析 | 饼图、环形图、堆叠柱状图 |
| 关联分析 | 散点图、气泡图 |
| 分布分析 | 直方图、箱线图 |
| 地理数据 | 地图、热力图 |

二）常见错误

❌ 避免用饼图比较超过5个分类
❌ 避免用3D图表，造成视觉误差
❌ 避免用双Y轴，容易误导

【二、配色搭配技巧】

一）配色原则

1. 整体配色不超过5种颜色
2. 使用渐变色表示数值大小
3. 重要数据用醒目颜色突出
4. 考虑色盲友好（避免红绿搭配）

二）推荐配色方案

马卡龙色系（适合温柔、清新风格）：
• 主色：#FFB5C5（粉）
• 辅助：#A8D8EA（蓝）、#B5EAD7（绿）

莫兰迪色系（适合高级、简约风格）：
• 主色：#8B9A9B
• 辅助：#B5C4C5、#D4C5B5

【三、信息层级设计】

一）标题
• 清晰表达图表核心信息
• 避免模糊标题如"数据趋势图"

二）坐标轴
• 坐标轴标签清晰
• 单位标注明确
• 网格线适度使用

三）图例
• 图例位置合理
• 避免过多分类
• 使用图标辅助识别

【四、实战案例】

案例：月销售额分析仪表盘

布局设计：
• 顶部：核心KPI卡片（GMV、订单量、客单价）
• 中部：趋势图（折线图）+ 品类构成（环形图）
• 底部：TOP10产品排行（条形图）

【总结】

数据可视化是数据分析的"最后一公里"，让数据真正为业务决策赋能。`,
            category: '数据分析方法论',
            tags: '数据可视化,Tableau,图表设计'
        },
        {
            title: '销售数据分析实战：从数据清洗到洞察输出',
            content: `【前言】

本文以家具行业销售数据为例，完整演示数据分析全流程：数据清洗→多维度分析→问题挖掘→建议输出。

【一、数据清洗】

一）常见问题

• 缺失值处理
• 异常值检测
• 重复数据去除
• 数据类型转换

二）Python清洗代码示例

\`\`\`python
import pandas as pd
import numpy as np

# 读取数据
df = pd.read_excel('sales_data.xlsx')

# 处理缺失值
df['amount'].fillna(df['amount'].median(), inplace=True)
df['customer'].fillna('未知客户', inplace=True)

# 异常值检测（3σ原则）
mean = df['amount'].mean()
std = df['amount'].std()
df = df[(df['amount'] >= mean - 3*std) & (df['amount'] <= mean + 3*std)]

# 去除重复
df.drop_duplicates(inplace=True)

# 数据类型转换
df['sale_date'] = pd.to_datetime(df['sale_date'])
\`\`\`

【二、多维度分析】

一）时间维度
• 月度/季度/年度趋势
• 同比/环比增长率
• 季节性波动分析

二）产品维度
• 品类销售额排行
• 单品销量TOP10
• 滞销产品分析

三）区域维度
• 大区销售贡献
• 区域增速对比
• 区域TOP产品

四）客户维度
• 新客/老客占比
• 客户等级分布
• 流失预警

【三、问题挖掘】

通过分析，我们发现以下问题：

问题1：A大区销售额连续3个月下滑
问题2：办公椅品类客单价下降5%
问题3：B大区新客转化率低于均值

【四、建议输出】

建议1：A大区专项调研
建议2：办公椅定价策略调整
建议3：B大区获客渠道优化

【总结】

数据分析不是目的，解决问题才是。每一份分析报告都要有明确的业务建议。`,
            category: '电商零售业务分析',
            tags: '数据分析,销售分析,Python,实战'
        },
        {
            title: '竞品分析方法论：如何做一次专业的竞品调研？',
            content: `【前言】

本文结合CIFF展会调研经验，讲解竞品调研的标准流程与方法论。

【一、竞品调研准备】

一）明确调研目的
• 了解市场竞争格局
• 寻找产品改进方向
• 制定定价策略
• 发现市场机会

二）确定竞品范围
• 直接竞品：同类产品、同价位
• 间接竞品：替代品、不同价位
• 标杆竞品：行业领导者

【二、数据收集方法】

一）一手数据
• 展会/门店实地走访
• 深度访谈（销售、客户）
• 问卷调查

二）二手数据
• 官网/电商平台
• 行业报告
• 社交媒体
• 海关数据

【三、CIFF展会调研实战】

调研维度：
• 产品线布局
• 定价体系
• 目标市场
• 设计风格
• 渠道策略

收集数据：
• 产品手册
• 价格表
• 宣传资料
• 销售人员沟通

【四、分析框架】

一）产品力分析
• 外观设计
• 功能配置
• 材质工艺
• 性价比

二）价格带分析
• 各价格段产品分布
• 性价比对比

三）渠道策略分析
• 线上/线下布局
• 工程/零售占比

【五、报告输出】

PPT结构建议：
1. 调研背景与目的
2. 市场概况
3. 竞品分析（多维度）
4. 机会与威胁
5. 策略建议

【总结】

竞品调研是数据分析师的必备技能，需要系统的方法论+丰富的实战经验。`,
            category: '电商零售业务分析',
            tags: '竞品分析,市场调研,方法论'
        },
        {
            title: '库存周转分析：如何搭建实用的库存监控指标体系？',
            content: `【前言】

库存管理是电商/零售的核心环节。本文分享库存周转率、库龄结构、呆滞库存等核心指标的定义与计算方法。

【一、核心指标定义】

一）库存周转率
公式：库存周转率 = 销售成本 / 平均库存
意义：反映库存周转速度，越高越好

二）库存周转天数
公式：库存周转天数 = 365 / 库存周转率
意义：库存平均多少天售出

三）库龄结构
• 0-30天：正常库存
• 30-90天：预警库存
• 90-180天：积压库存
• 180天以上：呆滞库存

【二、指标计算SQL】

\`\`\`sql
-- 库存周转率计算
SELECT
    product_category,
    SUM(sale_cost) as total_cost,
    AVG库存余额 as avg_stock,
    SUM(sale_cost) / AVG(库存余额) as turnover_rate
FROM inventory
WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY product_category;

-- 库龄结构分析
SELECT
    CASE
        WHEN DATEDIFF(CURDATE(), import_date) <= 30 THEN '0-30天'
        WHEN DATEDIFF(CURDATE(), import_date) <= 90 THEN '30-90天'
        WHEN DATEDIFF(CURDATE(), import_date) <= 180 THEN '90-180天'
        ELSE '180天以上'
    END as 库龄区间,
    COUNT(*) as SKU数量,
    SUM(stock_qty) as 库存数量
FROM inventory
GROUP BY 库龄区间;
\`\`\`

【三、Tableau可视化看板】

建议看板布局：
• KPI卡片：周转率、周转天数、呆滞率
• 折线图：月度周转趋势
• 堆叠柱状图：库龄结构分布
• 表格：呆滞库存明细

【四、优化建议】

1. 设置安全库存上下限
2. 建立预警机制
3. 定期清理呆滞库存
4. 优化补货策略

【总结】

库存指标体系是数据分析赋能业务的重要场景，需要持续优化迭代。`,
            category: '电商零售业务分析',
            tags: '库存管理,指标体系,SQL,Tableau'
        },
        {
            title: '用户行为分析：如何用数据驱动产品迭代？',
            content: `【前言】

用户行为分析是产品运营的核心。本文讲解事件埋点、路径分析、漏斗分析等基本方法。

【一、事件埋点设计】

一）基础事件
• 页面浏览（PV/UV）
• 点击事件
• 表单提交
• 搜索行为

二）业务事件
• 注册/登录
• 下单/支付
• 加购/收藏
• 分享/评价

三）埋点规范
• 事件名称统一
• 属性定义清晰
• 数据格式标准化

【二、路径分析】

一）用户路径查看
• 主要路径 vs 实际路径
• 路径分叉点分析
• 流失环节识别

二）常用SQL

\`\`\`sql
-- 用户关键行为路径分析
SELECT
    a.user_id,
    MAX(CASE WHEN event = '首页' THEN timestamp END) as t1,
    MAX(CASE WHEN event = '搜索' THEN timestamp END) as t2,
    MAX(CASE WHEN event = '详情页' THEN timestamp END) as t3,
    MAX(CASE WHEN event = '加购' THEN timestamp END) as t4,
    MAX(CASE WHEN event = '下单' THEN timestamp END) as t5
FROM user_events
GROUP BY user_id
HAVING t1 IS NOT NULL AND t5 IS NOT NULL;
\`\`\`

【三、漏斗分析】

一）核心漏斗
• 访问→注册
• 注册→首单
• 首单→复购

二）漏斗计算

\`\`\`sql
WITH funnels AS (
    SELECT '访问' as stage, COUNT(DISTINCT user_id) as users FROM events WHERE event = '首页'
    UNION ALL
    SELECT '加购', COUNT(DISTINCT user_id) FROM events WHERE event = '加购'
    UNION ALL
    SELECT '下单', COUNT(DISTINCT user_id) FROM events WHERE event = '下单'
    UNION ALL
    SELECT '支付', COUNT(DISTINCT user_id) FROM events WHERE event = '支付'
)
SELECT
    stage,
    users,
    LAG(users) as 上一步人数,
    CAST(users AS FLOAT) / LAG(users) OVER (ORDER BY stage) as 转化率
FROM funnels;
\`\`\`

【四、产品优化建议】

1. 缩短核心路径
2. 优化流失环节
3. 提升关键触点体验
4. 个性化推荐

【总结】

用户行为分析是数据驱动产品迭代的基础，需要产品、运营、数据多方协同。`,
            category: '电商零售业务分析',
            tags: '用户行为,数据分析,产品优化'
        },
        {
            title: '数据分析师简历怎么写？附真实案例解析',
            content: `【前言】

简历是求职的敲门砖。本文结合我的求职经验，讲解数据分析师简历的撰写技巧。

【一、简历结构】

建议顺序：
1. 个人 summary（3-5句话）
2. 核心技能（技术栈）
3. 工作经历
4. 项目经历
5. 教育背景
6. 证书技能

【二、核心要点】

一）量化业绩
❌ 负责数据分析工作
✅ 累计处理业务数据8000+条，输出分析报告800+次，支持20+次管理层决策

二）突出技能
• SQL、Python、Tableau、Power BI
• 数据清洗、可视化、报告撰写
• 指标体系搭建、专题分析

三）匹配JD
• 仔细阅读目标JD
• 关键词匹配
• 项目经历对标

【三、工作经历写法】

公式：动词 + 工作内容 + 方法/工具 + 量化结果

案例：
• 负责海外部门月度/季度/年度销售数据复盘，从产品品类、销售大区、定价体系等多维度下钻分析，精准挖掘销售痛点与增长机会，累计输出报告100+次
• 依托海关外部数据挖掘海外市场机会增长点，分析5000+条记录，输出市场分析报告8份，挖掘机会点15+个

【四、常见问题】

Q：没有大厂经验怎么办？
A：突出项目经验、数据量级、业务理解

Q：技术栈不够怎么办？
A：强调业务分析能力、报告输出能力

Q：转行怎么写？
A：突出可迁移技能、相关项目经历

【五、简历检查清单】

□ 量化数据是否清晰
□ 技术栈是否与JD匹配
□ 项目经历是否突出业务价值
□ 格式是否专业、一致
□ 是否有错别字

【总结】

好简历 = 清晰结构 + 量化业绩 + JD匹配 + 专业表达`,
            category: '求职与发展',
            tags: '求职,简历,数据分析师'
        },
        {
            title: '面试高频问题解析：数据分析师面试常见问题及回答思路',
            content: `【前言】

本文整理数据分析师面试常见的20+问题，提供回答思路与参考范例。

【一、自我介绍类】

Q：请做一个自我介绍
A：我是Amber，吉林财经大学经济统计学专业，1年+家具企业数据分析经验。熟悉SQL、Excel、Python、Tableau，负责海外事业部销售数据分析工作，累计处理数据8000+条，输出报告800+次。

【二、技术问题类】

Q：SQL如何优化查询速度？
A：1. 避免SELECT *，只查需要的字段
2. WHERE条件在JOIN前过滤
3. 创建合适索引
4. 避免嵌套子查询
5. 用EXPLAIN查看执行计划

Q：如何处理缺失值和异常值？
A：缺失值：删除法、均值填充、模型预测
异常值：3σ原则、IQR方法、业务定义

Q：Tableau和Power BI有什么区别？
A：Tableau可视化更强，适合复杂报表；Power BI与Excel集成好，上手快

【三、业务场景类】

Q：如何分析GMV下降的原因？
A：1. 确认数据准确性
2. 拆解维度（时间/品类/区域/用户）
3. 假设检验
4. 归因分析
5. 提出建议

Q：如何衡量活动效果？
A：1. 设定核心指标（GMV、转化率、ROI）
2. A/B测试
3. 同期对比
4. 用户调研

【四、行为面试类】

Q：遇到业务方质疑你的分析结果怎么办？
A：1. 保持冷静，用数据说话
2. 复盘分析过程
3. 主动沟通确认业务理解
4. 必要时调整分析维度

Q：如何推动数据分析落地？
A：1. 明确业务痛点
2. 用业务语言沟通
3. 给出可执行建议
4. 持续跟踪效果

【五、反问环节】

建议问题：
• 团队数据分析师有多少人？
• 主要分析哪些业务？
• 用的技术栈是什么？
• 汇报对象是谁？

【总结】

面试是双向选择，展现专业能力的同时，也要判断岗位是否适合自己。`,
            category: '求职与发展',
            tags: '求职,面试,数据分析师'
        },
        {
            title: 'Python数据分析入门：Pandas常用操作速查表',
            content: `【前言】

本文整理Pandas数据清洗、筛选、聚合、合并等常用操作，形成速查表，方便日常查阅。

【一、数据读取】

\`\`\`python
import pandas as pd

# 读取Excel
df = pd.read_excel('data.xlsx')

# 读取CSV
df = pd.read_csv('data.csv')

# 读取SQL
df = pd.read_sql('SELECT * FROM sales', con=engine)
\`\`\`

【二、数据查看】

\`\`\`python
df.head(10)         # 查看前10行
df.tail(5)          # 查看后5行
df.info()           # 数据类型、缺失值
df.describe()       # 统计描述
df.shape            # 行列数
df.columns          # 列名
\`\`\`

【三、数据选择】

\`\`\`python
# 选择列
df['name']
df[['name', 'age']]

# 条件筛选
df[df['age'] > 25]
df[(df['age'] > 25) & (df['city'] == '北京')]

# iloc/ loc
df.iloc[0:5, 0:3]      # 位置索引
df.loc[0:5, ['name', 'age']]  # 标签索引
\`\`\`

【四、数据清洗】

\`\`\`python
# 缺失值
df.isnull().sum()           # 统计缺失
df.dropna()                 # 删除缺失行
df.fillna(0)                # 填充0
df.fillna(df.mean())        # 填充均值

# 去重
df.drop_duplicates()

# 数据类型
df['date'] = pd.to_datetime(df['date'])
df['price'] = df['price'].astype(int)
\`\`\`

【五、数据聚合】

\`\`\`python
# 分组聚合
df.groupby('city')['sales'].sum()
df.groupby(['city', 'product'])['sales'].agg(['sum', 'mean', 'count'])

# 透视表
pd.pivot_table(df, values='sales', index='city', columns='product', aggfunc='sum')
\`\`\`

【六、数据合并】

\`\`\`python
# 纵向合并
pd.concat([df1, df2])

# 横向合并
pd.merge(df1, df2, on='order_id', how='left')
\`\`\`

【七、常用函数】

\`\`\`python
# 排序
df.sort_values('sales', ascending=False)

# 重命名
df.rename(columns={'old': 'new'})

# 替换
df['status'].replace({'pending': '待处理', 'completed': '已完成'})

# 应用函数
df['price'].apply(lambda x: x * 1.1)
\`\`\`

【八、数据导出】

\`\`\`python
df.to_excel('output.xlsx', index=False)
df.to_csv('output.csv', index=False)
\`\`\`

【总结】

收藏本文，随时查阅！建议结合实际数据多练习。`,
            category: '工具与效率',
            tags: 'Python,Pandas,数据分析,速查表'
        }
    ];

    blogs.forEach(blog => {
        db.run('INSERT INTO blogs (title, content, category, tags, status) VALUES (?, ?, ?, ?, ?)',
            [blog.title, blog.content, blog.category, blog.tags, 'published']);
    });
    console.log('✅ 博客文章填充完成');

    // ============ 保存数据库 ============
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                                                            ║');
    console.log('║   ✅ 数据填充完成！                                        ║');
    console.log('║                                                            ║');
    console.log('║   已填充内容：                                              ║');
    console.log('║   • 配置信息：15条                                          ║');
    console.log('║   • 社交链接：3条                                           ║');
    console.log('║   • 技能特长：15条                                          ║');
    console.log('║   • 项目作品：6个                                           ║');
    console.log('║   • 博客文章：10篇                                          ║');
    console.log('║                                                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    process.exit(0);
}

populateData().catch(err => {
    console.error('填充失败:', err);
    process.exit(1);
});
