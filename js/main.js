/*===== MENU SHOW =====*/
const showMenu = (toggleId, navId) => {
    const toggle = document.getElementById(toggleId),
        nav = document.getElementById(navId)

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle', 'nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction() {
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
/*==================== SCROLL SECTIONS ACTIVE LINK (IntersectionObserver) ====================*/
const sections = document.querySelectorAll('section[id]');

const activeLinkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            document.querySelectorAll('.nav__menu a').forEach(link => {
                link.classList.remove('active-link');
            });
            const activeLink = document.querySelector(`.nav__menu a[href*=${id}]`);
            if (activeLink) activeLink.classList.add('active-link');
        }
    });
}, { threshold: 0.5 });

sections.forEach(section => activeLinkObserver.observe(section));

/*===== NAVBAR STICKY/FADE EFFECT ON SCROLL =====*/
/*===== NAVBAR STICKY (IntersectionObserver) =====*/
const header = document.querySelector('.l-header');
const topSentinel = document.createElement('div');
topSentinel.style.position = 'absolute';
topSentinel.style.top = '0';
topSentinel.style.height = '1px';
topSentinel.style.width = '100%';
topSentinel.style.zIndex = '-1';
document.body.prepend(topSentinel);

const navObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
navObserver.observe(topSentinel);

/*===== SCROLL REVEAL ANIMATION =====*/
if (typeof ScrollReveal !== 'undefined') {
    const sr = ScrollReveal({
        origin: 'top',
        distance: '60px',
        duration: 2000,
        delay: 200,
        //     reset: true
    });

    sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text', {});
    sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img', { delay: 400 });
    sr.reveal('.home__social-icon', { interval: 200 });
    sr.reveal('.skills__data, .work__img, .contact__input', { interval: 200 });
} else {
    console.warn('ScrollReveal is not defined. Content will be visible by default.');
    // Ensure content is visible if ScrollReveal fails
    document.querySelectorAll('.home__data, .about__img, .skills__subtitle, .skills__text, .home__img, .about__subtitle, .about__text, .skills__img, .home__social-icon, .skills__data, .work__img, .contact__input').forEach(el => {
        el.style.visibility = 'visible';
        el.style.opacity = '1';
    });
}

/*====Download CV===*/
document.querySelector(".button").addEventListener("click", function (event) {
    event.preventDefault(); // Prevent default anchor behavior

    const cvFilePath = "assets/files/khagendra_cv.pdf"; // Path to your CV file

    const tempLink = document.createElement("a");
    tempLink.href = cvFilePath;
    tempLink.download = "Khagendra_CV.pdf";
    document.body.appendChild(tempLink); // Append the link to the document
    tempLink.click(); // Programmatically click the link
    document.body.removeChild(tempLink); // Remove the link after download
});

/*===== SKILL BAR ANIMATION ON HOVER/FOCUS =====*/
/*===== SKILL BAR ANIMATION ON HOVER/FOCUS =====*/
document.querySelectorAll('.skills__data').forEach(skill => {
    const bar = skill.querySelector('.skills__bar');
    const percent = skill.querySelector('.skills__percentage');
    if (bar && percent) {
        const width = percent.textContent.trim();
        bar.style.transition = 'width 1s cubic-bezier(.77,0,.18,1)';
        skill.addEventListener('mouseenter', () => {
            bar.style.width = width;
        });
        skill.addEventListener('focus', () => {
            bar.style.width = width;
        });
        skill.addEventListener('mouseleave', () => {
            bar.style.width = '0';
        });
        skill.addEventListener('blur', () => {
            bar.style.width = '0';
        });
    }
});

/*===== PROJECT CARD MODAL PREVIEW (RICHER, BUTTON ONLY) =====*/
// Remove old card click handler if present
// Add event listener to .project__details-btn only
import { getTechIconSpan } from './utils.js';

document.querySelectorAll('.project__details-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.project__card');
        const modalTemplate = document.querySelector('.project__modal-template');
        if (!modalTemplate) return;
        const modal = document.createElement('div');
        modal.className = 'project__modal active';
        // Clone modal content
        const content = modalTemplate.firstElementChild.cloneNode(true);
        // Fill modal content from card data attributes
        content.querySelector('.project__modal-title').textContent = card.getAttribute('data-title') || '';
        content.querySelector('.project__modal-desc').textContent = card.getAttribute('data-desc') || '';
        const img = content.querySelector('.project__modal-img');
        img.src = card.getAttribute('data-img') || '';
        img.alt = card.getAttribute('data-title') || 'Project preview';
        // Tech stack icons
        const techs = (card.getAttribute('data-tech') || '').split(',');
        let techIcons = '';
        techs.forEach(tech => { if (tech.trim()) techIcons += getTechIconSpan(tech); });
        content.querySelector('.project__modal-tech-icons').innerHTML = techIcons;
        // Links
        let links = '';
        const github = card.getAttribute('data-github');
        if (github) links += '<a href="' + github + '" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>';
        const demo = card.getAttribute('data-demo');
        if (demo) links += '<a href="' + demo + '" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Demo/README</a>';
        content.querySelector('.project__modal-links').innerHTML = links;
        modal.appendChild(content);
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        content.querySelector('.project__modal-close').focus();
        // Close modal on click X or outside
        function closeModal() {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
        }
        content.querySelector('.project__modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (ev) => {
            if (ev.target === modal) closeModal();
        });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); }
        });
    });
});

/*===== HERO SCROLL INDICATOR SMOOTH SCROLL =====*/
// Removed: CSS scroll-behavior: smooth handles this natively.

/*===== TIMELINE FADE-IN ON SCROLL =====*/
/*===== TIMELINE FADE-IN (IntersectionObserver) =====*/
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        } else {
            // Toggle back to hidden if desired, or remove this else block to keep it visible once revealed
            entry.target.style.opacity = 0;
            entry.target.style.transform = 'translateY(40px)';
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

document.addEventListener('DOMContentLoaded', () => {
    // Initialize timeline items
    document.querySelectorAll('.timeline__item').forEach(item => {
        item.style.transition = 'opacity 0.7s, transform 0.7s';
        item.style.opacity = 0;
        item.style.transform = 'translateY(40px)';
        timelineObserver.observe(item);
    });

    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const formStatus = document.getElementById('form-status');
    if (formStatus) { formStatus.textContent = ''; }
});

/*===== DARK/LIGHT MODE TOGGLE =====*/
(function () {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    const icon = toggleBtn.querySelector('i');
    const body = document.body;
    const darkClass = 'dark-mode';
    function setTheme(dark) {
        if (dark) {
            body.classList.add(darkClass);
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            body.classList.remove(darkClass);
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }
    }
    // Load preference
    let dark = false;
    if (localStorage.getItem('theme') === 'dark') {
        dark = true;
    } else if (localStorage.getItem('theme') === 'light') {
        dark = false;
    } else {
        dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    setTheme(dark);
    toggleBtn.addEventListener('click', function () {
        dark = !body.classList.contains(darkClass);
        setTheme(dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
})();

/*===== VIEW MORE/LESS PROJECTS BUTTONS =====*/
(() => {
    const moreBtn = document.getElementById('projects-more-btn');
    const lessBtn = document.getElementById('projects-less-btn');
    const hiddenProjects = document.querySelectorAll('.project--hidden');
    const projectsSection = document.getElementById('projects');
    if (!moreBtn || !lessBtn) return;
    moreBtn.addEventListener('click', () => {
        hiddenProjects.forEach(card => {
            card.style.display = '';
        });
        moreBtn.style.display = 'none';
        lessBtn.style.display = '';
    });
    lessBtn.addEventListener('click', () => {
        hiddenProjects.forEach(card => {
            card.style.display = 'none';
        });
        lessBtn.style.display = 'none';
        moreBtn.style.display = '';
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
})();

(() => {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    function setStatus(msg, isError) {
        if (!status) return;
        status.textContent = msg;
        status.className = isError ? 'form-status form-status--error' : 'form-status form-status--ok';
        status.setAttribute('aria-live', 'polite');
    }
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    form.addEventListener('submit', (e) => {
        const name = form.querySelector('input[name="name"]');
        const email = form.querySelector('input[name="email"]');
        const message = form.querySelector('textarea[name="message"]');
        setStatus('', false);
        [name, email, message].forEach(el => { if (el) el.classList.remove('input-error'); });
        if (!name.value.trim()) {
            name.classList.add('input-error');
            name.focus();
            setStatus('Please enter your name.', true);
            e.preventDefault();
            return;
        }
        if (!email.value.trim() || !isValidEmail(email.value.trim())) {
            email.classList.add('input-error');
            email.focus();
            setStatus('Please provide a valid email address.', true);
            e.preventDefault();
            return;
        }
        if (!message.value.trim()) {
            message.classList.add('input-error');
            message.focus();
            setStatus('Please enter a message.', true);
            e.preventDefault();
            return;
        }
        // Allow submit to proceed for Formspree
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    /*===== SECTION REVEAL (IntersectionObserver) =====*/
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -60px 0px" });

    document.querySelectorAll('.section').forEach(function (section) {
        sectionObserver.observe(section);
    });
});
