/**
 * Sections Module
 * Handles initialization of all page sections with dynamic content
 */

import { fetchProjects } from './projects-api.js';
import { fetchAchievements } from './achievements-api.js';
import { fetchExperiences } from './experience-api.js';
import { fetchProfile } from './profile-api.js';
import { getTechIconHTML } from './utils.js';

/**
 * Initialize Skills Accordion
 */
export function initSkillsAccordion() {
    const skillGroups = document.querySelectorAll('.skills__group');

    skillGroups.forEach(group => {
        const category = group.querySelector('.skills__category');

        category.addEventListener('click', () => {
            // Close all other groups
            skillGroups.forEach(otherGroup => {
                if (otherGroup !== group) {
                    otherGroup.classList.remove('active');
                }
            });

            // Toggle current group
            group.classList.toggle('active');
        });
    });
}

/**
 * Initialize Projects Section
 */
export async function initProjects() {
    const container = document.getElementById('projects-container');
    const controls = document.getElementById('projects-controls');
    const moreBtn = document.getElementById('projects-more-btn');
    const lessBtn = document.getElementById('projects-less-btn');

    if (!container) return;

    try {
        const projects = await fetchProjects();
        container.innerHTML = '';

        if (projects.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No projects found.</div>';
            return;
        }

        // Separate pinned and others
        const pinned = projects.filter(p => p.is_pinned);
        const others = projects.filter(p => !p.is_pinned);

        // Render function
        const createCard = (p, hidden = false) => {
            const card = document.createElement('div');
            card.className = 'project__card';
            if (hidden) {
                card.classList.add('project--hidden');
                card.style.display = 'none';
            }

            // Tech icons
            const techStack = p.tech_stack || [];
            const iconsHtml = techStack.map(t => `<span title="${t}">${getTechIconHTML(t)}</span>`).join(' ');

            card.innerHTML = `
                <img src="${p.image_url || 'assets/img/blog-default.jpg'}" alt="${p.title}" class="project__img" loading="lazy">
                <div class="project__info">
                    <h3 class="project__title">${p.title}</h3>
                    <p class="project__desc">${p.description}</p>
                    <div class="project__tech-icons">${iconsHtml}</div>
                    ${p.github_url ? `<a href="${p.github_url}" class="project__link" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>` : ''}
                    <button class="project__details-btn" type="button">View Details</button>
                </div>
            `;

            // Attach click event for modal
            const btn = card.querySelector('.project__details-btn');
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openProjectModal(p);
            });

            return card;
        };

        // Append Pinned
        pinned.forEach(p => container.appendChild(createCard(p)));

        // Append Others (Hidden)
        others.forEach(p => container.appendChild(createCard(p, true)));

        // Show/Hide Controls
        if (others.length > 0 && controls && moreBtn && lessBtn) {
            controls.style.display = 'block';

            moreBtn.addEventListener('click', () => {
                document.querySelectorAll('.project--hidden').forEach(el => {
                    el.style.display = 'block';
                    el.style.animation = 'fadeIn 0.5s ease';
                });
                moreBtn.style.display = 'none';
                lessBtn.style.display = 'inline-block';
            });

            lessBtn.addEventListener('click', () => {
                document.querySelectorAll('.project--hidden').forEach(el => {
                    el.style.display = 'none';
                });
                moreBtn.style.display = 'inline-block';
                lessBtn.style.display = 'none';
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
            });
        }

    } catch (err) {
        console.error('Error loading projects:', err);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading projects.</div>';
    }
}

/**
 * Open Project Modal
 */
function openProjectModal(p) {
    const modalTemplate = document.querySelector('.project__modal-template');
    if (!modalTemplate) return;

    const modal = document.createElement('div');
    modal.className = 'project__modal active';
    const content = modalTemplate.querySelector('.project__modal-content').cloneNode(true);

    content.querySelector('.project__modal-img').src = p.image_url || 'assets/img/blog-default.jpg';
    content.querySelector('.project__modal-title').textContent = p.title;
    content.querySelector('.project__modal-desc').textContent = p.description;

    // Tech icons
    const techStack = p.tech_stack || [];
    content.querySelector('.project__modal-tech-icons').innerHTML = techStack.map(t =>
        `<span class="tech-tag">${getTechIconHTML(t)} ${t}</span>`
    ).join('');

    // Links
    let links = '';
    if (p.github_url) links += `<a href="${p.github_url}" target="_blank"><i class="fab fa-github"></i> GitHub</a>`;
    if (p.demo_url) links += `<a href="${p.demo_url}" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>`;
    content.querySelector('.project__modal-links').innerHTML = links;

    modal.appendChild(content);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const closeBtn = content.querySelector('.project__modal-close');
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

/**
 * Initialize Achievements Section
 */
export async function initAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    try {
        const achievements = await fetchAchievements();
        container.innerHTML = '';

        if (achievements.length === 0) {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center;">No achievements found.</div>';
            return;
        }

        achievements.forEach(a => {
            const card = document.createElement('div');
            card.className = 'achievement__card';

            const dateStr = a.date_received ? new Date(a.date_received).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';

            const iconContent = a.image_url
                ? `<img src="${a.image_url}" alt="${a.title}" class="achievement__image" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
                   <i class="fas fa-trophy achievement__fallback-icon" style="display:none;"></i>`
                : `<i class="fas fa-trophy"></i>`;

            const iconWrapper = a.link_url && a.image_url
                ? `<a href="${a.link_url}" class="achievement__icon-link" target="_blank" rel="noopener">${iconContent}</a>`
                : `<div class="achievement__icon">${iconContent}</div>`;

            card.innerHTML = `
                ${iconWrapper}
                <div class="achievement__content">
                    <h3 class="achievement__title">${a.title}</h3>
                    <p class="achievement__issuer">${a.issuer} ${dateStr ? `• ${dateStr}` : ''}</p>
                    <p class="achievement__desc">${a.description}</p>
                    ${a.link_url ? `<a href="${a.link_url}" class="achievement__link" target="_blank" rel="noopener">View Credential <i class="fas fa-external-link-alt"></i></a>` : ''}
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error('Error loading achievements:', err);
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: red;">Error loading achievements.</div>';
    }
}

/**
 * Initialize Experience/Timeline Section
 */
export async function initExperiences() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    try {
        const experiences = await fetchExperiences();
        container.innerHTML = '';

        if (experiences.length === 0) {
            container.innerHTML = '<div style="text-align: center;">No experiences found.</div>';
            return;
        }

        // Render each experience
        experiences.forEach(exp => {
            const item = document.createElement('div');
            item.className = 'timeline__item';

            // Apply layout classes based on type
            if (exp.type === 'education') {
                item.classList.add('left');
            } else if (exp.type === 'experience') {
                item.classList.add('right');
            } else {
                item.classList.add('right');
            }

            item.setAttribute('data-type', exp.type);

            const iconClass = exp.type === 'education' ? 'fa-graduation-cap' : 'fa-briefcase';

            item.innerHTML = `
                <div class="timeline__header">
                    <div class="timeline__date">${exp.date_range}</div>
                    <div class="timeline__icon">
                        <i class="fas ${iconClass}"></i>
                    </div>
                </div>
                <div class="timeline__content">
                    <h3 class="timeline__role">${exp.role}</h3>
                    <p class="timeline__desc">${exp.description}</p>
                </div>
            `;

            container.appendChild(item);
        });

    } catch (err) {
        console.error('Error loading experiences:', err);
        container.innerHTML = '<div style="text-align: center; color: red;">Error loading experiences.</div>';
    }
}

/**
 * Initialize Profile Data
 */
export async function initProfile() {
    try {
        const profile = await fetchProfile();
        if (!profile) return;

        // Update hero image
        if (profile.hero_image_url) {
            const heroImg = document.querySelector('.hero__img');
            if (heroImg) {
                heroImg.src = profile.hero_image_url;
            }
        }

        // Update About section
        if (profile.about_image_url) {
            const aboutImg = document.querySelector('.about__img');
            if (aboutImg) {
                aboutImg.src = profile.about_image_url;
            }
        }
        if (profile.about_subtitle) {
            const aboutSubtitle = document.querySelector('.about__subtitle');
            if (aboutSubtitle) {
                aboutSubtitle.textContent = profile.about_subtitle;
            }
        }
        if (profile.about_text) {
            const aboutText = document.querySelector('.about__text');
            if (aboutText) {
                aboutText.textContent = profile.about_text;
            }
        }

        // Update CV links
        if (profile.cv_url) {
            const cvLinks = document.querySelectorAll('a[download]');
            cvLinks.forEach(link => {
                if (link.href.includes('khagendra_cv.pdf')) {
                    link.href = profile.cv_url;
                }
            });
        }

    } catch (err) {
        console.error('Error loading profile:', err);
    }
}

/**
 * Initialize Footer Year
 */
export function initFooterYear() {
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }
}

/**
 * Initialize Scroll to Top Button
 */
export function initScrollToTop() {
    const scrollTopBtn = document.querySelector('.footer__top');
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

/**
 * Initialize All Sections
 */
export function initAllSections() {
    document.addEventListener('DOMContentLoaded', async () => {
        // Initialize all sections
        initSkillsAccordion();
        initFooterYear();
        initScrollToTop();

        // Initialize async sections
        await Promise.all([
            initProjects(),
            initAchievements(),
            initExperiences(),
            initProfile()
        ]);
    });
}

// Auto-initialize when module is imported
initAllSections();
