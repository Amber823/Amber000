/**
 * Amber Portfolio - Main JavaScript
 * 负责前端交互、视差滚动、微交互、骨架屏、留言板等
 */

// ============ 全局状态 ============
const state = {
    blogs: [],
    messages: [],
    works: [],
    skills: [],
    experiences: [],
    education: [],
    projects: [],
    certificates: [],
    config: {},
    currentFilter: 'all',
    isLoading: true
};

// ============ API 请求 ============
const api = {
    async get(url) {
        try {
            const res = await fetch(url, {
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '网络错误' };
        }
    },

    async post(url, data) {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '网络错误' };
        }
    }
};

// ============ Toast 提示 ============
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============ 主题切换 ============
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // 读取保存的主题
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#themeToggle i');
    icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// ============ 移动端菜单 ============
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');

    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        const icon = toggle.querySelector('i');
        icon.className = sidebar.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });

    // 点击外部关闭
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('open') &&
            !sidebar.contains(e.target) &&
            !toggle.contains(e.target)) {
            sidebar.classList.remove('open');
            toggle.querySelector('i').className = 'fas fa-bars';
        }
    });

    // 导航链接点击关闭
    sidebar.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('open');
            toggle.querySelector('i').className = 'fas fa-bars';
        });
    });
}

// ============ 视差滚动 ============
function initParallax() {
    const layers = document.querySelectorAll('.parallax-layer');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        layers.forEach(layer => {
            const speed = layer.dataset.speed || 0.5;
            const yPos = -(scrollY * speed);
            layer.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ============ 平滑滚动 ============
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 20;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============ 导航高亮 ============
function initNavigation() {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    });
}

// ============ 加载配置 ============
async function loadConfig() {
    const result = await api.get('/api/config');
    if (result.success) {
        state.config = result.data;
        renderConfig();
    }
}

function renderConfig() {
    const config = state.config;

    // 侧边栏头像
    if (config.avatar_url) {
        const sidebarAvatar = document.getElementById('sidebarAvatar');
        if (sidebarAvatar) {
            sidebarAvatar.src = config.avatar_url;
            sidebarAvatar.style.display = 'block';
            const placeholder = sidebarAvatar.nextElementSibling;
            if (placeholder) placeholder.style.display = 'none';
        }
    }

    // 侧边栏
    document.getElementById('sidebarName').textContent = config.name || 'Amber';
    document.getElementById('sidebarTitle').textContent = config.title || '产品数据分析师';

    // 英雄区
    document.getElementById('heroTitle').textContent = `你好，我是 ${config.name || 'Amber'}`;
    document.getElementById('heroSubtitle').textContent = config.title || '产品数据分析师 | 数据驱动决策';

    if (config.bio) {
        document.getElementById('heroDescription').textContent = config.bio;
    }

    // 关于我
    document.getElementById('aboutTitle').textContent = config.name ? `${config.name} - 产品数据分析师` : '数据驱动的产品分析师';
    document.getElementById('detailName').textContent = config.name || 'Amber';
    document.getElementById('detailTitle').textContent = config.title || '产品数据分析师';
    document.getElementById('detailLocation').textContent = config.location || '中国';
    document.getElementById('detailEmail').textContent = config.email || 'amber@example.com';

    // 关于页面照片（生活照）
    if (config.about_photo) {
        const aboutWrapper = document.querySelector('.about-image-wrapper');
        if (aboutWrapper) {
            aboutWrapper.style.background = 'transparent';
            aboutWrapper.innerHTML = `<img src="${config.about_photo}" alt="生活照" style="width: 100%; height: 100%; object-fit: cover; border-radius: 24px; opacity: 1;">`;
        }
    }

    // 联系方式
    document.getElementById('contactEmail').textContent = config.email || 'amber@example.com';
    document.getElementById('contactPhone').textContent = config.phone || '-';
    document.getElementById('contactLocation').textContent = config.location || '中国';

    // 更新页面标题
    document.title = config.site_title || 'Amber - 产品数据分析师';

    // 板块排序
    if (config.section_order) {
        applySectionOrder(config.section_order);
    }
}

function applySectionOrder(orderJson) {
    try {
        const order = typeof orderJson === 'string' ? JSON.parse(orderJson) : orderJson;
        const mainContent = document.querySelector('.main-content');
        const heroSection = document.getElementById('home');

        if (!mainContent || !heroSection) return;

        // 将英雄区移到最前面（不参与排序）
        const sections = {};
        order.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                sections[sectionId] = section;
            }
        });

        // 重新排列
        order.forEach(sectionId => {
            if (sections[sectionId]) {
                mainContent.appendChild(sections[sectionId]);
            }
        });
    } catch (e) {
        console.error('Failed to apply section order:', e);
    }
}

// ============ 加载技能 ============
async function loadSkills() {
    const result = await api.get('/api/skills');
    if (result.success) {
        state.skills = result.data;
        renderSkills();
    }
}

function renderSkills() {
    const grid = document.getElementById('skillsGrid');

    if (state.skills.length === 0) {
        grid.innerHTML = '<p class="text-center" style="color: var(--text-light); grid-column: 1/-1;">暂无技能数据</p>';
        return;
    }

    // 按分类分组
    const categories = {};
    state.skills.forEach(skill => {
        const cat = skill.category || '技能';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(skill);
    });

    let html = '';
    Object.entries(categories).forEach(([category, skills]) => {
        html += `
            <div class="skill-card">
                <p class="skill-category">${category}</p>
                ${skills.map(skill => `
                    <div class="skill-item">
                        <div class="skill-header">
                            <span class="skill-name">${skill.name}</span>
                            <span class="skill-level">${skill.level}%</span>
                        </div>
                        <div class="skill-bar">
                            <div class="skill-progress" style="width: 0%;" data-width="${skill.level}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });

    grid.innerHTML = html;

    // 动画加载技能条
    setTimeout(() => {
        document.querySelectorAll('.skill-progress').forEach(bar => {
            bar.style.width = bar.dataset.width;
        });
    }, 100);
}

// ============ 加载作品 ============
async function loadWorks() {
    const result = await api.get('/api/works');
    if (result.success) {
        state.works = result.data;
        renderWorks();
    }
}

function renderWorks() {
    const grid = document.getElementById('worksGrid');

    if (state.works.length === 0) {
        grid.innerHTML = '<p class="text-center" style="color: var(--text-light); grid-column: 1/-1;">暂无作品数据</p>';
        return;
    }

    grid.innerHTML = state.works.map(work => {
        const isImage = work.image_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(work.image_url);
        const isDocument = work.image_url && /\.(pdf|doc|docx)$/i.test(work.image_url);

        return `
        <div class="work-card">
            ${isImage ? `
                <div class="work-image">
                    <img src="${work.image_url}" alt="${work.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            ` : isDocument ? `
                <div class="work-image" style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--macaron-blue-light);">
                    <i class="fas fa-file-alt" style="font-size: 48px; color: var(--macaron-blue-dark); margin-bottom: 8px;"></i>
                    <span style="font-size: 0.75rem; color: var(--macaron-blue-dark);">${work.image_url.split('/').pop().split('-').pop()}</span>
                </div>
            ` : ''}
            <div class="work-content">
                <h3 class="work-title">${work.title}</h3>
                <p class="work-description prose">${work.description || ''}</p>
                ${work.tags ? `
                    <div class="work-tags">
                        ${work.tags.split(',').map(tag => `<span class="work-tag">${tag.trim()}</span>`).join('')}
                    </div>
                ` : ''}
                ${work.link && work.link !== '#' ? `
                    <a href="${work.link}" class="work-link" target="_blank">
                        查看详情 <i class="fas fa-arrow-right"></i>
                    </a>
                ` : ''}
                ${isDocument ? `
                    <a href="${work.image_url}" class="work-link" target="_blank" style="color: var(--macaron-blue-dark);">
                        <i class="fas fa-download"></i> 下载文件 <i class="fas fa-arrow-right"></i>
                    </a>
                ` : ''}
            </div>
        </div>
    `}).join('');
}

// ============ 加载工作经历 ============
async function loadExperiences() {
    const result = await api.get('/api/experiences');
    if (result.success) {
        state.experiences = result.data;
        renderExperiences();
    }
}

function renderExperiences() {
    const list = document.getElementById('experienceList');

    if (state.experiences.length === 0) {
        list.innerHTML = '<p class="text-center" style="color: var(--text-light); padding: 40px;">暂无工作经历</p>';
        return;
    }

    list.innerHTML = state.experiences.map(exp => {
        const achievements = exp.achievements ? exp.achievements.split('|').filter(a => a.trim()) : [];
        return `
            <div class="timeline-item" style="padding: 24px; background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); margin-bottom: 24px;">
                <div class="timeline-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">${exp.title}</h3>
                        <p style="color: var(--macaron-pink-dark); font-weight: 500;">${exp.company}</p>
                    </div>
                    <span class="timeline-date" style="padding: 6px 12px; background: var(--macaron-pink-light); color: var(--macaron-pink-dark); border-radius: 50px; font-size: 0.8rem;">
                        ${exp.start_date} - ${exp.current ? '至今' : exp.end_date}
                    </span>
                </div>
                <p style="color: var(--text-medium); font-size: 0.95rem; margin-bottom: 16px; line-height: 1.7;">${exp.description || ''}</p>
                ${achievements.length > 0 ? `
                    <div class="achievements" style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${achievements.map(a => `<span style="padding: 4px 12px; background: var(--macaron-blue-light); color: var(--macaron-blue-dark); border-radius: 50px; font-size: 0.8rem;">${a}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ============ 加载教育经历 ============
async function loadEducation() {
    const result = await api.get('/api/education');
    if (result.success) {
        state.education = result.data;
        renderEducation();
    }
}

function renderEducation() {
    const grid = document.getElementById('educationList');

    if (state.education.length === 0) {
        grid.innerHTML = '<p class="text-center" style="color: var(--text-light); grid-column: 1/-1;">暂无教育经历</p>';
        return;
    }

    grid.innerHTML = state.education.map(edu => `
        <div class="education-card" style="padding: 24px; background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg);">
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 56px; height: 56px; background: linear-gradient(135deg, var(--macaron-pink), var(--macaron-blue)); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-graduation-cap" style="font-size: 1.5rem; color: white;"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.15rem; font-weight: 600; color: var(--text-dark);">${edu.school}</h3>
                    <p style="color: var(--macaron-pink-dark);">${edu.degree} | ${edu.major}</p>
                </div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-light); margin-bottom: 12px;">
                <span><i class="far fa-calendar"></i> ${edu.start_date} - ${edu.end_date}</span>
                ${edu.gpa ? `<span><i class="fas fa-star"></i> ${edu.gpa}</span>` : ''}
            </div>
            <p style="color: var(--text-medium); font-size: 0.9rem; line-height: 1.6;">${edu.description || ''}</p>
        </div>
    `).join('');
}

// ============ 加载项目经历 ============
async function loadProjects() {
    const result = await api.get('/api/projects');
    if (result.success) {
        state.projects = result.data;
        renderProjects();
    }
}

function renderProjects() {
    const list = document.getElementById('projectList');

    if (state.projects.length === 0) {
        list.innerHTML = '<p class="text-center" style="color: var(--text-light); padding: 40px;">暂无项目经历</p>';
        return;
    }

    list.innerHTML = state.projects.map(proj => {
        const achievements = proj.achievements ? proj.achievements.split('|').filter(a => a.trim()) : [];
        const techs = proj.technologies ? proj.technologies.split(',').map(t => t.trim()).filter(t => t) : [];
        return `
            <div class="project-item" style="padding: 24px; background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                    <div>
                        <h3 style="font-size: 1.2rem; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">${proj.name}</h3>
                        <p style="color: var(--macaron-pink-dark); font-size: 0.9rem;">${proj.role}</p>
                    </div>
                    <span style="padding: 4px 10px; background: var(--macaron-green-light); color: var(--macaron-green-dark); border-radius: 50px; font-size: 0.75rem;">
                        ${proj.start_date} - ${proj.end_date}
                    </span>
                </div>
                <p style="color: var(--text-medium); font-size: 0.95rem; margin-bottom: 12px; line-height: 1.6;">${proj.description || ''}</p>
                ${achievements.length > 0 ? `
                    <div style="margin-bottom: 12px;">
                        ${achievements.map(a => `<p style="color: var(--text-dark); font-size: 0.85rem; margin-bottom: 4px;"><i class="fas fa-check" style="color: var(--macaron-green-dark); margin-right: 8px;"></i>${a}</p>`).join('')}
                    </div>
                ` : ''}
                ${techs.length > 0 ? `
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${techs.map(t => `<span style="padding: 3px 10px; background: var(--macaron-blue-light); color: var(--macaron-blue-dark); border-radius: 50px; font-size: 0.75rem;">${t}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// ============ 加载证书荣誉 ============
async function loadCertificates() {
    const result = await api.get('/api/certificates');
    if (result.success) {
        state.certificates = result.data;
        renderCertificates();
    }
}

function renderCertificates() {
    const grid = document.getElementById('certificateList');

    if (state.certificates.length === 0) {
        grid.innerHTML = '<p class="text-center" style="color: var(--text-light); grid-column: 1/-1;">暂无证书荣誉</p>';
        return;
    }

    const certificates = state.certificates.map(cert => {
        const isHonor = cert.type === 'honor';
        return `
            <div class="cert-card" style="padding: 20px; background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); text-align: center; transition: all 0.3s ease;">
                <div style="width: 48px; height: 48px; margin: 0 auto 12px; background: ${isHonor ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, var(--macaron-pink), var(--macaron-blue))'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <i class="fas ${isHonor ? 'fa-trophy' : 'fa-certificate'}" style="font-size: 1.25rem; color: white;"></i>
                </div>
                <h4 style="font-size: 1rem; font-weight: 600; color: var(--text-dark); margin-bottom: 4px;">${cert.name}</h4>
                <p style="color: var(--text-light); font-size: 0.8rem; margin-bottom: 4px;">${cert.issuer}</p>
                <p style="color: var(--macaron-pink-dark); font-size: 0.75rem;">${cert.date || ''}</p>
                ${cert.description ? `<p style="color: var(--text-medium); font-size: 0.8rem; margin-top: 8px;">${cert.description}</p>` : ''}
            </div>
        `;
    }).join('');

    grid.innerHTML = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;">${certificates}</div>`;
}

// ============ 加载博客 ============
async function loadBlogs() {
    const result = await api.get('/api/blogs');
    if (result.success) {
        state.blogs = result.data;
        renderBlogFilters(result.categories);
        renderBlogs();
    }
}

function renderBlogFilters(categories) {
    const filters = document.getElementById('blogFilters');

    let html = '<button class="filter-btn active" data-category="all">全部</button>';

    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            html += `<button class="filter-btn" data-category="${cat.category}">${cat.category} (${cat.count})</button>`;
        });
    }

    filters.innerHTML = html;

    // 绑定筛选事件
    filters.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.category;
            renderBlogs();
        });
    });
}

function renderBlogs() {
    const list = document.getElementById('blogList');
    const blogs = state.currentFilter === 'all'
        ? state.blogs
        : state.blogs.filter(b => b.category === state.currentFilter);

    if (blogs.length === 0) {
        list.innerHTML = '<p class="text-center" style="color: var(--text-light); padding: 40px;">暂无文章</p>';
        return;
    }

    list.innerHTML = blogs.map(blog => `
        <div class="blog-card" onclick="openBlogDetail(${blog.id})">
            <div class="blog-meta">
                <span class="blog-category">${blog.category}</span>
                <span><i class="far fa-calendar"></i> ${formatDate(blog.created_at)}</span>
                <span><i class="far fa-eye"></i> ${blog.views}</span>
            </div>
            <h3 class="blog-title">${blog.title}</h3>
            <p class="blog-excerpt">${blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>
            ${blog.tags ? `
                <div class="blog-tags">
                    ${blog.tags.split(',').map(tag => `<span class="blog-tag">${tag.trim()}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');
}

async function openBlogDetail(id) {
    const result = await api.get(`/api/blogs/${id}`);
    if (result.success) {
        const blog = result.data;
        const modal = document.getElementById('blogModal');
        const body = document.getElementById('blogModalBody');

        document.getElementById('blogModalTitle').textContent = blog.title;

        body.innerHTML = `
            <div class="blog-detail-header">
                <span class="blog-detail-category">${blog.category}</span>
                <h1 class="blog-detail-title">${blog.title}</h1>
                <div class="blog-detail-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(blog.created_at)}</span>
                    <span><i class="far fa-eye"></i> ${blog.views} 次阅读</span>
                </div>
            </div>
            <div class="blog-detail-content" style="margin-top: 30px;">
                ${blog.content.split('\n').map(p => `<p>${p}</p>`).join('')}
            </div>
            ${blog.tags ? `
                <div class="blog-tags" style="margin-top: 24px;">
                    ${blog.tags.split(',').map(tag => `<span class="blog-tag">${tag.trim()}</span>`).join('')}
                </div>
            ` : ''}
            <a href="#blog" class="blog-back" onclick="closeBlogModal(); return false;">
                <i class="fas fa-arrow-left"></i> 返回列表
            </a>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeBlogModal() {
    document.getElementById('blogModal').classList.remove('active');
    document.body.style.overflow = '';
}

// ============ 加载留言 ============
async function loadMessages() {
    const result = await api.get('/api/messages');
    if (result.success) {
        state.messages = result.data;
        renderMessages();
    }
}

function renderMessages() {
    const list = document.getElementById('messageList');

    if (state.messages.length === 0) {
        list.innerHTML = '<p class="text-center" style="color: var(--text-light); padding: 40px;">暂无留言，来说两句吧</p>';
        return;
    }

    list.innerHTML = state.messages.map(msg => `
        <div class="message-item">
            <div class="message-bubble">
                <p class="message-content">${escapeHtml(msg.content)}</p>
            </div>
            <div class="message-meta">
                <span class="message-author">${escapeHtml(msg.visitor_name)}</span>
                <span>${formatDate(msg.created_at)}</span>
            </div>
            ${msg.reply ? `
                <div class="message-reply">
                    <p class="reply-label"><i class="fas fa-reply"></i> 管理员回复</p>
                    <p class="reply-content">${escapeHtml(msg.reply)}</p>
                    <p class="reply-time">${formatDate(msg.reply_at)}</p>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ============ 提交留言 ============
function initMessageForm() {
    const form = document.getElementById('messageForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            visitorName: formData.get('visitorName'),
            content: formData.get('content')
        };

        if (!data.visitorName.trim() || !data.content.trim()) {
            showToast('请填写姓名和留言内容', 'warning');
            return;
        }

        const result = await api.post('/api/messages', data);

        if (result.success) {
            showToast('留言已提交，等待审核', 'success');
            form.reset();
            loadMessages();
        } else {
            showToast(result.message || '提交失败', 'error');
        }
    });
}

// ============ 工具函数 ============
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ 初始化 ============
async function init() {
    // 显示骨架屏
    state.isLoading = true;

    // 初始化主题
    initTheme();

    // 初始化移动端菜单
    initMobileMenu();

    // 初始化视差
    initParallax();

    // 初始化平滑滚动
    initSmoothScroll();

    // 初始化导航
    initNavigation();

    // 初始化留言表单
    initMessageForm();

    // 加载数据
    await Promise.all([
        loadConfig(),
        loadExperiences(),
        loadEducation(),
        loadProjects(),
        loadCertificates(),
        loadSkills(),
        loadWorks(),
        loadBlogs(),
        loadMessages()
    ]);

    // 渲染社交链接
    loadSocials();

    state.isLoading = false;
}

async function loadSocials() {
    const result = await api.get('/api/socials');
    if (result.success && result.data) {
        const container = document.getElementById('sidebarSocials');
        container.innerHTML = result.data.map(social => `
            <a href="${social.url}" class="social-link" target="_blank" title="${social.platform}">
                <i class="fab ${social.icon || 'fa-link'}"></i>
            </a>
        `).join('');
    }
}

// 启动
document.addEventListener('DOMContentLoaded', init);
