/**
 * 留言板路由
 * 处理留言的增删改查
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware, adminMiddleware } = require('./auth');

/**
 * GET /api/messages
 * 获取所有已审核留言
 */
router.get('/', (req, res) => {
    try {
        const messages = db.getApprovedMessages();
        res.json({ success: true, data: messages });
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ success: false, message: '获取留言失败' });
    }
});

/**
 * GET /api/messages/all
 * 获取所有留言（含待审核）- 需要管理员权限
 */
router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const messages = db.getAllMessages();
        const pendingCount = db.getPendingMessageCount();
        res.json({ success: true, data: messages, pendingCount });
    } catch (error) {
        console.error('Get All Messages Error:', error);
        res.status(500).json({ success: false, message: '获取留言失败' });
    }
});

/**
 * POST /api/messages
 * 添加新留言
 */
router.post('/', (req, res) => {
    try {
        const { visitorName, content } = req.body;

        // 验证输入
        if (!visitorName || !content) {
            return res.status(400).json({ success: false, message: '请填写姓名和留言内容' });
        }

        if (visitorName.length > 50) {
            return res.status(400).json({ success: false, message: '姓名不能超过50个字符' });
        }

        if (content.length > 1000) {
            return res.status(400).json({ success: false, message: '留言内容不能超过1000个字符' });
        }

        // 添加留言
        const result = db.addMessage(visitorName.trim(), content.trim());

        if (result.success) {
            res.json({
                success: true,
                message: '留言已提交，等待审核',
                data: { id: result.id }
            });
        } else {
            res.status(500).json({ success: false, message: '留言失败' });
        }
    } catch (error) {
        console.error('Add Message Error:', error);
        res.status(500).json({ success: false, message: '留言失败' });
    }
});

/**
 * PUT /api/messages/:id/status
 * 更新留言状态（审核通过/拒绝）- 需要管理员权限
 */
router.put('/:id/status', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: '无效的状态' });
        }

        const success = db.updateMessageStatus(parseInt(id), status);

        if (success) {
            res.json({ success: true, message: '状态已更新' });
        } else {
            res.status(404).json({ success: false, message: '留言不存在' });
        }
    } catch (error) {
        console.error('Update Message Status Error:', error);
        res.status(500).json({ success: false, message: '更新失败' });
    }
});

/**
 * PUT /api/messages/:id/reply
 * 回复留言 - 需要管理员权限
 */
router.put('/:id/reply', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        if (!reply || reply.length > 500) {
            return res.status(400).json({ success: false, message: '回复内容无效' });
        }

        const success = db.replyMessage(parseInt(id), reply.trim());

        if (success) {
            res.json({ success: true, message: '回复成功' });
        } else {
            res.status(404).json({ success: false, message: '留言不存在' });
        }
    } catch (error) {
        console.error('Reply Message Error:', error);
        res.status(500).json({ success: false, message: '回复失败' });
    }
});

/**
 * DELETE /api/messages/:id
 * 删除留言 - 需要管理员权限
 */
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteMessage(parseInt(id));

        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '留言不存在' });
        }
    } catch (error) {
        console.error('Delete Message Error:', error);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

module.exports = router;
