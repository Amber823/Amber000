/**
 * Amber Portfolio - Admin JavaScript
 * 管理后台交互逻辑
 */

// ============ 全局状态 ============
let currentImportType = null;

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
    },

    async put(url, data) {
        try {
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '网络错误' };
        }
    },

    async delete(url) {
        try {
            const res = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: '网络错误' };
        }
    },

    async upload(url, file) {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(url, {
                method: 'POST',
                body: formData,
                credentials: 'include'
            });
            return await res.json();
        } catch (error) {
            console.error('Upload Error:', error);
            return { success: false, message: '上传错误' };
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

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ============ 检查登录状态 ============
async function checkAuth() {
    const result = await api.get('/api/auth/check');

    if (result.loggedIn) {
        showAdminDashboard(result.user);
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');
}

function showAdminDashboard(user) {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    document.getElementById('adminUsername').textContent = user.username;
    document.getElementById('adminAvatar').textContent = user.username.charAt(0).toUpperCase();

    // 加载数据
    loadDashboardStats();
    loadPendingMessages();
}

// ============ 登录 ============
function initLoginForm() {
    const form = document.getElementById('loginForm');
    const rememberMe = document.getElementById('rememberMe');
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');

    // 加载保存的账号密码
    const savedUsername = localStorage.getItem('savedUsername');
    const savedPassword = localStorage.getItem('savedPassword');
    const savedRemember = localStorage.getItem('savedRemember') === 'true';

    if (savedRemember && savedUsername) {
        usernameInput.value = savedUsername;
        passwordInput.value = savedPassword;
        rememberMe.checked = savedRemember;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        const result = await api.post('/api/auth/login', data);

        if (result.success) {
            // 记住密码
            if (rememberMe.checked) {
                localStorage.setItem('savedUsername', data.username);
                localStorage.setItem('savedPassword', data.password);
                localStorage.setItem('savedRemember', 'true');
            } else {
                localStorage.removeItem('savedUsername');
                localStorage.removeItem('savedPassword');
                localStorage.setItem('savedRemember', 'false');
            }

            showToast('登录成功', 'success');
            showAdminDashboard(result.data.user);
            loadDashboardStats();
        } else {
            showToast(result.message || '登录失败', 'error');
        }
    });
}

// 密码可见性切换
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleIcon = document.getElementById('passwordToggleIcon');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// ============ 登出 ============
function initLogout() {
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await api.post('/api/auth/logout', {});
        showToast('已退出登录', 'info');
        showLoginPage();
    });
}

// ============ 标签页切换 ============
function initTabs() {
    const navLinks = document.querySelectorAll('.admin-nav-link');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.dataset.tab;

            // 更新导航状态
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 更新内容显示
            tabContents.forEach(tab => {
                tab.classList.add('hidden');
                tab.classList.remove('active');
            });

            const activeTab = document.getElementById(`tab-${tabId}`);
            if (activeTab) {
                activeTab.classList.remove('hidden');
                activeTab.classList.add('active');
            }

            // 加载对应数据
            switch (tabId) {
                case 'dashboard':
                    loadDashboardStats();
                    break;
                case 'messages':
                    loadMessages();
                    break;
                case 'blogs':
                    loadBlogs();
                    break;
                case 'experiences':
                    loadExperiences();
                    break;
                case 'education':
                    loadEducation();
                    break;
                case 'projects':
                    loadProjects();
                    break;
                case 'certificates':
                    loadCertificates();
                    break;
                case 'works':
                    loadWorks();
                    break;
                case 'skills':
                    loadSkills();
                    break;
                case 'config':
                    loadConfig();
                    loadSocials();
                    break;
            }
        });
    });
}

// ============ 数据看板 ============
async function loadDashboardStats() {
    const result = await api.get('/api/admin/stats');

    if (result.success) {
        const data = result.data;

        document.getElementById('statBlogs').textContent = data.blogCount || 0;
        document.getElementById('statMessages').textContent = data.messageCount || 0;
        document.getElementById('statWorks').textContent = data.workCount || 0;
        document.getElementById('statViews').textContent = data.totalViews || 0;

        // 渲染图表
        renderStatsChart(data.recentStats || []);
    }
}

function renderStatsChart(stats) {
    const container = document.getElementById('statsChart');

    if (stats.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); width: 100%;">暂无数据</p>';
        return;
    }

    const maxVisitors = Math.max(...stats.map(s => s.visitors), 1);

    container.innerHTML = stats.slice().reverse().map(stat => {
        const height = (stat.visitors / maxVisitors) * 180;
        return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                <div style="width: 100%; background: linear-gradient(to top, var(--macaron-pink-light), var(--macaron-pink)); border-radius: 8px 8px 0 0; min-height: 20px; height: ${height}px; max-height: 180px;"></div>
                <span style="font-size: 0.7rem; color: var(--text-light);">${stat.date.slice(5)}</span>
            </div>
        `;
    }).join('');
}

// ============ 留言管理 ============
async function loadPendingMessages() {
    const result = await api.get('/api/auth/check');
    if (result.loggedIn) {
        const messagesResult = await api.get('/api/messages/all');
        if (messagesResult.success) {
            const pendingCount = messagesResult.pendingCount || 0;
            const badge = document.getElementById('pendingBadge');
            if (pendingCount > 0) {
                badge.textContent = pendingCount;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }
}

async function loadMessages() {
    const result = await api.get('/api/messages/all');

    if (result.success) {
        const tbody = document.getElementById('messagesTableBody');

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-light);">暂无留言</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(msg => `
            <tr>
                <td>${msg.id}</td>
                <td>${escapeHtml(msg.visitor_name)}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(msg.content)}</td>
                <td>
                    <span class="status-badge ${msg.status}">${getStatusText(msg.status)}</span>
                </td>
                <td>${formatDate(msg.created_at)}</td>
                <td>
                    <div class="action-btns">
                        ${msg.status === 'pending' ? `
                            <button class="action-btn reply" onclick="approveMessage(${msg.id})" title="审核通过">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="action-btn reply" onclick="openReplyModal(${msg.id}, '${escapeHtml(msg.content)}')" title="回复">
                            <i class="fas fa-reply"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteMessage(${msg.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // 更新待审核徽章
        const pendingCount = result.pendingCount || 0;
        const badge = document.getElementById('pendingBadge');
        if (pendingCount > 0) {
            badge.textContent = pendingCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function getStatusText(status) {
    const map = {
        pending: '待审核',
        approved: '已通过',
        rejected: '已拒绝'
    };
    return map[status] || status;
}

async function approveMessage(id) {
    const result = await api.put(`/api/messages/${id}/status`, { status: 'approved' });

    if (result.success) {
        showToast('审核通过', 'success');
        loadMessages();
    } else {
        showToast(result.message || '操作失败', 'error');
    }
}

function openReplyModal(id, content) {
    document.getElementById('replyMessageId').value = id;
    document.getElementById('replyOriginalContent').textContent = content;
    document.getElementById('replyContent').value = '';
    document.getElementById('replyModal').classList.add('active');
}

function closeReplyModal() {
    document.getElementById('replyModal').classList.remove('active');
}

async function submitReply() {
    const id = document.getElementById('replyMessageId').value;
    const reply = document.getElementById('replyContent').value.trim();

    if (!reply) {
        showToast('请输入回复内容', 'warning');
        return;
    }

    // 先审核通过
    await api.put(`/api/messages/${id}/status`, { status: 'approved' });

    // 再回复
    const result = await api.put(`/api/messages/${id}/reply`, { reply });

    if (result.success) {
        showToast('回复成功', 'success');
        closeReplyModal();
        loadMessages();
    } else {
        showToast(result.message || '回复失败', 'error');
    }
}

async function deleteMessage(id) {
    if (!confirm('确定要删除这条留言吗？')) return;

    const result = await api.delete(`/api/messages/${id}`);

    if (result.success) {
        showToast('删除成功', 'success');
        loadMessages();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 博客管理 ============
async function loadBlogs() {
    const result = await api.get('/api/blogs/all');

    if (result.success) {
        const tbody = document.getElementById('blogsTableBody');

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="padding: 40px; color: var(--text-light);">暂无文章</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(blog => `
            <tr>
                <td>${blog.id}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(blog.title)}</td>
                <td>${blog.category}</td>
                <td>${blog.tags || '-'}</td>
                <td>
                    <span class="status-badge ${blog.status}">${blog.status === 'published' ? '已发布' : '草稿'}</span>
                </td>
                <td>${blog.views}</td>
                <td>${formatDate(blog.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editBlog(${blog.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteBlog(${blog.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openBlogModal(blog = null) {
    const modal = document.getElementById('blogEditModal');
    const form = document.getElementById('blogForm');
    const title = document.getElementById('blogModalTitle');

    form.reset();

    if (blog) {
        title.textContent = '编辑文章';
        document.getElementById('blogId').value = blog.id;
        document.getElementById('blogTitle').value = blog.title;
        document.getElementById('blogCategory').value = blog.category || '';
        document.getElementById('blogTags').value = blog.tags || '';
        document.getElementById('blogStatus').value = blog.status;
        document.getElementById('blogContent').value = blog.content;
    } else {
        title.textContent = '新建文章';
        document.getElementById('blogId').value = '';
    }

    modal.classList.add('active');
}

function closeBlogEditModal() {
    document.getElementById('blogEditModal').classList.remove('active');
}

async function editBlog(id) {
    const result = await api.get(`/api/blogs/${id}`);
    if (result.success) {
        openBlogModal(result.data);
    }
}

async function saveBlog() {
    const form = document.getElementById('blogForm');
    const formData = new FormData(form);

    const data = {
        title: formData.get('title'),
        category: formData.get('category') || '通用',
        tags: formData.get('tags') || '',
        status: formData.get('status'),
        content: formData.get('content')
    };

    const id = document.getElementById('blogId').value;
    const isEdit = !!id;

    let result;
    if (isEdit) {
        result = await api.put(`/api/blogs/${id}`, data);
    } else {
        result = await api.post('/api/blogs', data);
    }

    if (result.success) {
        showToast(isEdit ? '更新成功' : '创建成功', 'success');
        closeBlogEditModal();
        loadBlogs();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteBlog(id) {
    if (!confirm('确定要删除这篇文章吗？')) return;

    const result = await api.delete(`/api/blogs/${id}`);

    if (result.success) {
        showToast('删除成功', 'success');
        loadBlogs();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 作品管理 ============
async function loadWorks() {
    const result = await api.get('/api/admin/works');

    if (result.success) {
        const tbody = document.getElementById('worksTableBody');

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-light);">暂无作品</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(work => `
            <tr>
                <td>${work.id}</td>
                <td>${escapeHtml(work.title)}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(work.description || '-')}</td>
                <td>${work.tags || '-'}</td>
                <td>${formatDate(work.created_at)}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editWork(${work.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteWork(${work.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openWorkModal(work = null) {
    const modal = document.getElementById('workEditModal');
    const form = document.getElementById('workForm');
    const title = document.getElementById('workModalTitle');
    const fileInfo = document.getElementById('workFileInfo');

    form.reset();
    fileInfo.innerHTML = '';
    fileInfo.style.color = 'var(--text-light)';

    if (work) {
        title.textContent = '编辑作品';
        document.getElementById('workId').value = work.id;
        document.getElementById('workTitle').value = work.title;
        document.getElementById('workDescription').value = work.description || '';
        document.getElementById('workImageUrl').value = work.image_url || '';
        document.getElementById('workLink').value = work.link || '';
        document.getElementById('workTags').value = work.tags || '';

        // 显示已上传文件信息
        if (work.image_url) {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(work.image_url);
            const filename = work.image_url.split('/').pop();
            const icon = isImage ? 'fa-image' : 'fa-file-alt';
            fileInfo.innerHTML = `<i class="fas ${icon}"></i> 已上传: ${filename}`;
            fileInfo.style.color = 'var(--macaron-green)';
        }
    } else {
        title.textContent = '添加作品';
        document.getElementById('workId').value = '';
    }

    modal.classList.add('active');
}

function closeWorkEditModal() {
    document.getElementById('workEditModal').classList.remove('active');
}

async function uploadWorkImageFromModal() {
    const fileInput = document.getElementById('workImageFile');
    const file = fileInput.files[0];

    if (!file) {
        showToast('请选择文件', 'warning');
        return;
    }

    const result = await api.upload('/api/admin/works/upload', file);

    if (result.success) {
        document.getElementById('workImageUrl').value = result.data.url;
        document.getElementById('workFileType').value = result.data.type;
        document.getElementById('workFilename').value = result.data.filename;

        // 显示文件名信息
        const fileInfo = document.getElementById('workFileInfo');
        const icon = result.data.type === 'image' ? 'fa-image' : 'fa-file-alt';
        fileInfo.innerHTML = `<i class="fas ${icon}"></i> 已上传: ${result.data.filename}`;
        fileInfo.style.color = 'var(--macaron-green)';

        showToast('文件上传成功', 'success');
    } else {
        showToast(result.message || '上传失败', 'error');
    }
}

async function editWork(id) {
    const result = await api.get('/api/admin/works');
    if (result.success) {
        const work = result.data.find(w => w.id === id);
        if (work) openWorkModal(work);
    }
}

async function saveWork() {
    const form = document.getElementById('workForm');
    const formData = new FormData(form);

    const data = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        image_url: formData.get('image_url') || '',
        link: formData.get('link') || '#',
        tags: formData.get('tags') || ''
    };

    const id = document.getElementById('workId').value;
    const isEdit = !!id;

    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/works/${id}`, data);
    } else {
        result = await api.post('/api/admin/works', data);
    }

    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeWorkEditModal();
        loadWorks();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteWork(id) {
    if (!confirm('确定要删除这个作品吗？')) return;

    const result = await api.delete(`/api/admin/works/${id}`);

    if (result.success) {
        showToast('删除成功', 'success');
        loadWorks();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 技能管理 ============
async function loadSkills() {
    const result = await api.get('/api/admin/skills');

    if (result.success) {
        const tbody = document.getElementById('skillsTableBody');

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--text-light);">暂无技能</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(skill => `
            <tr>
                <td>${skill.id}</td>
                <td>${escapeHtml(skill.name)}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 100px; height: 6px; background: var(--bg-gray); border-radius: 3px; overflow: hidden;">
                            <div style="width: ${skill.level}%; height: 100%; background: linear-gradient(90deg, var(--macaron-pink), var(--macaron-blue));"></div>
                        </div>
                        <span style="font-size: 0.85rem; color: var(--text-medium);">${skill.level}%</span>
                    </div>
                </td>
                <td>${skill.category}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editSkill(${skill.id})" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteSkill(${skill.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openSkillModal(skill = null) {
    const modal = document.getElementById('skillEditModal');
    const form = document.getElementById('skillForm');
    const title = document.getElementById('skillModalTitle');

    form.reset();

    if (skill) {
        title.textContent = '编辑技能';
        document.getElementById('skillId').value = skill.id;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillLevel').value = skill.level;
        document.getElementById('skillCategory').value = skill.category || '技能';
    } else {
        title.textContent = '添加技能';
        document.getElementById('skillId').value = '';
    }

    modal.classList.add('active');
}

function closeSkillEditModal() {
    document.getElementById('skillEditModal').classList.remove('active');
}

async function editSkill(id) {
    const result = await api.get('/api/admin/skills');
    if (result.success) {
        const skill = result.data.find(s => s.id === id);
        if (skill) openSkillModal(skill);
    }
}

async function saveSkill() {
    const form = document.getElementById('skillForm');
    const formData = new FormData(form);

    const data = {
        name: formData.get('name'),
        level: parseInt(formData.get('level')) || 50,
        category: formData.get('category') || '技能'
    };

    const id = document.getElementById('skillId').value;
    const isEdit = !!id;

    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/skills/${id}`, data);
    } else {
        result = await api.post('/api/admin/skills', data);
    }

    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeSkillEditModal();
        loadSkills();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteSkill(id) {
    if (!confirm('确定要删除这个技能吗？')) return;

    const result = await api.delete(`/api/admin/skills/${id}`);

    if (result.success) {
        showToast('删除成功', 'success');
        loadSkills();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 工作经历管理 ============
async function loadExperiences() {
    const result = await api.get('/api/admin/experiences');
    if (result.success) {
        const tbody = document.getElementById('experiencesTableBody');
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 40px; color: var(--text-light);">暂无工作经历</td></tr>';
            return;
        }
        tbody.innerHTML = result.data.map(exp => `
            <tr>
                <td>${exp.id}</td>
                <td>${escapeHtml(exp.title)}</td>
                <td>${escapeHtml(exp.company || '-')}</td>
                <td>${exp.start_date} - ${exp.current ? '至今' : exp.end_date}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editExperience(${exp.id})" title="编辑"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteExperience(${exp.id})" title="删除"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openExperienceModal(exp = null) {
    const modal = document.getElementById('experienceEditModal');
    const form = document.getElementById('experienceForm');
    const title = document.getElementById('experienceModalTitle');
    form.reset();
    if (exp) {
        title.textContent = '编辑工作经历';
        document.getElementById('experienceId').value = exp.id;
        document.getElementById('experienceTitle').value = exp.title;
        document.getElementById('experienceCompany').value = exp.company || '';
        document.getElementById('experienceLocation').value = exp.location || '';
        document.getElementById('experienceStartDate').value = exp.start_date || '';
        document.getElementById('experienceEndDate').value = exp.end_date || '';
        document.getElementById('experienceDescription').value = exp.description || '';
        document.getElementById('experienceAchievements').value = exp.achievements || '';
    } else {
        title.textContent = '添加工作经历';
        document.getElementById('experienceId').value = '';
    }
    modal.classList.add('active');
}

function closeExperienceEditModal() {
    document.getElementById('experienceEditModal').classList.remove('active');
}

async function editExperience(id) {
    const result = await api.get('/api/admin/experiences');
    if (result.success) {
        const exp = result.data.find(e => e.id === id);
        if (exp) openExperienceModal(exp);
    }
}

async function saveExperience() {
    const formData = new FormData(document.getElementById('experienceForm'));
    const data = {
        type: 'work',
        title: formData.get('title'),
        company: formData.get('company'),
        location: formData.get('location'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        current: formData.get('end_date') === '至今' ? 1 : 0,
        description: formData.get('description'),
        achievements: formData.get('achievements')
    };
    const id = document.getElementById('experienceId').value;
    const isEdit = !!id;
    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/experiences/${id}`, data);
    } else {
        result = await api.post('/api/admin/experiences', data);
    }
    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeExperienceEditModal();
        loadExperiences();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteExperience(id) {
    if (!confirm('确定要删除这条工作经历吗？')) return;
    const result = await api.delete(`/api/admin/experiences/${id}`);
    if (result.success) {
        showToast('删除成功', 'success');
        loadExperiences();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 教育经历管理 ============
async function loadEducation() {
    const result = await api.get('/api/admin/education');
    if (result.success) {
        const tbody = document.getElementById('educationTableBody');
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-light);">暂无教育经历</td></tr>';
            return;
        }
        tbody.innerHTML = result.data.map(edu => `
            <tr>
                <td>${edu.id}</td>
                <td>${escapeHtml(edu.school)}</td>
                <td>${edu.degree || '-'}</td>
                <td>${edu.major || '-'}</td>
                <td>${edu.start_date} - ${edu.end_date}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editEducation(${edu.id})" title="编辑"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteEducation(${edu.id})" title="删除"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openEducationModal(edu = null) {
    const modal = document.getElementById('educationEditModal');
    const form = document.getElementById('educationForm');
    const title = document.getElementById('educationModalTitle');
    form.reset();
    if (edu) {
        title.textContent = '编辑教育经历';
        document.getElementById('educationId').value = edu.id;
        document.getElementById('educationSchool').value = edu.school;
        document.getElementById('educationDegree').value = edu.degree || '';
        document.getElementById('educationMajor').value = edu.major || '';
        document.getElementById('educationStartDate').value = edu.start_date || '';
        document.getElementById('educationEndDate').value = edu.end_date || '';
        document.getElementById('educationGpa').value = edu.gpa || '';
        document.getElementById('educationDescription').value = edu.description || '';
    } else {
        title.textContent = '添加教育经历';
        document.getElementById('educationId').value = '';
    }
    modal.classList.add('active');
}

function closeEducationEditModal() {
    document.getElementById('educationEditModal').classList.remove('active');
}

async function editEducation(id) {
    const result = await api.get('/api/admin/education');
    if (result.success) {
        const edu = result.data.find(e => e.id === id);
        if (edu) openEducationModal(edu);
    }
}

async function saveEducation() {
    const formData = new FormData(document.getElementById('educationForm'));
    const data = {
        school: formData.get('school'),
        degree: formData.get('degree'),
        major: formData.get('major'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        gpa: formData.get('gpa'),
        description: formData.get('description')
    };
    const id = document.getElementById('educationId').value;
    const isEdit = !!id;
    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/education/${id}`, data);
    } else {
        result = await api.post('/api/admin/education', data);
    }
    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeEducationEditModal();
        loadEducation();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteEducation(id) {
    if (!confirm('确定要删除这条教育经历吗？')) return;
    const result = await api.delete(`/api/admin/education/${id}`);
    if (result.success) {
        showToast('删除成功', 'success');
        loadEducation();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 项目经历管理 ============
async function loadProjects() {
    const result = await api.get('/api/admin/projects');
    if (result.success) {
        const tbody = document.getElementById('projectsTableBody');
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 40px; color: var(--text-light);">暂无项目经历</td></tr>';
            return;
        }
        tbody.innerHTML = result.data.map(proj => `
            <tr>
                <td>${proj.id}</td>
                <td>${escapeHtml(proj.name)}</td>
                <td>${escapeHtml(proj.role || '-')}</td>
                <td>${proj.start_date} - ${proj.end_date}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editProject(${proj.id})" title="编辑"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteProject(${proj.id})" title="删除"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openProjectModal(proj = null) {
    const modal = document.getElementById('projectEditModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    form.reset();
    if (proj) {
        title.textContent = '编辑项目经历';
        document.getElementById('projectId').value = proj.id;
        document.getElementById('projectName').value = proj.name;
        document.getElementById('projectRole').value = proj.role || '';
        document.getElementById('projectStartDate').value = proj.start_date || '';
        document.getElementById('projectEndDate').value = proj.end_date || '';
        document.getElementById('projectDescription').value = proj.description || '';
        document.getElementById('projectAchievements').value = proj.achievements || '';
        document.getElementById('projectTechnologies').value = proj.technologies || '';
    } else {
        title.textContent = '添加项目经历';
        document.getElementById('projectId').value = '';
    }
    modal.classList.add('active');
}

function closeProjectEditModal() {
    document.getElementById('projectEditModal').classList.remove('active');
}

async function editProject(id) {
    const result = await api.get('/api/admin/projects');
    if (result.success) {
        const proj = result.data.find(p => p.id === id);
        if (proj) openProjectModal(proj);
    }
}

async function saveProject() {
    const formData = new FormData(document.getElementById('projectForm'));
    const data = {
        name: formData.get('name'),
        role: formData.get('role'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        description: formData.get('description'),
        achievements: formData.get('achievements'),
        technologies: formData.get('technologies')
    };
    const id = document.getElementById('projectId').value;
    const isEdit = !!id;
    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/projects/${id}`, data);
    } else {
        result = await api.post('/api/admin/projects', data);
    }
    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeProjectEditModal();
        loadProjects();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteProject(id) {
    if (!confirm('确定要删除这个项目吗？')) return;
    const result = await api.delete(`/api/admin/projects/${id}`);
    if (result.success) {
        showToast('删除成功', 'success');
        loadProjects();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 证书荣誉管理 ============
async function loadCertificates() {
    const result = await api.get('/api/admin/certificates');
    if (result.success) {
        const tbody = document.getElementById('certificatesTableBody');
        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="padding: 40px; color: var(--text-light);">暂无证书荣誉</td></tr>';
            return;
        }
        tbody.innerHTML = result.data.map(cert => `
            <tr>
                <td>${cert.id}</td>
                <td>${escapeHtml(cert.name)}</td>
                <td>${cert.type === 'honor' ? '荣誉' : '证书'}</td>
                <td>${escapeHtml(cert.issuer || '-')}</td>
                <td>${cert.date || '-'}</td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn edit" onclick="editCertificate(${cert.id})" title="编辑"><i class="fas fa-edit"></i></button>
                        <button class="action-btn delete" onclick="deleteCertificate(${cert.id})" title="删除"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openCertificateModal(cert = null) {
    const modal = document.getElementById('certificateEditModal');
    const form = document.getElementById('certificateForm');
    const title = document.getElementById('certificateModalTitle');
    form.reset();
    if (cert) {
        title.textContent = '编辑证书';
        document.getElementById('certificateId').value = cert.id;
        document.getElementById('certificateName').value = cert.name;
        document.getElementById('certificateType').value = cert.type || 'certificate';
        document.getElementById('certificateIssuer').value = cert.issuer || '';
        document.getElementById('certificateDate').value = cert.date || '';
        document.getElementById('certificateDescription').value = cert.description || '';
    } else {
        title.textContent = '添加证书';
        document.getElementById('certificateId').value = '';
    }
    modal.classList.add('active');
}

function closeCertificateEditModal() {
    document.getElementById('certificateEditModal').classList.remove('active');
}

async function editCertificate(id) {
    const result = await api.get('/api/admin/certificates');
    if (result.success) {
        const cert = result.data.find(c => c.id === id);
        if (cert) openCertificateModal(cert);
    }
}

async function saveCertificate() {
    const formData = new FormData(document.getElementById('certificateForm'));
    const data = {
        name: formData.get('name'),
        type: formData.get('type'),
        issuer: formData.get('issuer'),
        date: formData.get('date'),
        description: formData.get('description')
    };
    const id = document.getElementById('certificateId').value;
    const isEdit = !!id;
    let result;
    if (isEdit) {
        result = await api.put(`/api/admin/certificates/${id}`, data);
    } else {
        result = await api.post('/api/admin/certificates', data);
    }
    if (result.success) {
        showToast(isEdit ? '更新成功' : '添加成功', 'success');
        closeCertificateEditModal();
        loadCertificates();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteCertificate(id) {
    if (!confirm('确定要删除这个证书吗？')) return;
    const result = await api.delete(`/api/admin/certificates/${id}`);
    if (result.success) {
        showToast('删除成功', 'success');
        loadCertificates();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 网站配置 ============
async function loadConfig() {
    const result = await api.get('/api/admin/config');

    if (result.success) {
        const config = result.data;
        window.currentAdminConfig = config; // 存储以供排序使用

        // 基本信息
        const basicForm = document.getElementById('configBasicForm');
        basicForm.name.value = config.name || '';
        basicForm.title.value = config.title || '';
        basicForm.bio.value = config.bio || '';
        basicForm.email.value = config.email || '';
        basicForm.location.value = config.location || '';

        // 更新头像预览
        if (config.avatar_url) {
            const avatarPreview = document.getElementById('avatarPreview');
            if (avatarPreview) {
                avatarPreview.src = config.avatar_url;
            }
        }

        // 更新生活照预览
        if (config.about_photo) {
            const aboutPhotoPreview = document.getElementById('aboutPhotoPreview');
            if (aboutPhotoPreview) {
                aboutPhotoPreview.src = config.about_photo;
            }
        }

        // 加载板块排序
        loadSectionOrder();

        // 网站设置
        const siteForm = document.getElementById('configSiteForm');
        siteForm.site_name.value = config.site_name || '';
        siteForm.site_title.value = config.site_title || '';
        siteForm.site_description.value = config.site_description || '';
    }
}

function initConfigForms() {
    // 基本信息表单
    document.getElementById('configBasicForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            name: formData.get('name'),
            title: formData.get('title'),
            bio: formData.get('bio'),
            email: formData.get('email'),
            location: formData.get('location')
        };

        const result = await api.put('/api/admin/config', data);

        if (result.success) {
            showToast('保存成功', 'success');
        } else {
            showToast(result.message || '保存失败', 'error');
        }
    });

    // 网站设置表单
    document.getElementById('configSiteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const data = {
            site_name: formData.get('site_name'),
            site_title: formData.get('site_title'),
            site_description: formData.get('site_description')
        };

        const result = await api.put('/api/admin/config', data);

        if (result.success) {
            showToast('保存成功', 'success');
        } else {
            showToast(result.message || '保存失败', 'error');
        }
    });
}

// ============ 社交链接 ============
async function loadSocials() {
    const result = await api.get('/api/admin/socials');

    if (result.success) {
        const tbody = document.getElementById('socialsTableBody');

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="padding: 40px; color: var(--text-light);">暂无社交链接</td></tr>';
            return;
        }

        tbody.innerHTML = result.data.map(social => `
            <tr>
                <td>${social.id}</td>
                <td>${escapeHtml(social.platform)}</td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <a href="${social.url}" target="_blank" style="color: var(--macaron-blue-dark);">${escapeHtml(social.url)}</a>
                </td>
                <td>
                    <div class="action-btns">
                        <button class="action-btn delete" onclick="deleteSocial(${social.id})" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

function openSocialModal() {
    const modal = document.getElementById('socialModal');
    document.getElementById('socialForm').reset();
    modal.classList.add('active');
}

function closeSocialModal() {
    document.getElementById('socialModal').classList.remove('active');
}

async function saveSocial() {
    const form = document.getElementById('socialForm');
    const formData = new FormData(form);

    const data = {
        platform: formData.get('platform'),
        url: formData.get('url'),
        icon: formData.get('icon') || 'fa-link'
    };

    const result = await api.post('/api/admin/socials', data);

    if (result.success) {
        showToast('添加成功', 'success');
        closeSocialModal();
        loadSocials();
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

async function deleteSocial(id) {
    if (!confirm('确定要删除这个链接吗？')) return;

    const result = await api.delete(`/api/admin/socials/${id}`);

    if (result.success) {
        showToast('删除成功', 'success');
        loadSocials();
    } else {
        showToast(result.message || '删除失败', 'error');
    }
}

// ============ 数据导入 ============
function importData(type) {
    currentImportType = type;
    const modal = document.getElementById('importModal');
    const hint = document.getElementById('importFormatHint');

    const hints = {
        blogs: 'title, content, category, tags',
        works: 'title, description, image_url, link',
        skills: 'name, level, category'
    };

    document.getElementById('importModalTitle').textContent = `导入${type === 'blogs' ? '博客' : type === 'works' ? '作品' : '技能'}`;
    document.getElementById('importFormatHint').textContent = hints[type] || '';
    document.getElementById('importData').value = '';

    modal.classList.add('active');
}

function closeImportModal() {
    document.getElementById('importModal').classList.remove('active');
}

async function submitImport() {
    const csvText = document.getElementById('importData').value.trim();

    if (!csvText) {
        showToast('请粘贴数据', 'warning');
        return;
    }

    try {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());

        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const item = {};
            headers.forEach((header, index) => {
                item[header] = values[index] || '';
            });
            data.push(item);
        }

        const result = await api.post('/api/admin/import', {
            type: currentImportType,
            data
        });

        if (result.success) {
            showToast(result.message, 'success');
            closeImportModal();

            // 刷新对应列表
            switch (currentImportType) {
                case 'blogs': loadBlogs(); break;
                case 'works': loadWorks(); break;
                case 'skills': loadSkills(); break;
            }
        } else {
            showToast(result.message || '导入失败', 'error');
        }
    } catch (error) {
        showToast('数据格式错误', 'error');
    }
}

// ============ 文件上传 ============

// 裁剪相关变量
let cropperState = {
    type: '', // 'avatar' 或 'about'
    image: null,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    isDragging: false,
    aspectRatio: 1 // 1:1 for avatar
};

function openCropperModal(type, file) {
    cropperState.type = type;
    cropperState.scale = 1;
    cropperState.offsetX = 0;
    cropperState.offsetY = 0;

    // 设置比例
    if (type === 'avatar') {
        cropperState.aspectRatio = 1;
        document.getElementById('cropperModalTitle').textContent = '裁剪头像 (1:1)';
        // 设置预览框为圆形
        document.getElementById('cropPreviewContainer').style.borderRadius = '50%';
        document.getElementById('cropPreviewContainer').style.width = '150px';
        document.getElementById('cropPreviewContainer').style.height = '150px';
        document.getElementById('cropPreviewCanvas').width = 150;
        document.getElementById('cropPreviewCanvas').height = 150;
    } else {
        cropperState.aspectRatio = 3/4; // 3:4
        document.getElementById('cropperModalTitle').textContent = '裁剪生活照 (3:4)';
        // 设置预览框为圆角矩形
        document.getElementById('cropPreviewContainer').style.borderRadius = '12px';
        document.getElementById('cropPreviewContainer').style.width = '120px';
        document.getElementById('cropPreviewContainer').style.height = '160px';
        document.getElementById('cropPreviewCanvas').width = 120;
        document.getElementById('cropPreviewCanvas').height = 160;
    }

    // 读取图片
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = document.getElementById('cropperImage');
        img.src = e.target.result;
        img.onload = function() {
            // 初始化位置和缩放
            fitImageToContainer();
            cropperState.image = img;
            updateCropperTransform();
            updateCropPreview();
        };
    };
    reader.readAsDataURL(file);

    // 显示模态框
    document.getElementById('cropperModal').classList.add('active');
}

function fitImageToContainer() {
    const container = document.getElementById('cropperContainer');
    const img = document.getElementById('cropperImage');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // 计算图片缩放比例以适应容器
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    const fitScale = Math.min(scaleX, scaleY);

    cropperState.scale = fitScale;
    cropperState.offsetX = 0;
    cropperState.offsetY = 0;

    // 设置裁剪框大小（居中）
    updateCropFrame();
    updateZoomDisplay();
}

function updateCropFrame() {
    const container = document.getElementById('cropperContainer');
    const cropFrame = document.getElementById('cropFrame');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // 裁剪框尺寸：取容器宽或高的较小值的65%
    let frameWidth, frameHeight;
    const maxSize = Math.min(containerWidth, containerHeight) * 0.65;

    if (cropperState.aspectRatio === 1) {
        // 1:1 正方形
        frameWidth = maxSize;
        frameHeight = maxSize;
    } else {
        // 3:4 竖版
        frameHeight = maxSize;
        frameWidth = maxSize * 3 / 4;
    }

    // 确保不超过容器宽度
    if (frameWidth > containerWidth * 0.85) {
        frameWidth = containerWidth * 0.85;
        frameHeight = frameWidth / cropperState.aspectRatio;
    }

    // 确保不超过容器高度
    if (frameHeight > containerHeight * 0.85) {
        frameHeight = containerHeight * 0.85;
        frameWidth = frameHeight * cropperState.aspectRatio;
    }

    cropFrame.style.width = frameWidth + 'px';
    cropFrame.style.height = frameHeight + 'px';
    cropFrame.style.left = (containerWidth - frameWidth) / 2 + 'px';
    cropFrame.style.top = (containerHeight - frameHeight) / 2 + 'px';
}

function updateCropperTransform() {
    const img = document.getElementById('cropperImage');
    img.style.transform = `translate(${cropperState.offsetX}px, ${cropperState.offsetY}px) scale(${cropperState.scale})`;
}

function updateZoomDisplay() {
    const percent = Math.round(cropperState.scale * 100 / (cropperState.aspectRatio === 1 ? 0.5 : 0.4));
    document.getElementById('zoomLevel').textContent = Math.max(20, Math.min(200, percent)) + '%';
}

function zoomCropper(delta) {
    cropperState.scale = Math.max(0.2, Math.min(3, cropperState.scale + delta));
    updateCropperTransform();
    updateCropPreview();
    updateZoomDisplay();
}

// 更新裁剪预览
function updateCropPreview() {
    const img = document.getElementById('cropperImage');
    const canvas = document.getElementById('cropPreviewCanvas');
    const ctx = canvas.getContext('2d');
    const cropFrame = document.getElementById('cropFrame');
    const container = document.getElementById('cropperContainer');

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // 获取裁剪框的位置和尺寸
    const frameRect = cropFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const frameLeft = frameRect.left - containerRect.left;
    const frameTop = frameRect.top - containerRect.top;
    const frameWidth = frameRect.width;
    const frameHeight = frameRect.height;

    // 计算图片在容器中居中时的位置
    const displayWidth = imgWidth * cropperState.scale;
    const displayHeight = imgHeight * cropperState.scale;
    const imgLeft = (containerWidth - displayWidth) / 2;
    const imgTop = (containerHeight - displayHeight) / 2;

    // 加上偏移量（用户拖动的距离）
    const actualImgLeft = imgLeft + cropperState.offsetX;
    const actualImgTop = imgTop + cropperState.offsetY;

    // 计算裁剪框相对于实际图片的位置
    const relativeX = frameLeft - actualImgLeft;
    const relativeY = frameTop - actualImgTop;

    // 缩放到原始图片坐标
    const sx = relativeX / cropperState.scale;
    const sy = relativeY / cropperState.scale;
    const sw = frameWidth / cropperState.scale;
    const sh = frameHeight / cropperState.scale;

    // 确保在图片范围内
    const finalX = Math.max(0, Math.min(imgWidth - sw, sx));
    const finalY = Math.max(0, Math.min(imgHeight - sh, sy));
    const finalW = Math.min(sw, imgWidth - finalX);
    const finalH = Math.min(sh, imgHeight - finalY);

    // 绘制预览
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, finalX, finalY, finalW, finalH, 0, 0, canvas.width, canvas.height);
}

// 拖拽功能
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('cropperContainer');
    if (container) {
        container.addEventListener('mousedown', function(e) {
            cropperState.isDragging = true;
            cropperState.startX = e.clientX - cropperState.offsetX;
            cropperState.startY = e.clientY - cropperState.offsetY;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', function(e) {
            if (cropperState.isDragging) {
                cropperState.offsetX = e.clientX - cropperState.startX;
                cropperState.offsetY = e.clientY - cropperState.startY;
                updateCropperTransform();
                updateCropPreview();
            }
        });

        document.addEventListener('mouseup', function() {
            cropperState.isDragging = false;
            container.style.cursor = 'move';
        });

        // 滚轮缩放
        container.addEventListener('wheel', function(e) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            zoomCropper(delta);
        });
    }
});

function closeCropperModal() {
    document.getElementById('cropperModal').classList.remove('active');
    cropperState.image = null;
}

async function confirmCrop() {
    const img = document.getElementById('cropperImage');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cropFrame = document.getElementById('cropFrame');
    const container = document.getElementById('cropperContainer');

    // 输出尺寸：与预览框比例一致
    let outputWidth, outputHeight;
    if (cropperState.type === 'avatar') {
        outputWidth = 360;
        outputHeight = 360;  // 1:1
    } else {
        outputWidth = 360;
        outputHeight = 480;  // 3:4
    }

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    // 获取裁剪框的位置和尺寸
    const frameRect = cropFrame.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const frameLeft = frameRect.left - containerRect.left;
    const frameTop = frameRect.top - containerRect.top;
    const frameWidth = frameRect.width;
    const frameHeight = frameRect.height;

    // 计算图片在容器中居中时的位置
    const displayWidth = imgWidth * cropperState.scale;
    const displayHeight = imgHeight * cropperState.scale;
    const imgLeft = (containerWidth - displayWidth) / 2;
    const imgTop = (containerHeight - displayHeight) / 2;

    // 加上偏移量（用户拖动的距离）
    const actualImgLeft = imgLeft + cropperState.offsetX;
    const actualImgTop = imgTop + cropperState.offsetY;

    // 计算裁剪框相对于实际图片的位置
    const relativeX = frameLeft - actualImgLeft;
    const relativeY = frameTop - actualImgTop;

    // 缩放到原始图片坐标
    const sx = relativeX / cropperState.scale;
    const sy = relativeY / cropperState.scale;
    const sw = frameWidth / cropperState.scale;
    const sh = frameHeight / cropperState.scale;

    // 确保在图片范围内
    const finalX = Math.max(0, Math.min(imgWidth - sw, sx));
    const finalY = Math.max(0, Math.min(imgHeight - sh, sy));
    const finalW = Math.min(sw, imgWidth - finalX);
    const finalH = Math.min(sh, imgHeight - finalY);

    // 绘制裁剪后的图片
    ctx.drawImage(img, finalX, finalY, finalW, finalH, 0, 0, outputWidth, outputHeight);

    // 转换为Blob并上传
    canvas.toBlob(async function(blob) {
        closeCropperModal();

        const file = new File([blob], 'cropped_image.jpg', { type: 'image/jpeg', quality: 0.9 });

        const result = await api.upload('/api/admin/config/upload', file);

        if (result.success) {
            const imageUrl = result.data.url;

            if (cropperState.type === 'avatar') {
                const updateResult = await api.put('/api/admin/config', { avatar_url: imageUrl });
                if (updateResult.success) {
                    showToast('头像上传成功', 'success');
                    const preview = document.getElementById('avatarPreview');
                    if (preview) preview.src = imageUrl;
                } else {
                    showToast('头像路径保存失败', 'error');
                }
            } else {
                const updateResult = await api.put('/api/admin/config', { about_photo: imageUrl });
                if (updateResult.success) {
                    showToast('生活照上传成功', 'success');
                    const preview = document.getElementById('aboutPhotoPreview');
                    if (preview) preview.src = imageUrl;
                } else {
                    showToast('照片路径保存失败', 'error');
                }
            }
        } else {
            showToast(result.message || '上传失败', 'error');
        }
    }, 'image/jpeg', 0.9);
}

async function uploadAvatar() {
    const fileInput = document.getElementById('avatarUpload');
    const file = fileInput.files[0];

    if (!file) {
        showToast('请选择图片文件', 'warning');
        return;
    }

    // 打开裁剪模态框
    openCropperModal('avatar', file);
}

async function uploadAboutPhoto() {
    const fileInput = document.getElementById('aboutPhotoUpload');
    const file = fileInput.files[0];

    if (!file) {
        showToast('请选择图片文件', 'warning');
        return;
    }

    // 打开裁剪模态框
    openCropperModal('about', file);
}

// ============ 板块排序 ============
let draggedSection = null;

function initSectionSort() {
    const list = document.getElementById('sectionSortList');
    if (!list) return;

    const items = list.querySelectorAll('.sortable-item');

    items.forEach(item => {
        item.addEventListener('dragstart', function(e) {
            draggedSection = this;
            this.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', function() {
            this.classList.remove('dragging');
            draggedSection = null;
        });

        item.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        item.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedSection && draggedSection !== this) {
                const allItems = [...list.querySelectorAll('.sortable-item')];
                const fromIndex = allItems.indexOf(draggedSection);
                const toIndex = allItems.indexOf(this);

                if (fromIndex < toIndex) {
                    this.parentNode.insertBefore(draggedSection, this.nextSibling);
                } else {
                    this.parentNode.insertBefore(draggedSection, this);
                }
            }
        });
    });
}

async function saveSectionOrder() {
    const list = document.getElementById('sectionSortList');
    const items = list.querySelectorAll('.sortable-item');
    const order = [...items].map(item => item.dataset.section);

    const result = await api.put('/api/admin/config', { section_order: JSON.stringify(order) });

    if (result.success) {
        showToast('板块排序已保存', 'success');
    } else {
        showToast(result.message || '保存失败', 'error');
    }
}

function loadSectionOrder() {
    const config = window.currentAdminConfig;
    if (!config || !config.section_order) return;

    try {
        const order = JSON.parse(config.section_order);
        const list = document.getElementById('sectionSortList');
        if (!list) return;

        const items = [...list.querySelectorAll('.sortable-item')];
        items.sort((a, b) => {
            const aIndex = order.indexOf(a.dataset.section);
            const bIndex = order.indexOf(b.dataset.section);
            return aIndex - bIndex;
        });

        order.forEach(sectionId => {
            const item = items.find(i => i.dataset.section === sectionId);
            if (item) {
                list.appendChild(item);
            }
        });
    } catch (e) {
        console.error('Failed to load section order:', e);
    }
}

// ============ 工具函数 ============
function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============ 初始化 ============
function init() {
    initLoginForm();
    initLogout();
    initTabs();
    initConfigForms();
    initSectionSort();
    checkAuth();
}

// 启动
document.addEventListener('DOMContentLoaded', init);
