/**
 * Experience Admin Module
 * Handles experience CRUD operations
 */

import { supabase } from '../../js/supabase-config.js';
import { showToast, showScreen, showSpinner, confirmDialog } from './ui-utils.js';
import { getCurrentUser } from './auth.js';

// State
let currentExperienceId = null;

/**
 * Get current experience ID
 */
export function getCurrentExperienceId() {
    return currentExperienceId;
}

/**
 * Set current experience ID
 */
export function setCurrentExperienceId(id) {
    currentExperienceId = id;
}

/**
 * Load all experiences
 */
export async function loadExperiences() {
    const list = document.getElementById('experiences-list');
    if (!list) return;

    showSpinner('experiences-list');

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
                <button class="btn-icon edit-experience-btn" data-id="${e.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete delete-experience-btn" data-id="${e.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners
    setupExperienceEventListeners();
}

/**
 * Setup event listeners for experience list
 */
function setupExperienceEventListeners() {
    document.querySelectorAll('.edit-experience-btn').forEach(btn => {
        btn.addEventListener('click', () => editExperience(btn.dataset.id));
    });

    document.querySelectorAll('.delete-experience-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteExperience(btn.dataset.id));
    });
}

/**
 * Edit an experience
 */
export async function editExperience(id) {
    currentExperienceId = id;
    const { data: experience, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        showToast('Error loading experience', 'error');
        return;
    }

    fillExperienceEditor(experience);
    showScreen('experienceEditor');
    const editorTitle = document.getElementById('experience-editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'Edit Experience';
    }
}

/**
 * Fill experience editor with data
 */
export function fillExperienceEditor(e) {
    const fields = [
        { id: 'experience-type', value: e.type || 'education' },
        { id: 'experience-date', value: e.date_range || '' },
        { id: 'experience-role', value: e.role || '' },
        { id: 'experience-org', value: e.organization || '' },
        { id: 'experience-desc', value: e.description || '' },
        { id: 'experience-order', value: e.display_order || 0 }
    ];

    fields.forEach(field => {
        const el = document.getElementById(field.id);
        if (el) el.value = field.value;
    });
}

/**
 * Save experience
 */
export async function saveExperience() {
    const saveBtn = document.getElementById('experience-save-btn');
    const statusSpan = document.getElementById('experience-save-status');

    if (saveBtn) saveBtn.disabled = true;
    if (statusSpan) statusSpan.textContent = 'Saving...';

    const experienceData = {
        type: document.getElementById('experience-type').value,
        date_range: document.getElementById('experience-date').value,
        role: document.getElementById('experience-role').value,
        organization: document.getElementById('experience-org').value,
        description: document.getElementById('experience-desc').value,
        display_order: parseInt(document.getElementById('experience-order').value) || 0,
        author_id: getCurrentUser()?.id
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

    if (saveBtn) saveBtn.disabled = false;
    if (statusSpan) statusSpan.textContent = '';

    if (error) {
        showToast('Error saving experience: ' + error.message, 'error');
        console.error(error);
    } else {
        showToast('Experience saved successfully!', 'success');
        if (!currentExperienceId) {
            showScreen('dashboard');
            loadExperiences();
        }
    }
}

/**
 * Delete experience
 */
export async function deleteExperience(id) {
    if (!confirmDialog('Are you sure you want to delete this experience?')) return;

    const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Error deleting experience: ' + error.message, 'error');
    } else {
        showToast('Experience deleted', 'success');
        loadExperiences();
    }
}

/**
 * Create new experience
 */
export function createNewExperience() {
    currentExperienceId = null;
    fillExperienceEditor({});
    showScreen('experienceEditor');
    const editorTitle = document.getElementById('experience-editor-title');
    if (editorTitle) {
        editorTitle.textContent = 'New Experience';
    }
}

/**
 * Setup experience editor event listeners
 */
export function setupExperienceEditorListeners() {
    const backBtn = document.getElementById('experience-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            showScreen('dashboard');
            loadExperiences();
        });
    }

    const saveBtn = document.getElementById('experience-save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveExperience);
    }
}
