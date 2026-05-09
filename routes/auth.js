/**
 * 认证路由
 * 处理用户登录、注册、登出
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = 'amber-portfolio-secret-key-2024';
const JWT_EXPIRES = '7d';

// JWT 中间件
function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: '未登录' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: '登录已过期' });
    }
}

// 管理员中间件
function adminMiddleware(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: '权限不足' });
    }
    next();
}

/**
 * POST /api/auth/login
 * 用户登录
 */
router.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({ success: false, message: '请输入用户名和密码' });
        }

        // 验证用户
        const user = db.verifyUser(username, password);
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }

        // 生成 JWT
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        // 设置 Cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
            sameSite: 'lax'
        });

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: { id: user.id, username: user.username, role: user.role }
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: '登录失败' });
    }
});

/**
 * POST /api/auth/logout
 * 用户登出
 */
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true, message: '已退出登录' });
});

/**
 * GET /api/auth/check
 * 检查登录状态
 */
router.get('/check', (req, res) => {
    const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
        return res.json({ success: true, loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({
            success: true,
            loggedIn: true,
            user: { id: decoded.id, username: decoded.username, role: decoded.role }
        });
    } catch (error) {
        res.json({ success: true, loggedIn: false });
    }
});

/**
 * GET /api/auth/user
 * 获取当前用户信息
 */
router.get('/user', authMiddleware, (req, res) => {
    const user = db.getUserById(req.user.id);
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, message: '用户不存在' });
    }
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;
module.exports.adminMiddleware = adminMiddleware;
