/**
 * 博客路由
 * 处理博客文章的增删改查
 */

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authMiddleware, adminMiddleware } = require('./auth');

/**
 * GET /api/blogs
 * 获取所有已发布的博客文章
 */
router.get('/', (req, res) => {
    try {
        const blogs = db.getPublishedBlogs();
        const categories = db.getBlogCategories();
        const tags = db.getBlogTags();

        res.json({
            success: true,
            data: blogs,
            categories,
            tags
        });
    } catch (error) {
        console.error('Get Blogs Error:', error);
        res.status(500).json({ success: false, message: '获取博客失败' });
    }
});

/**
 * GET /api/blogs/all
 * 获取所有博客文章（含草稿）- 需要管理员权限
 */
router.get('/all', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const blogs = db.getAllBlogs();
        res.json({ success: true, data: blogs });
    } catch (error) {
        console.error('Get All Blogs Error:', error);
        res.status(500).json({ success: false, message: '获取博客失败' });
    }
});

/**
 * GET /api/blogs/categories
 * 获取博客分类统计
 */
router.get('/categories', (req, res) => {
    try {
        const categories = db.getBlogCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Get Categories Error:', error);
        res.status(500).json({ success: false, message: '获取分类失败' });
    }
});

/**
 * GET /api/blogs/tags
 * 获取博客标签列表
 */
router.get('/tags', (req, res) => {
    try {
        const tags = db.getBlogTags();
        res.json({ success: true, data: tags });
    } catch (error) {
        console.error('Get Tags Error:', error);
        res.status(500).json({ success: false, message: '获取标签失败' });
    }
});

/**
 * GET /api/blogs/:id
 * 获取单篇博客文章
 */
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;
        const blog = db.getBlogById(parseInt(id));

        if (!blog) {
            return res.status(404).json({ success: false, message: '文章不存在' });
        }

        // 增加浏览量
        db.incrementBlogViews(parseInt(id));

        res.json({ success: true, data: blog });
    } catch (error) {
        console.error('Get Blog Error:', error);
        res.status(500).json({ success: false, message: '获取文章失败' });
    }
});

/**
 * POST /api/blogs
 * 创建博客文章 - 需要管理员权限
 */
router.post('/', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { title, content, category, tags, status } = req.body;

        // 验证输入
        if (!title || !content) {
            return res.status(400).json({ success: false, message: '标题和内容不能为空' });
        }

        if (title.length > 200) {
            return res.status(400).json({ success: false, message: '标题不能超过200个字符' });
        }

        const result = db.createBlog({ title, content, category, tags, status });

        if (result.success) {
            res.json({
                success: true,
                message: '文章创建成功',
                data: { id: result.id }
            });
        } else {
            res.status(500).json({ success: false, message: '创建失败' });
        }
    } catch (error) {
        console.error('Create Blog Error:', error);
        res.status(500).json({ success: false, message: '创建失败' });
    }
});

/**
 * PUT /api/blogs/:id
 * 更新博客文章 - 需要管理员权限
 */
router.put('/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category, tags, status } = req.body;

        // 验证输入
        if (!title || !content) {
            return res.status(400).json({ success: false, message: '标题和内容不能为空' });
        }

        const success = db.updateBlog(parseInt(id), { title, content, category, tags, status });

        if (success) {
            res.json({ success: true, message: '更新成功' });
        } else {
            res.status(404).json({ success: false, message: '文章不存在' });
        }
    } catch (error) {
        console.error('Update Blog Error:', error);
        res.status(500).json({ success: false, message: '更新失败' });
    }
});

/**
 * DELETE /api/blogs/:id
 * 删除博客文章 - 需要管理员权限
 */
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteBlog(parseInt(id));

        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '文章不存在' });
        }
    } catch (error) {
        console.error('Delete Blog Error:', error);
        res.status(500).json({ success: false, message: '删除失败' });
    }
});

module.exports = router;
