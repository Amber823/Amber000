# Amber Portfolio - 个人求职博客系统

> 高端动态个人互动网站 | 产品数据分析师 Amber 专属

## 项目简介

这是一个为产品数据分析师 Amber 量身打造的**高端动态个人互动网站**，核心定位为「求职展示+个人博客」。

### 技术栈

- **前端**: HTML5 + Tailwind CSS v3 + 原生 JavaScript
- **后端**: Node.js + Express
- **数据库**: SQLite (轻量级，无需额外安装)
- **图标**: Font Awesome 6
- **样式**: 马卡龙色系 + 玻璃拟态 + 极简分栏风

### 核心特性

- 用户登录鉴权系统（管理员/访客权限分离）
- 留言板持久化存储（支持审核、回复）
- 博客系统（文章发布、分类、标签、浏览统计）
- **完整简历展示**（工作经历、教育背景、项目经历、证书荣誉）
- 作品展示模块
- 技能特长展示
- 实时数据统计面板
- 完整后台管理系统（可管理所有前端内容）
- 数据导入功能（CSV格式）
- 图片上传功能（头像、作品）
- 视差滚动、微交互、骨架屏
- 响应式设计（移动端适配）
- 暗黑模式切换

---

## 快速启动

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务器

```bash
npm start
```

### 3. 访问网站

- **前台首页**: http://localhost:3001
- **管理后台**: http://localhost:3001/admin

---

## 默认账户

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员 | admin | admin123 |

> ⚠️ 请首次登录后立即修改默认密码！

---

## 后台功能

### 1. 数据看板
- 博客文章统计
- 留言统计
- 作品数量
- 总阅读量
- 30天访问趋势图

### 2. 留言管理
- 查看所有留言（含待审核）
- 审核留言（通过/拒绝）
- 回复留言
- 删除留言

### 3. 博客管理
- 创建新文章
- 编辑已有文章
- 设置文章分类和标签
- 发布/草稿状态
- 删除文章

### 4. 工作经历管理
- 添加工作经历
- 编辑职位、公司、时间
- 记录工作成就
- 删除经历

### 5. 教育背景管理
- 添加教育经历
- 编辑学校、学历、专业
- 记录GPA/排名
- 删除经历

### 6. 项目经历管理
- 添加项目经历
- 编辑项目名称、角色、时间
- 记录项目成就和技术栈
- 删除项目

### 7. 证书荣誉管理
- 添加证书或荣誉
- 编辑证书名称、颁发机构、日期
- 区分证书/荣誉类型
- 删除证书

### 8. 作品管理
- 添加作品展示
- 编辑作品信息
- 设置作品链接和标签
- 删除作品

### 9. 技能管理
- 添加技能特长
- 设置熟练度百分比
- 分类管理
- 编辑/删除技能

### 10. 网站配置
- 基本信息（姓名、头衔、简介、邮箱、所在地）
- 网站设置（网站名称、标题、描述）
- 社交链接管理（LinkedIn等）
- 数据导入（CSV格式）

---

## 数据导入格式

### 博客文章 (blogs)
```csv
title,content,category,tags
数据分析入门,这是一篇关于数据分析的文章,数据分析,SQL,Python
```

### 作品展示 (works)
```csv
title,description,image_url,link
电商分析平台,基于Python的电商数据监控平台,/public/assets/work1.jpg,https://example.com
```

### 技能特长 (skills)
```csv
name,level,category
Python,90,编程语言
SQL,95,编程语言
```

---

## 项目结构

```
/
├── public/                 # 前端静态资源
│   ├── index.html          # 主页面
│   ├── admin.html          # 后台管理页面
│   ├── css/
│   │   └── style.css       # 自定义样式
│   ├── js/
│   │   ├── main.js         # 前端交互逻辑
│   │   └── admin.js        # 后台管理逻辑
│   └── assets/             # 静态资源目录
├── db/
│   └── database.js        # 数据库初始化与操作
├── routes/
│   ├── auth.js            # 认证接口
│   ├── message.js         # 留言板接口
│   ├── blog.js            # 博客接口
│   └── admin.js           # 管理后台接口
├── server.js              # 服务器入口
├── package.json           # 依赖配置
└── README.md              # 项目说明
```

---

## 预留填充入口

以下信息可在**后台管理**中直接编辑：

- [x] 姓名：Amber
- [x] 头衔：产品数据分析师
- [x] 个人简介
- [x] 求职意向（期望城市、薪资）
- [x] 邮箱
- [x] 所在地
- [x] **工作经历**（支持增删改查）
- [x] **教育背景**（支持增删改查）
- [x] **项目经历**（支持增删改查）
- [x] **证书荣誉**（支持增删改查）
- [x] 技能标签（支持多分类）
- [x] 作品列表（支持增删改查）
- [x] 个人头像（上传入口）
- [x] 社交链接（LinkedIn等）
- [x] 博客文章（支持富文本）
- [x] 网站名称、标题、描述

---

## API 接口

### 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/check` - 检查登录状态

### 留言板接口
- `GET /api/messages` - 获取已审核留言
- `POST /api/messages` - 提交留言
- `PUT /api/messages/:id/status` - 审核留言
- `PUT /api/messages/:id/reply` - 回复留言
- `DELETE /api/messages/:id` - 删除留言

### 博客接口
- `GET /api/blogs` - 获取博客列表
- `GET /api/blogs/:id` - 获取博客详情
- `POST /api/blogs` - 创建博客
- `PUT /api/blogs/:id` - 更新博客
- `DELETE /api/blogs/:id` - 删除博客

### 管理接口
- `GET /api/admin/config` - 获取配置
- `PUT /api/admin/config` - 更新配置
- `GET /api/admin/experiences` - 获取工作经历
- `POST /api/admin/experiences` - 添加工作经历
- `PUT /api/admin/experiences/:id` - 更新工作经历
- `DELETE /api/admin/experiences/:id` - 删除工作经历
- `GET /api/admin/education` - 获取教育经历
- `POST /api/admin/education` - 添加教育经历
- `PUT /api/admin/education/:id` - 更新教育经历
- `DELETE /api/admin/education/:id` - 删除教育经历
- `GET /api/admin/projects` - 获取项目经历
- `POST /api/admin/projects` - 添加项目经历
- `PUT /api/admin/projects/:id` - 更新项目经历
- `DELETE /api/admin/projects/:id` - 删除项目经历
- `GET /api/admin/certificates` - 获取证书荣誉
- `POST /api/admin/certificates` - 添加证书荣誉
- `PUT /api/admin/certificates/:id` - 更新证书荣誉
- `DELETE /api/admin/certificates/:id` - 删除证书荣誉
- `GET /api/admin/works` - 获取作品列表
- `POST /api/admin/works` - 添加作品
- `PUT /api/admin/works/:id` - 更新作品
- `DELETE /api/admin/works/:id` - 删除作品
- `GET /api/admin/skills` - 获取技能列表
- `POST /api/admin/skills` - 添加技能
- `PUT /api/admin/skills/:id` - 更新技能
- `DELETE /api/admin/skills/:id` - 删除技能
- `GET /api/admin/socials` - 获取社交链接
- `POST /api/admin/socials` - 添加社交链接
- `DELETE /api/admin/socials/:id` - 删除社交链接
- `GET /api/admin/stats` - 获取统计数据
- `POST /api/admin/import` - 导入数据

---

## 视觉规范

### 配色方案
- **主色**: 马卡龙粉 `#FFB5C5`
- **辅助色**: 马卡龙蓝 `#A8D8EA`、马卡龙绿 `#B5EAD7`
- **背景**: 纯白 `#FFFFFF`
- **文字**: 深灰 `#2D3436`

### 玻璃拟态
```css
background: rgba(255, 255, 255, 0.18);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.25);
border-radius: 16px;
```

---

## 部署说明

### 环境要求
- Node.js >= 14.x
- npm >= 6.x

### 生产环境部署

1. 克隆项目
```bash
git clone <repository-url>
cd amber-portfolio
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量（可选）
```bash
export PORT=3001
```

4. 启动服务
```bash
npm start
```

5. 使用 PM2 守护进程（生产环境推荐）
```bash
npm install -g pm2
pm2 start server.js --name amber-portfolio
pm2 save
pm2 startup
```

---

## 更新日志

### v4.0 (2026)
- **完整简历系统**：工作经历、教育背景、项目经历、证书荣誉
- **Amber专属数据**：内置10篇专业博客、完整工作经历和项目
- **增强后台管理**：新增4个管理模块（经历、教育、项目、证书）
- 前后端完整CRUD操作
- 玻璃拟态UI优化
- 性能优化和bug修复

### v3.0 (2024)
- 全新极简分栏风设计
- 马卡龙色系 + 玻璃拟态
- 完整后台管理系统
- 博客系统 2.0
- 数据导入功能
- 响应式优化
- 暗黑模式支持

---

## License

MIT License - Amber Portfolio

---

## 联系方式

- **Amber** - 产品数据分析师
- **邮箱**: amber@example.com
- **GitHub**: https://github.com/amber

---

> 💡 提示：首次使用请登录后台完善个人信息，上传头像，添加作品和技能！
# Amber000
