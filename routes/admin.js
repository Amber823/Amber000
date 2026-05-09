/**
 * 管理后台路由
 * 处理配置、作品、技能、社交链接等管理功能
 */

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const db = require('../db/database');
const { authMiddleware, adminMiddleware } = require('./auth');

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../public/assets/uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// 通用图片上传（头像、关于照片）
const uploadImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片文件'));
        }
    }
});

// 文件上传（作品支持图片、PDF、Word）
const uploadFile = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetypes = /image\/(jpeg|jpg|png|gif|webp)|application\/pdf|application\/(msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/;
        if (extname || mimetypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('只支持图片、PDF、Word文件'));
        }
    }
});

// 所有管理路由都需要管理员权限
router.use(authMiddleware, adminMiddleware);

/**
 * ============ 配置管理 ============
 */

/**
 * GET /api/admin/config
 * 获取所有配置
 */
router.get('/config', (req, res) => {
    try {
        const config = db.getAllConfig();
        res.json({ success: true, data: config });
    } catch (error) {
        console.error('Get Config Error:', error);
        res.status(500).json({ success: false, message: '获取配置失败' });
    }
});

/**
 * PUT /api/admin/config
 * 批量更新配置
 */
router.put('/config', (req, res) => {
    try {
        const configs = req.body;
        db.updateConfigs(configs);
        res.json({ success: true, message: '配置已更新' });
    } catch (error) {
        console.error('Update Config Error:', error);
        res.status(500).json({ success: false, message: '更新配置失败' });
    }
});

/**
 * POST /api/admin/config/upload
 * 上传头像或其他图片
 */
router.post('/config/upload', uploadImage.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '请选择图片文件' });
        }

        const imageUrl = `/assets/uploads/${req.file.filename}`;
        res.json({ success: true, message: '上传成功', data: { url: imageUrl } });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ success: false, message: '上传失败' });
    }
});

/**
 * ============ 作品管理 ============
 */

/**
 * GET /api/admin/works
 * 获取所有作品
 */
router.get('/works', (req, res) => {
    try {
        const works = db.getAllWorks();
        res.json({ success: true, data: works });
    } catch (error) {
        console.error('Get Works Error:', error);
        res.status(500).json({ success: false, message: '获取作品失败' });
    }
});

/**
 * POST /api/admin/works
 * 添加作品
 */
router.post('/works', (req, res) => {
    try {
        const { title, description, image_url, link, tags } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: '作品标题不能为空' });
        }

        const result = db.addWork({ title, description, image_url, link, tags });
        res.json({ success: true, message: '作品添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Work Error:', error);
        res.status(500).json({ success: false, message: '添加作品失败' });
    }
});

/**
 * PUT /api/admin/works/:id
 * 更新作品
 */
router.put('/works/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, link, tags } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: '作品标题不能为空' });
        }

        const success = db.updateWork(parseInt(id), { title, description, image_url, link, tags });

        if (success) {
            res.json({ success: true, message: '作品已更新' });
        } else {
            res.status(404).json({ success: false, message: '作品不存在' });
        }
    } catch (error) {
        console.error('Update Work Error:', error);
        res.status(500).json({ success: false, message: '更新作品失败' });
    }
});

/**
 * DELETE /api/admin/works/:id
 * 删除作品
 */
router.delete('/works/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteWork(parseInt(id));

        if (success) {
            res.json({ success: true, message: '作品已删除' });
        } else {
            res.status(404).json({ success: false, message: '作品不存在' });
        }
    } catch (error) {
        console.error('Delete Work Error:', error);
        res.status(500).json({ success: false, message: '删除作品失败' });
    }
});

/**
 * POST /api/admin/works/upload
 * 上传作品文件（图片、PDF、Word）
 */
router.post('/works/upload', uploadFile.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '请选择文件' });
        }

        const fileUrl = `/assets/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype;

        res.json({
            success: true,
            message: '上传成功',
            data: {
                url: fileUrl,
                type: fileType.startsWith('image/') ? 'image' : 'document',
                filename: req.file.originalname
            }
        });
    } catch (error) {
        console.error('Upload Work File Error:', error);
        res.status(500).json({ success: false, message: '上传失败' });
    }
});

/**
 * ============ 技能管理 ============
 */

/**
 * GET /api/admin/skills
 * 获取所有技能
 */
router.get('/skills', (req, res) => {
    try {
        const skills = db.getAllSkills();
        res.json({ success: true, data: skills });
    } catch (error) {
        console.error('Get Skills Error:', error);
        res.status(500).json({ success: false, message: '获取技能失败' });
    }
});

/**
 * POST /api/admin/skills
 * 添加技能
 */
router.post('/skills', (req, res) => {
    try {
        const { name, level, category } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: '技能名称不能为空' });
        }

        const result = db.addSkill({ name, level: parseInt(level) || 50, category: category || '技能' });
        res.json({ success: true, message: '技能添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Skill Error:', error);
        res.status(500).json({ success: false, message: '添加技能失败' });
    }
});

/**
 * PUT /api/admin/skills/:id
 * 更新技能
 */
router.put('/skills/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, level, category } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: '技能名称不能为空' });
        }

        const success = db.updateSkill(parseInt(id), { name, level: parseInt(level) || 50, category: category || '技能' });

        if (success) {
            res.json({ success: true, message: '技能已更新' });
        } else {
            res.status(404).json({ success: false, message: '技能不存在' });
        }
    } catch (error) {
        console.error('Update Skill Error:', error);
        res.status(500).json({ success: false, message: '更新技能失败' });
    }
});

/**
 * DELETE /api/admin/skills/:id
 * 删除技能
 */
router.delete('/skills/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteSkill(parseInt(id));

        if (success) {
            res.json({ success: true, message: '技能已删除' });
        } else {
            res.status(404).json({ success: false, message: '技能不存在' });
        }
    } catch (error) {
        console.error('Delete Skill Error:', error);
        res.status(500).json({ success: false, message: '删除技能失败' });
    }
});

/**
 * ============ 社交链接管理 ============
 */

/**
 * GET /api/admin/socials
 * 获取所有社交链接
 */
router.get('/socials', (req, res) => {
    try {
        const socials = db.getAllSocials();
        res.json({ success: true, data: socials });
    } catch (error) {
        console.error('Get Socials Error:', error);
        res.status(500).json({ success: false, message: '获取社交链接失败' });
    }
});

/**
 * POST /api/admin/socials
 * 添加社交链接
 */
router.post('/socials', (req, res) => {
    try {
        const { platform, url, icon } = req.body;

        if (!platform || !url) {
            return res.status(400).json({ success: false, message: '平台和链接不能为空' });
        }

        const result = db.addSocial({ platform, url, icon: icon || 'fa-link' });
        res.json({ success: true, message: '社交链接添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Social Error:', error);
        res.status(500).json({ success: false, message: '添加社交链接失败' });
    }
});

/**
 * DELETE /api/admin/socials/:id
 * 删除社交链接
 */
router.delete('/socials/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteSocial(parseInt(id));

        if (success) {
            res.json({ success: true, message: '社交链接已删除' });
        } else {
            res.status(404).json({ success: false, message: '社交链接不存在' });
        }
    } catch (error) {
        console.error('Delete Social Error:', error);
        res.status(500).json({ success: false, message: '删除社交链接失败' });
    }
});

/**
 * ============ 统计数据 ============
 */

/**
 * GET /api/admin/stats
 * 获取管理统计数据
 */
router.get('/stats', (req, res) => {
    try {
        const totalStats = db.getTotalStats();
        const recentStats = db.getStats(30);
        const pendingMessages = db.getPendingMessageCount();

        res.json({
            success: true,
            data: {
                ...totalStats,
                pendingMessages,
                recentStats
            }
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ success: false, message: '获取统计数据失败' });
    }
});

/**
 * ============ 工作经历管理 ============
 */

router.get('/experiences', (req, res) => {
    try {
        const experiences = db.getAllExperiences();
        res.json({ success: true, data: experiences });
    } catch (error) {
        console.error('Get Experiences Error:', error);
        res.status(500).json({ success: false, message: '获取工作经历失败' });
    }
});

router.post('/experiences', (req, res) => {
    try {
        const { type, title, company, location, start_date, end_date, current, description, achievements } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: '职位名称不能为空' });
        }
        const result = db.addExperience({ type, title, company, location, start_date, end_date, current, description, achievements });
        res.json({ success: true, message: '添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Experience Error:', error);
        res.status(500).json({ success: false, message: '添加工作经历失败' });
    }
});

router.put('/experiences/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, company, location, start_date, end_date, current, description, achievements } = req.body;
        if (!title) {
            return res.status(400).json({ success: false, message: '职位名称不能为空' });
        }
        const success = db.updateExperience(parseInt(id), { type, title, company, location, start_date, end_date, current, description, achievements });
        if (success) {
            res.json({ success: true, message: '更新成功' });
        } else {
            res.status(404).json({ success: false, message: '工作经历不存在' });
        }
    } catch (error) {
        console.error('Update Experience Error:', error);
        res.status(500).json({ success: false, message: '更新工作经历失败' });
    }
});

router.delete('/experiences/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteExperience(parseInt(id));
        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '工作经历不存在' });
        }
    } catch (error) {
        console.error('Delete Experience Error:', error);
        res.status(500).json({ success: false, message: '删除工作经历失败' });
    }
});

/**
 * ============ 教育经历管理 ============
 */

router.get('/education', (req, res) => {
    try {
        const education = db.getAllEducation();
        res.json({ success: true, data: education });
    } catch (error) {
        console.error('Get Education Error:', error);
        res.status(500).json({ success: false, message: '获取教育经历失败' });
    }
});

router.post('/education', (req, res) => {
    try {
        const { school, degree, major, start_date, end_date, gpa, description } = req.body;
        if (!school) {
            return res.status(400).json({ success: false, message: '学校名称不能为空' });
        }
        const result = db.addEducation({ school, degree, major, start_date, end_date, gpa, description });
        res.json({ success: true, message: '添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Education Error:', error);
        res.status(500).json({ success: false, message: '添加教育经历失败' });
    }
});

router.put('/education/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { school, degree, major, start_date, end_date, gpa, description } = req.body;
        if (!school) {
            return res.status(400).json({ success: false, message: '学校名称不能为空' });
        }
        const success = db.updateEducation(parseInt(id), { school, degree, major, start_date, end_date, gpa, description });
        if (success) {
            res.json({ success: true, message: '更新成功' });
        } else {
            res.status(404).json({ success: false, message: '教育经历不存在' });
        }
    } catch (error) {
        console.error('Update Education Error:', error);
        res.status(500).json({ success: false, message: '更新教育经历失败' });
    }
});

router.delete('/education/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteEducation(parseInt(id));
        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '教育经历不存在' });
        }
    } catch (error) {
        console.error('Delete Education Error:', error);
        res.status(500).json({ success: false, message: '删除教育经历失败' });
    }
});

/**
 * ============ 项目经历管理 ============
 */

router.get('/projects', (req, res) => {
    try {
        const projects = db.getAllProjects();
        res.json({ success: true, data: projects });
    } catch (error) {
        console.error('Get Projects Error:', error);
        res.status(500).json({ success: false, message: '获取项目经历失败' });
    }
});

router.post('/projects', (req, res) => {
    try {
        const { name, role, start_date, end_date, description, achievements, technologies } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: '项目名称不能为空' });
        }
        const result = db.addProject({ name, role, start_date, end_date, description, achievements, technologies });
        res.json({ success: true, message: '添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Project Error:', error);
        res.status(500).json({ success: false, message: '添加项目经历失败' });
    }
});

router.put('/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, role, start_date, end_date, description, achievements, technologies } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: '项目名称不能为空' });
        }
        const success = db.updateProject(parseInt(id), { name, role, start_date, end_date, description, achievements, technologies });
        if (success) {
            res.json({ success: true, message: '更新成功' });
        } else {
            res.status(404).json({ success: false, message: '项目经历不存在' });
        }
    } catch (error) {
        console.error('Update Project Error:', error);
        res.status(500).json({ success: false, message: '更新项目经历失败' });
    }
});

router.delete('/projects/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteProject(parseInt(id));
        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '项目经历不存在' });
        }
    } catch (error) {
        console.error('Delete Project Error:', error);
        res.status(500).json({ success: false, message: '删除项目经历失败' });
    }
});

/**
 * ============ 证书荣誉管理 ============
 */

router.get('/certificates', (req, res) => {
    try {
        const certificates = db.getAllCertificates();
        res.json({ success: true, data: certificates });
    } catch (error) {
        console.error('Get Certificates Error:', error);
        res.status(500).json({ success: false, message: '获取证书荣誉失败' });
    }
});

router.post('/certificates', (req, res) => {
    try {
        const { name, type, issuer, date, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: '证书名称不能为空' });
        }
        const result = db.addCertificate({ name, type, issuer, date, description });
        res.json({ success: true, message: '添加成功', data: { id: result.id } });
    } catch (error) {
        console.error('Add Certificate Error:', error);
        res.status(500).json({ success: false, message: '添加证书荣誉失败' });
    }
});

router.put('/certificates/:id', (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, issuer, date, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: '证书名称不能为空' });
        }
        const success = db.updateCertificate(parseInt(id), { name, type, issuer, date, description });
        if (success) {
            res.json({ success: true, message: '更新成功' });
        } else {
            res.status(404).json({ success: false, message: '证书荣誉不存在' });
        }
    } catch (error) {
        console.error('Update Certificate Error:', error);
        res.status(500).json({ success: false, message: '更新证书荣誉失败' });
    }
});

router.delete('/certificates/:id', (req, res) => {
    try {
        const { id } = req.params;
        const success = db.deleteCertificate(parseInt(id));
        if (success) {
            res.json({ success: true, message: '删除成功' });
        } else {
            res.status(404).json({ success: false, message: '证书荣誉不存在' });
        }
    } catch (error) {
        console.error('Delete Certificate Error:', error);
        res.status(500).json({ success: false, message: '删除证书荣誉失败' });
    }
});

/**
 * ============ 数据导入 ============
 */

/**
 * POST /api/admin/import
 * 导入CSV数据
 */
router.post('/import', (req, res) => {
    try {
        const { type, data } = req.body;

        if (!type || !data || !Array.isArray(data)) {
            return res.status(400).json({ success: false, message: '无效的导入数据' });
        }

        const validTypes = ['blogs', 'works', 'skills'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ success: false, message: '无效的数据类型' });
        }

        db.importCSVData(type, data);
        res.json({ success: true, message: `成功导入${data.length}条数据` });
    } catch (error) {
        console.error('Import Error:', error);
        res.status(500).json({ success: false, message: '导入失败' });
    }
});

module.exports = router;
