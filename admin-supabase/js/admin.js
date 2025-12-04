import { supabase } from '../../js/supabase-config.js';

// State
let currentUser = null;
let currentPostId = null;
let currentProjectId = null;
let currentExperienceId = null;
let activeTab = 'posts'; // 'posts', 'projects', or 'experiences'

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    editor: document.getElementById('editor-screen'),
    projectEditor: document.getElementById('project-editor-screen'),
    experienceEditor: document.getElementById('experience-editor-screen')
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    setupEventListeners();
});

// Authentication
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        showScreen('dashboard');
        document.getElementById('user-email').textContent = currentUser.email;
        loadData();
    } else {
        showScreen('login');
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            currentUser = session.user;
            showScreen('dashboard');
            document.getElementById('user-email').textContent = currentUser.email;
            loadData();
        } else {
            currentUser = null;
            showScreen('login');
        }
    });
}

async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        document.getElementById('login-error').textContent = error.message;
    }
}

async function logout() {
    await supabase.auth.signOut();
}

// Navigation
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
}

function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tab}`).classList.add('active');

    document.getElementById('posts-view').classList.add('hidden');
    document.getElementById('projects-view').classList.add('hidden');
    document.getElementById('experiences-view').classList.add('hidden');
    document.getElementById('profile-view').classList.add('hidden');
    document.getElementById(`${tab}-view`).classList.remove('hidden');

    // Hide/show New button based on tab
    const newBtn = document.getElementById('new-btn');
    if (tab === 'profile') {
        newBtn.style.display = 'none';
    } else {
        newBtn.style.display = 'inline-block';
    }

    loadData();
}

function loadData() {
    if (activeTab === 'posts') {
        loadPosts();
    } else if (activeTab === 'projects') {
        loadProjects();
    } else if (activeTab === 'experiences') {
        loadExperiences();
    } else if (activeTab === 'profile') {
        loadProfile();
    }
}

// Blog Posts Logic
async function loadPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '<div class="loading">Loading posts...</div>';

    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        postsList.innerHTML = `<div class="error-msg">Error loading posts: ${error.message}</div>`;
        return;
    }

    if (posts.length === 0) {
        postsList.innerHTML = '<div class="no-posts">No posts found. Create one!</div>';
        return;
    }

    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-info">
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="status-badge ${post.is_published ? 'status-published' : 'status-draft'}">
                        ${post.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span>${new Date(post.created_at).toLocaleDateString()}</span>
                    <span>${post.genre || 'Uncategorized'}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-icon" onclick="window.editPost('${post.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="window.deletePost('${post.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.editPost = async (id) => {
    currentPostId = id;
    const { data: post, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error loading post');
        return;
    }

    fillEditor(post);
    showScreen('editor');
    document.getElementById('editor-title').textContent = 'Edit Post';
};

function fillEditor(post) {
    document.getElementById('post-title').value = post.title || '';
    document.getElementById('post-slug').value = post.slug || '';
    document.getElementById('post-genre').value = post.genre || 'tech';
    document.getElementById('post-date').value = post.published_at ? new Date(post.published_at).toISOString().slice(0, 16) : '';
    document.getElementById('post-readtime').value = post.read_time || '';
    document.getElementById('post-image').value = post.image_url || '';
    document.getElementById('post-excerpt').value = post.excerpt || '';
    document.getElementById('post-published').checked = post.is_published || false;
    document.getElementById('post-content').value = post.content || '';
    updatePreview();
}

async function savePost() {
    const saveBtn = document.getElementById('save-btn');
    const statusSpan = document.getElementById('save-status');

    saveBtn.disabled = true;
    statusSpan.textContent = 'Saving...';

    const postData = {
        title: document.getElementById('post-title').value,
        slug: document.getElementById('post-slug').value,
        genre: document.getElementById('post-genre').value,
        published_at: document.getElementById('post-date').value ? new Date(document.getElementById('post-date').value).toISOString() : null,
        read_time: document.getElementById('post-readtime').value,
        image_url: document.getElementById('post-image').value,
        excerpt: document.getElementById('post-excerpt').value,
        is_published: document.getElementById('post-published').checked,
        content: document.getElementById('post-content').value,
        author_id: currentUser.id
    };

    let error;
    if (currentPostId) {
        const result = await supabase
            .from('blog_posts')
            .update(postData)
            .eq('id', currentPostId);
        error = result.error;
    } else {
        const result = await supabase
            .from('blog_posts')
            .insert(postData);
        error = result.error;
    }

    saveBtn.disabled = false;
    if (error) {
        statusSpan.textContent = 'Error saving!';
        statusSpan.style.color = 'red';
        console.error(error);
    } else {
        statusSpan.textContent = 'Saved!';
        statusSpan.style.color = 'green';
        setTimeout(() => { statusSpan.textContent = ''; }, 2000);
        if (!currentPostId) {
            showScreen('dashboard');
            loadPosts();
        }
    }
}

window.deletePost = async (id) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting post: ' + error.message);
    } else {
        loadPosts();
    }
};

// Projects Logic
async function loadProjects() {
    const list = document.getElementById('projects-list');
    list.innerHTML = '<div class="loading">Loading projects...</div>';

    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        list.innerHTML = `<div class="error-msg">Error loading projects: ${error.message}</div>`;
        return;
    }

    if (projects.length === 0) {
        list.innerHTML = '<div class="no-posts">No projects found. Create one!</div>';
        return;
    }

    list.innerHTML = projects.map(p => `
        <div class="post-item">
            <div class="post-info">
                <h3>${p.title}</h3>
                <div class="post-meta">
                    <span class="status-badge ${p.is_pinned ? 'status-published' : 'status-draft'}">
                        ${p.is_pinned ? 'Pinned' : 'Normal'}
                    </span>
                    <span>${(p.tech_stack || []).join(', ')}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-icon" onclick="window.editProject('${p.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="window.deleteProject('${p.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.editProject = async (id) => {
    currentProjectId = id;
    const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error loading project');
        return;
    }

    fillProjectEditor(project);
    showScreen('projectEditor');
    document.getElementById('project-editor-title').textContent = 'Edit Project';
};


function fillProjectEditor(p) {
    document.getElementById('project-title').value = p.title || '';
    document.getElementById('project-desc').value = p.description || '';
    document.getElementById('project-image').value = p.image_url || '';
    document.getElementById('project-github').value = p.github_url || '';
    document.getElementById('project-demo').value = p.demo_url || '';
    document.getElementById('project-tech').value = (p.tech_stack || []).join(', ');
    document.getElementById('project-pinned').checked = p.is_pinned || false;
}

async function saveProject() {
    const saveBtn = document.getElementById('project-save-btn');
    const statusSpan = document.getElementById('project-save-status');

    saveBtn.disabled = true;
    statusSpan.textContent = 'Saving...';

    const techStack = document.getElementById('project-tech').value
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

    const projectData = {
        title: document.getElementById('project-title').value,
        description: document.getElementById('project-desc').value,
        image_url: document.getElementById('project-image').value,
        github_url: document.getElementById('project-github').value,
        demo_url: document.getElementById('project-demo').value,
        tech_stack: techStack,
        is_pinned: document.getElementById('project-pinned').checked,
        author_id: currentUser.id
    };

    let error;
    if (currentProjectId) {
        const result = await supabase
            .from('projects')
            .update(projectData)
            .eq('id', currentProjectId);
        error = result.error;
    } else {
        const result = await supabase
            .from('projects')
            .insert(projectData);
        error = result.error;
    }

    saveBtn.disabled = false;
    if (error) {
        statusSpan.textContent = 'Error saving!';
        statusSpan.style.color = 'red';
        console.error(error);
    } else {
        statusSpan.textContent = 'Saved!';
        statusSpan.style.color = 'green';
        setTimeout(() => { statusSpan.textContent = ''; }, 2000);
        if (!currentProjectId) {
            showScreen('dashboard');
            loadProjects();
        }
    }
}

window.deleteProject = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting project: ' + error.message);
    } else {
        loadProjects();
    }
};

// Experiences Logic
async function loadExperiences() {
    const list = document.getElementById('experiences-list');
    list.innerHTML = '<div class="loading">Loading experiences...</div>';

    const { data: experiences, error } = await supabase
        .from('experiences')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) {
        list.innerHTML = `<div class="error-msg">Error loading experiences: ${error.message}</div>`;
        return;
    }

    if (experiences.length === 0) {
        list.innerHTML = '<div class="no-posts">No experiences found. Create one!</div>';
        return;
    }

    list.innerHTML = experiences.map(e => `
        <div class="post-item">
            <div class="post-info">
                <h3>${e.role}</h3>
                <div class="post-meta">
                    <span class="status-badge ${e.type === 'education' ? 'status-published' : 'status-draft'}">
                        ${e.type === 'education' ? 'Education' : 'Experience'}
                    </span>
                    <span>${e.date_range}</span>
                    <span>Order: ${e.display_order}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-icon" onclick="window.editExperience('${e.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="window.deleteExperience('${e.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

window.editExperience = async (id) => {
    currentExperienceId = id;
    const { data: experience, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        alert('Error loading experience');
        return;
    }

    fillExperienceEditor(experience);
    showScreen('experienceEditor');
    document.getElementById('experience-editor-title').textContent = 'Edit Experience';
};

function fillExperienceEditor(e) {
    document.getElementById('experience-type').value = e.type || 'education';
    document.getElementById('experience-date').value = e.date_range || '';
    document.getElementById('experience-role').value = e.role || '';
    document.getElementById('experience-org').value = e.organization || '';
    document.getElementById('experience-desc').value = e.description || '';
    document.getElementById('experience-order').value = e.display_order || 0;
}

async function saveExperience() {
    const saveBtn = document.getElementById('experience-save-btn');
    const statusSpan = document.getElementById('experience-save-status');

    saveBtn.disabled = true;
    statusSpan.textContent = 'Saving...';

    const experienceData = {
        type: document.getElementById('experience-type').value,
        date_range: document.getElementById('experience-date').value,
        role: document.getElementById('experience-role').value,
        organization: document.getElementById('experience-org').value,
        description: document.getElementById('experience-desc').value,
        display_order: parseInt(document.getElementById('experience-order').value) || 0,
        author_id: currentUser.id
    };

    let error;
    if (currentExperienceId) {
        const result = await supabase
            .from('experiences')
            .update(experienceData)
            .eq('id', currentExperienceId);
        error = result.error;
    } else {
        const result = await supabase
            .from('experiences')
            .insert(experienceData);
        error = result.error;
    }

    saveBtn.disabled = false;
    if (error) {
        statusSpan.textContent = 'Error saving!';
        statusSpan.style.color = 'red';
        console.error(error);
    } else {
        statusSpan.textContent = 'Saved!';
        statusSpan.style.color = 'green';
        setTimeout(() => { statusSpan.textContent = ''; }, 2000);
        if (!currentExperienceId) {
            showScreen('dashboard');
            loadExperiences();
        }
    }
}

window.deleteExperience = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Error deleting experience: ' + error.message);
    } else {
        loadExperiences();
    }
};

// Profile Logic
async function loadProfile() {
    const { data: profile, error } = await supabase
        .from('profile')
        .select('*')
        .single();

    if (error) {
        console.error('Error loading profile:', error);
        return;
    }

    if (profile) {
        // Hero section
        document.getElementById('profile-hero-image').value = profile.hero_image_url || '';
        if (profile.hero_image_url) {
            const previewImg = document.getElementById('profile-hero-preview-img');
            previewImg.src = profile.hero_image_url;
            previewImg.style.display = 'block';
        }

        // About section
        document.getElementById('profile-about-image').value = profile.about_image_url || '';
        document.getElementById('profile-about-subtitle').value = profile.about_subtitle || '';
        document.getElementById('profile-about-text').value = profile.about_text || '';
        if (profile.about_image_url) {
            const aboutPreviewImg = document.getElementById('profile-about-preview-img');
            aboutPreviewImg.src = profile.about_image_url;
            aboutPreviewImg.style.display = 'block';
        }

        // CV section
        document.getElementById('profile-cv').value = profile.cv_url || '';
        if (profile.cv_url) {
            document.getElementById('profile-cv-status').textContent = 'Current CV uploaded';
        }
    }
}

async function saveProfile() {
    const saveBtn = document.getElementById('profile-save-btn');
    const statusSpan = document.getElementById('profile-save-status');

    saveBtn.disabled = true;
    statusSpan.textContent = 'Saving...';

    const profileData = {
        hero_image_url: document.getElementById('profile-hero-image').value,
        about_image_url: document.getElementById('profile-about-image').value,
        about_subtitle: document.getElementById('profile-about-subtitle').value,
        about_text: document.getElementById('profile-about-text').value,
        cv_url: document.getElementById('profile-cv').value,
        updated_at: new Date().toISOString()
    };

    // Check if profile exists
    const { data: existing } = await supabase
        .from('profile')
        .select('id')
        .single();

    let error;
    if (existing) {
        const result = await supabase
            .from('profile')
            .update(profileData)
            .eq('id', existing.id);
        error = result.error;
    } else {
        const result = await supabase
            .from('profile')
            .insert(profileData);
        error = result.error;
    }

    saveBtn.disabled = false;
    if (error) {
        statusSpan.textContent = 'Error saving!';
        statusSpan.style.color = 'red';
        console.error(error);
    } else {
        statusSpan.textContent = 'Saved!';
        statusSpan.style.color = 'green';
        setTimeout(() => { statusSpan.textContent = ''; }, 2000);
    }
}

async function uploadFile(file, bucket = 'portfolio-assets') {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) {
        alert('Error uploading file: ' + error.message);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

    return publicUrl;
}

// Image Upload
async function uploadImage(file) {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
    const { data, error } = await supabase.storage
        .from('blog-images')
        .upload(fileName, file);

    if (error) {
        alert('Error uploading image: ' + error.message);
        return null;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(fileName);

    return publicUrl;
}

// Event Listeners
function updatePreview() {
    const content = document.getElementById('post-content').value;
    document.getElementById('markdown-preview').innerHTML = marked.parse(content);
}

function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Dashboard Tabs
    document.getElementById('tab-posts').addEventListener('click', () => switchTab('posts'));
    document.getElementById('tab-projects').addEventListener('click', () => switchTab('projects'));
    document.getElementById('tab-experiences').addEventListener('click', () => switchTab('experiences'));
    document.getElementById('tab-profile').addEventListener('click', () => switchTab('profile'));

    // New Button
    document.getElementById('new-btn').addEventListener('click', () => {
        if (activeTab === 'posts') {
            currentPostId = null;
            fillEditor({});
            showScreen('editor');
            document.getElementById('editor-title').textContent = 'New Post';
        } else if (activeTab === 'projects') {
            currentProjectId = null;
            fillProjectEditor({});
            showScreen('projectEditor');
            document.getElementById('project-editor-title').textContent = 'New Project';
        } else if (activeTab === 'experiences') {
            currentExperienceId = null;
            fillExperienceEditor({});
            showScreen('experienceEditor');
            document.getElementById('experience-editor-title').textContent = 'New Experience';
        }
    });

    // Search
    document.getElementById('search-input').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.post-item');
        items.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            item.style.display = title.includes(term) ? 'flex' : 'none';
        });
    });

    // Blog Editor
    document.getElementById('back-btn').addEventListener('click', () => {
        showScreen('dashboard');
        loadPosts();
    });
    document.getElementById('save-btn').addEventListener('click', savePost);
    document.getElementById('post-content').addEventListener('input', updatePreview);

    // Project Editor
    document.getElementById('project-back-btn').addEventListener('click', () => {
        showScreen('dashboard');
        loadProjects();
    });
    document.getElementById('project-save-btn').addEventListener('click', saveProject);


    // Experience Editor
    document.getElementById('experience-back-btn').addEventListener('click', () => {
        showScreen('dashboard');
        loadExperiences();
    });
    document.getElementById('experience-save-btn').addEventListener('click', saveExperience);

    // Profile Settings
    document.getElementById('profile-save-btn').addEventListener('click', saveProfile);

    const heroUploadBtn = document.getElementById('profile-hero-upload-btn');
    const heroFileInput = document.getElementById('profile-hero-upload');
    const heroUrlInput = document.getElementById('profile-hero-image');
    const heroPreviewImg = document.getElementById('profile-hero-preview-img');

    heroUploadBtn.addEventListener('click', () => heroFileInput.click());
    heroFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            heroUploadBtn.textContent = 'Uploading...';
            heroUploadBtn.disabled = true;
            const url = await uploadFile(e.target.files[0]);
            if (url) {
                heroUrlInput.value = url;
                heroPreviewImg.src = url;
                heroPreviewImg.style.display = 'block';
            }
            heroUploadBtn.textContent = 'Upload';
            heroUploadBtn.disabled = false;
            heroFileInput.value = '';
        }
    });

    const aboutUploadBtn = document.getElementById('profile-about-upload-btn');
    const aboutFileInput = document.getElementById('profile-about-upload');
    const aboutUrlInput = document.getElementById('profile-about-image');
    const aboutPreviewImg = document.getElementById('profile-about-preview-img');

    aboutUploadBtn.addEventListener('click', () => aboutFileInput.click());
    aboutFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            aboutUploadBtn.textContent = 'Uploading...';
            aboutUploadBtn.disabled = true;
            const url = await uploadFile(e.target.files[0]);
            if (url) {
                aboutUrlInput.value = url;
                aboutPreviewImg.src = url;
                aboutPreviewImg.style.display = 'block';
            }
            aboutUploadBtn.textContent = 'Upload';
            aboutUploadBtn.disabled = false;
            aboutFileInput.value = '';
        }
    });

    const cvUploadBtn = document.getElementById('profile-cv-upload-btn');
    const cvFileInput = document.getElementById('profile-cv-upload');
    const cvUrlInput = document.getElementById('profile-cv');
    const cvStatus = document.getElementById('profile-cv-status');

    cvUploadBtn.addEventListener('click', () => cvFileInput.click());
    cvFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            cvUploadBtn.textContent = 'Uploading...';
            cvUploadBtn.disabled = true;
            const url = await uploadFile(e.target.files[0]);
            if (url) {
                cvUrlInput.value = url;
                cvStatus.textContent = 'CV uploaded successfully!';
                cvStatus.style.color = 'green';
            }
            cvUploadBtn.textContent = 'Upload';
            cvUploadBtn.disabled = false;
            cvFileInput.value = '';
        }
    });

    // Image Upload (Blog)
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('image-upload');
    const urlInput = document.getElementById('post-image');

    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;
            const url = await uploadImage(e.target.files[0]);
            if (url) urlInput.value = url;
            uploadBtn.textContent = 'Upload';
            uploadBtn.disabled = false;
            fileInput.value = '';
        }
    });

    // Image Upload (Project)
    const pUploadBtn = document.getElementById('project-upload-btn');
    const pFileInput = document.getElementById('project-image-upload');
    const pUrlInput = document.getElementById('project-image');

    pUploadBtn.addEventListener('click', () => pFileInput.click());
    pFileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            pUploadBtn.textContent = 'Uploading...';
            pUploadBtn.disabled = true;
            const url = await uploadImage(e.target.files[0]);
            if (url) pUrlInput.value = url;
            pUploadBtn.textContent = 'Upload';
            pUploadBtn.disabled = false;
            pFileInput.value = '';
        }
    });

    // Auto-generate slug from title
    document.getElementById('post-title').addEventListener('blur', (e) => {
        const slugInput = document.getElementById('post-slug');
        if (!slugInput.value) {
            slugInput.value = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }
    });


}
