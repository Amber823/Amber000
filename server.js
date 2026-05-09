/**
 * Amber Portfolio Server
 * Node.js + Express 后端服务器
 * 主入口文件
 */

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// 导入路由
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');
const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');

// 导入数据库模块
const db = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ============ 中间件 ============

// CORS 配置
app.use(cors({
    origin: true,
    credentials: true
}));

// JSON 和 URL 编码解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie 解析
app.use(cookieParser());

// 静态文件服务
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

// ============ 页面路由 ============

// 首页
app.get('/', (req, res) => {
    // 更新每日访问统计
    db.updateDailyStats();
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 管理后台
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 登录页面
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ============ API 路由 ============

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);

// ============ 数据统计 API ============

// 获取站点统计数据
app.get('/api/stats', (req, res) => {
    try {
        const totalStats = db.getTotalStats();
        const recentStats = db.getStats(7);
        res.json({
            success: true,
            data: {
                ...totalStats,
                recentStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取统计数据失败' });
    }
});

// ============ 健康检查 ============

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ 公共配置 API（无需登录）============

app.get('/api/config', (req, res) => {
    try {
        const config = db.getAllConfig();
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
});

// ============ 公共数据 API（无需登录）============

// 获取作品列表
app.get('/api/works', (req, res) => {
    try {
        const works = db.getAllWorks();
        res.json({ success: true, data: works });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取作品失败' });
    }
});

// 获取技能列表
app.get('/api/skills', (req, res) => {
    try {
        const skills = db.getAllSkills();
        res.json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取技能失败' });
    }
});

// 获取工作经历
app.get('/api/experiences', (req, res) => {
    try {
        const experiences = db.getAllExperiences();
        res.json({ success: true, data: experiences });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取工作经历失败' });
    }
});

// 获取教育背景
app.get('/api/education', (req, res) => {
    try {
        const education = db.getAllEducation();
        res.json({ success: true, data: education });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取教育背景失败' });
    }
});

// 获取项目经历
app.get('/api/projects', (req, res) => {
    try {
        const projects = db.getAllProjects();
        res.json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取项目经历失败' });
    }
});

// 获取证书荣誉
app.get('/api/certificates', (req, res) => {
    try {
        const certificates = db.getAllCertificates();
        res.json({ success: true, data: certificates });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取证书荣誉失败' });
    }
});

// 获取社交链接
app.get('/api/socials', (req, res) => {
    try {
        const socials = db.getAllSocials();
        res.json({ success: true, data: socials });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取社交链接失败' });
    }
});

// ============ 错误处理 ============

// 404 处理
app.use((req, res) => {
    res.status(404).json({ success: false, message: '页面不存在' });
});

// 错误中间件
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ success: false, message: '服务器内部错误' });
});

// ============ 启动服务器 ============

async function startServer() {
    // 初始化数据库
    await db.initDatabase();

    app.listen(PORT, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║                                                            ║');
        console.log('║   🌸 Amber Portfolio 服务器已启动                           ║');
        console.log('║                                                            ║');
        console.log(`║   📍 访问地址: http://localhost:${PORT}                      ║`);
        console.log(`║   📍 管理后台: http://localhost:${PORT}/admin                ║`);
        console.log('║                                                            ║');
        console.log('║   🔐 默认账号: admin / admin123                           ║');
        console.log('║                                                            ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
    });
}

startServer().catch(err => {
    console.error('启动服务器失败:', err);
    process.exit(1);
});

module.exports = app;
