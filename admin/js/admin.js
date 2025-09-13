/**
 * Blog Admin Panel JavaScript
 * Handles authentication, post creation, and management
 */

import { 
    pushMarkdownToRepo, 
    getBlogPosts, 
    deleteBlogPost, 
    validateGitHubToken,
    checkRepositoryPermissions 
} from './github-api.js';

class BlogAdmin {
    constructor() {
        this.githubToken = null;
        this.user = null;
        this.editor = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedToken();
        this.initializeEditor();
    }

    setupEventListeners() {
        // Authentication
        document.getElementById('auth-btn').addEventListener('click', () => this.authenticate());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());

        // Editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Post actions
        document.getElementById('publish-btn').addEventListener('click', () => this.publishPost());
        document.getElementById('save-draft-btn').addEventListener('click', () => this.saveDraft());

        // Auto-generate filename from title
        document.getElementById('post-title').addEventListener('input', () => this.generateFilename());

        // Real-time preview
        document.getElementById('markdown-editor').addEventListener('input', () => this.updatePreview());
    }

    loadSavedToken() {
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            this.githubToken = savedToken;
            this.validateAndLoadUser();
        }
    }

    async authenticate() {
        const tokenInput = document.getElementById('github-token');
        const token = tokenInput.value.trim();

        if (!token) {
            this.showMessage('Please enter a GitHub token', 'error');
            return;
        }

        this.showMessage('Authenticating...', 'info');

        try {
            const result = await validateGitHubToken(token);
            
            if (result.success) {
                this.githubToken = token;
                this.user = result.user;
                
                // Save token to localStorage
                localStorage.setItem('github_token', token);
                
                // Check repository permissions
                const permResult = await checkRepositoryPermissions(token);
                if (!permResult.success || !permResult.hasWriteAccess) {
                    this.showMessage('You do not have write access to the repository', 'error');
                    return;
                }

                this.showAuthenticatedUI();
                this.showMessage('Authentication successful!', 'success');
                this.loadPosts();
            } else {
                this.showMessage('Invalid token. Please check your GitHub Personal Access Token.', 'error');
            }
        } catch (error) {
            this.showMessage('Authentication failed: ' + error.message, 'error');
        }
    }

    async validateAndLoadUser() {
        try {
            const result = await validateGitHubToken(this.githubToken);
            if (result.success) {
                this.user = result.user;
                this.showAuthenticatedUI();
                this.loadPosts();
            } else {
                this.logout();
            }
        } catch (error) {
            this.logout();
        }
    }

    showAuthenticatedUI() {
        document.getElementById('auth-section').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('editor-section').classList.remove('hidden');
        document.getElementById('posts-section').classList.remove('hidden');

        // Update user info
        document.getElementById('user-avatar').src = this.user.avatar_url;
        document.getElementById('user-name').textContent = this.user.name || this.user.login;
        document.getElementById('user-login').textContent = `@${this.user.login}`;
    }

    logout() {
        this.githubToken = null;
        this.user = null;
        localStorage.removeItem('github_token');
        
        document.getElementById('auth-section').classList.remove('hidden');
        document.getElementById('user-info').classList.add('hidden');
        document.getElementById('editor-section').classList.add('hidden');
        document.getElementById('posts-section').classList.add('hidden');
        
        document.getElementById('github-token').value = '';
        this.showMessage('Logged out successfully', 'info');
    }

    initializeEditor() {
        const textarea = document.getElementById('markdown-editor');
        this.editor = CodeMirror.fromTextArea(textarea, {
            mode: 'markdown',
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            autofocus: true,
            placeholder: 'Write your markdown content here...'
        });

        this.editor.on('change', () => {
            this.updatePreview();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.editor-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        if (tabName === 'preview') {
            this.updatePreview();
        }
    }

    updatePreview() {
        const markdown = this.editor.getValue();
        const preview = document.getElementById('markdown-preview');
        preview.innerHTML = marked.parse(markdown);
    }

    generateFilename() {
        const title = document.getElementById('post-title').value;
        if (title) {
            const date = new Date().toISOString().split('T')[0];
            const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            document.getElementById('post-filename').value = `${date}-${slug}.md`;
        }
    }

    async publishPost() {
        const title = document.getElementById('post-title').value.trim();
        const filename = document.getElementById('post-filename').value.trim();
        const genre = document.getElementById('post-genre').value;
        const excerpt = document.getElementById('post-excerpt').value.trim();
        const content = this.editor.getValue();

        if (!title || !filename || !content) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (!filename.endsWith('.md')) {
            this.showMessage('Filename must end with .md', 'error');
            return;
        }

        this.showMessage('Publishing post...', 'info');

        try {
            const frontmatter = {
                title: `"${title}"`,
                date: new Date().toISOString().split('T')[0],
                genre: genre,
                excerpt: `"${excerpt}"`,
                author: `"${this.user.name || this.user.login}"`
            };

            const result = await pushMarkdownToRepo(
                content,
                filename,
                this.githubToken,
                { frontmatter }
            );

            if (result.success) {
                this.showMessage('Post published successfully! GitHub Actions will deploy it shortly.', 'success');
                this.clearForm();
                this.loadPosts();
            } else {
                this.showMessage('Failed to publish post: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Error publishing post: ' + error.message, 'error');
        }
    }

    saveDraft() {
        const postData = {
            title: document.getElementById('post-title').value,
            filename: document.getElementById('post-filename').value,
            genre: document.getElementById('post-genre').value,
            excerpt: document.getElementById('post-excerpt').value,
            content: this.editor.getValue(),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('blog_draft', JSON.stringify(postData));
        this.showMessage('Draft saved locally', 'success');
    }

    loadDraft() {
        const draft = localStorage.getItem('blog_draft');
        if (draft) {
            try {
                const postData = JSON.parse(draft);
                document.getElementById('post-title').value = postData.title || '';
                document.getElementById('post-filename').value = postData.filename || '';
                document.getElementById('post-genre').value = postData.genre || 'tech';
                document.getElementById('post-excerpt').value = postData.excerpt || '';
                this.editor.setValue(postData.content || '');
                this.showMessage('Draft loaded', 'info');
            } catch (error) {
                console.error('Error loading draft:', error);
            }
        }
    }

    clearForm() {
        document.getElementById('post-title').value = '';
        document.getElementById('post-filename').value = '';
        document.getElementById('post-genre').value = 'tech';
        document.getElementById('post-excerpt').value = '';
        this.editor.setValue('');
        localStorage.removeItem('blog_draft');
    }

    async loadPosts() {
        try {
            const result = await getBlogPosts(this.githubToken);
            
            if (result.success) {
                this.displayPosts(result.data);
            } else {
                this.showMessage('Failed to load posts: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Error loading posts: ' + error.message, 'error');
        }
    }

    displayPosts(posts) {
        const postsList = document.getElementById('posts-list');
        
        if (posts.length === 0) {
            postsList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No blog posts found.</p>';
            return;
        }

        postsList.innerHTML = posts.map(post => `
            <div class="post-item">
                <div class="post-info">
                    <h3>${post.name}</h3>
                    <p>Size: ${(post.size / 1024).toFixed(1)} KB | Last modified: ${new Date(post.updated_at).toLocaleDateString()}</p>
                </div>
                <div class="post-actions">
                    <button class="btn btn-secondary" onclick="admin.editPost('${post.name}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="admin.deletePost('${post.name}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async deletePost(filename) {
        if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
            return;
        }

        this.showMessage('Deleting post...', 'info');

        try {
            const result = await deleteBlogPost(filename, this.githubToken);
            
            if (result.success) {
                this.showMessage('Post deleted successfully', 'success');
                this.loadPosts();
            } else {
                this.showMessage('Failed to delete post: ' + result.error, 'error');
            }
        } catch (error) {
            this.showMessage('Error deleting post: ' + error.message, 'error');
        }
    }

    editPost(filename) {
        // This would require fetching the post content and loading it into the editor
        // For now, just show a message
        this.showMessage('Edit functionality coming soon!', 'info');
    }

    showMessage(message, type) {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';

        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 5000);
    }
}

// Initialize the admin panel
const admin = new BlogAdmin();

// Make admin globally available for onclick handlers
window.admin = admin;
