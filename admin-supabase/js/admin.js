import { supabase } from '../../js/supabase-config.js';

// State
let currentUser = null;
let currentPostId = null;

// DOM Elements
const screens = {
    login: document.getElementById('login-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    editor: document.getElementById('editor-screen')
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
        loadPosts();
    } else {
        showScreen('login');
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            currentUser = session.user;
            showScreen('dashboard');
            document.getElementById('user-email').textContent = currentUser.email;
            loadPosts();
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

// Dashboard
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

// Editor
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
function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    document.getElementById('logout-btn').addEventListener('click', logout);

    // Dashboard
    document.getElementById('new-post-btn').addEventListener('click', () => {
        currentPostId = null;
        fillEditor({});
        showScreen('editor');
        document.getElementById('editor-title').textContent = 'New Post';
    });

    document.getElementById('search-posts').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const posts = document.querySelectorAll('.post-item');
        posts.forEach(post => {
            const title = post.querySelector('h3').textContent.toLowerCase();
            post.style.display = title.includes(term) ? 'flex' : 'none';
        });
    });

    // Editor
    document.getElementById('back-btn').addEventListener('click', () => {
        showScreen('dashboard');
        loadPosts();
    });

    document.getElementById('save-btn').addEventListener('click', savePost);

    document.getElementById('post-content').addEventListener('input', updatePreview);

    // Image Upload
    const uploadBtn = document.getElementById('upload-btn');
    const fileInput = document.getElementById('image-upload');
    const urlInput = document.getElementById('post-image');

    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
            uploadBtn.textContent = 'Uploading...';
            uploadBtn.disabled = true;

            const url = await uploadImage(e.target.files[0]);
            if (url) {
                urlInput.value = url;
            }

            uploadBtn.textContent = 'Upload';
            uploadBtn.disabled = false;
            fileInput.value = '';
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

function updatePreview() {
    const content = document.getElementById('post-content').value;
    document.getElementById('markdown-preview').innerHTML = marked.parse(content);
}
