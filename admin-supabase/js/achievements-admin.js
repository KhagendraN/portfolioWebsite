/**
 * Achievements Admin Module
 * Handles achievement CRUD operations
 */

import { supabase } from '../../js/supabase-config.js';
import { showToast, showScreen, showSpinner, confirmDialog } from './ui-utils.js';
import { getCurrentUser } from './auth.js';

// State
let currentAchievementId = null;

/**
 * Get current achievement ID
 */
export function getCurrentAchievementId() {
    return currentAchievementId;
}

/**
 * Set current achievement ID
 */
export function setCurrentAchievementId(id) {
    currentAchievementId = id;
}

/**
 * Load all achievements
 */
export async function loadAchievements() {
    const list = document.getElementById('achievements-list');
    if (!list) return;

    showSpinner('achievements-list');

    const { data: achievements, error } = await supabase
        .from('achievements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        list.innerHTML = `<div class="error-msg">Error loading achievements: ${error.message}</div>`;
        return;
    }

    if (achievements.length === 0) {
        list.innerHTML = '<div class="no-posts">No achievements found. Create one!</div>';
        return;
    }

    list.innerHTML = achievements.map(a => `
        <div class="post-item">
            <div class="post-info">
                <h3>${a.title}</h3>
                <div class="post-meta">
                    <span class="status-badge ${a.is_pinned ? 'status-published' : 'status-draft'}">
                        ${a.is_pinned ? 'Pinned' : 'Normal'}
                    </span>
                    <span>${a.issuer || 'No Issuer'}</span>
                    <span>${a.date_received ? new Date(a.date_received).toLocaleDateString() : ''}</span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn-icon edit-achievement-btn" data-id="${a.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete delete-achievement-btn" data-id="${a.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    setupAchievementEventListeners();
}

/**
 * Setup event listeners for achievement list
 */
function setupAchievementEventListeners() {
    document.querySelectorAll('.edit-achievement-btn').forEach(btn => {
        btn.addEventListener('click', () => editAchievement(btn.dataset.id));
    });

    document.querySelectorAll('.delete-achievement-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteAchievement(btn.dataset.id));
    });
}

/**
 * Edit an achievement
 */
export async function editAchievement(id) {
    currentAchievementId = id;
    const { data: achievement, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        showToast('Error loading achievement', 'error');
        return;
    }

    fillAchievementEditor(achievement);
    showScreen('achievementEditor');
    const editorTitle = document.getElementById('achievement-editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'Edit Achievement';
    }
}

/**
 * Fill achievement editor with data
 */
export function fillAchievementEditor(a) {
    const fields = [
        { id: 'achievement-title', value: a.title || '' },
        { id: 'achievement-desc', value: a.description || '' },
        { id: 'achievement-issuer', value: a.issuer || '' },
        { id: 'achievement-date', value: a.date_received || '' },
        { id: 'achievement-image', value: a.image_url || '' },
        { id: 'achievement-link', value: a.link_url || '' }
    ];

    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) el.value = field.value;
    });

    const pinnedCheckbox = document.getElementById('achievement-pinned');
    if (pinnedCheckbox) {
        pinnedCheckbox.checked = a.is_pinned || false;
    }
}

/**
 * Save achievement
 */
export async function saveAchievement() {
    const saveBtn = document.getElementById('achievement-save-btn');
    const statusSpan = document.getElementById('achievement-save-status');

    if (saveBtn) saveBtn.disabled = true;
    if (statusSpan) statusSpan.textContent = 'Saving...';

    const achievementData = {
        title: document.getElementById('achievement-title').value,
        description: document.getElementById('achievement-desc').value,
        issuer: document.getElementById('achievement-issuer').value,
        date_received: document.getElementById('achievement-date').value || null,
        image_url: document.getElementById('achievement-image').value,
        link_url: document.getElementById('achievement-link').value,
        is_pinned: document.getElementById('achievement-pinned').checked,
        author_id: getCurrentUser()?.id
    };

    let error;
    if (currentAchievementId) {
        const result = await supabase
            .from('achievements')
            .update(achievementData)
            .eq('id', currentAchievementId);
        error = result.error;
    } else {
        const result = await supabase
            .from('achievements')
            .insert(achievementData);
        error = result.error;
    }

    if (saveBtn) saveBtn.disabled = false;
    if (statusSpan) statusSpan.textContent = '';

    if (error) {
        showToast('Error saving achievement: ' + error.message, 'error');
        console.error(error);
    } else {
        showToast('Achievement saved successfully!', 'success');
        if (!currentAchievementId) {
            showScreen('dashboard');
            loadAchievements();
        }
    }
}

/**
 * Delete achievement
 */
export async function deleteAchievement(id) {
    if (!confirmDialog('Are you sure you want to delete this achievement?')) return;

    const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Error deleting achievement: ' + error.message, 'error');
    } else {
        showToast('Achievement deleted', 'success');
        loadAchievements();
    }
}

/**
 * Create new achievement
 */
export function createNewAchievement() {
    currentAchievementId = null;
    fillAchievementEditor({});
    showScreen('achievementEditor');
    const editorTitle = document.getElementById('achievement-editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'New Achievement';
    }
}

/**
 * Setup achievement editor event listeners
 */
export function setupAchievementEditorListeners() {
    const backBtn = document.getElementById('achievement-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showScreen('dashboard');
            loadAchievements();
        });
    }

    const saveBtn = document.getElementById('achievement-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveAchievement);
    }
}
