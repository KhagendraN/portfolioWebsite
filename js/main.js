/*===== MENU SHOW =====*/ 
const showMenu = (toggleId, navId) =>{
    const toggle = document.getElementById(toggleId),
    nav = document.getElementById(navId)

    if(toggle && nav){
        toggle.addEventListener('click', ()=>{
            nav.classList.toggle('show')
        })
    }
}
showMenu('nav-toggle','nav-menu')

/*==================== REMOVE MENU MOBILE ====================*/
const navLink = document.querySelectorAll('.nav__link')

function linkAction(){
    const navMenu = document.getElementById('nav-menu')
    // When we click on each nav__link, we remove the show-menu class
    navMenu.classList.remove('show')
}
navLink.forEach(n => n.addEventListener('click', linkAction))

/*==================== SCROLL SECTIONS ACTIVE LINK ====================*/
const sections = document.querySelectorAll('section[id]')

const scrollActive = () =>{
    const scrollDown = window.scrollY

  sections.forEach(current =>{
        const sectionHeight = current.offsetHeight,
              sectionTop = current.offsetTop - 58,
              sectionId = current.getAttribute('id'),
              sectionsClass = document.querySelector('.nav__menu a[href*=' + sectionId + ']')
        
        if(scrollDown > sectionTop && scrollDown <= sectionTop + sectionHeight){
            sectionsClass.classList.add('active-link')
        }else{
            sectionsClass.classList.remove('active-link')
        }                                                    
    })
}
window.addEventListener('scroll', scrollActive)

/*===== NAVBAR STICKY/FADE EFFECT ON SCROLL =====*/
window.addEventListener('scroll', function() {
    var header = document.querySelector('.l-header');
    if (window.scrollY > 10) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

/*===== SCROLL REVEAL ANIMATION =====*/
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2000,
    delay: 200,
//     reset: true
});

sr.reveal('.home__data, .about__img, .skills__subtitle, .skills__text',{}); 
sr.reveal('.home__img, .about__subtitle, .about__text, .skills__img',{delay: 400}); 
sr.reveal('.home__social-icon',{ interval: 200}); 
sr.reveal('.skills__data, .work__img, .contact__input',{interval: 200}); 

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
document.querySelectorAll('.skills__data').forEach(function(skill) {
    var bar = skill.querySelector('.skills__bar');
    var percent = skill.querySelector('.skills__percentage');
    if (bar && percent) {
        var width = percent.textContent.trim();
        bar.style.transition = 'width 1s cubic-bezier(.77,0,.18,1)';
        skill.addEventListener('mouseenter', function() {
            bar.style.width = width;
        });
        skill.addEventListener('focus', function() {
            bar.style.width = width;
        });
        skill.addEventListener('mouseleave', function() {
            bar.style.width = '0';
        });
        skill.addEventListener('blur', function() {
            bar.style.width = '0';
        });
    }
});

/*===== PROJECT CARD MODAL PREVIEW (RICHER, BUTTON ONLY) =====*/
// Remove old card click handler if present
// Add event listener to .project__details-btn only
function getTechIcon(tech) {
    // Map tech to icon HTML (FontAwesome/Boxicons/emoji)
    switch (tech.trim()) {
        case 'Python': return '<span class="project__modal-tech-icon" data-tech="Python" title="Python"><i class="fab fa-python"></i></span>';
        case 'C': return '<span class="project__modal-tech-icon" data-tech="C" title="C"><i class="fas fa-code"></i></span>';
        case 'Java': return '<span class="project__modal-tech-icon" data-tech="Java" title="Java"><i class="fab fa-java"></i></span>';
        case 'Linux': return '<span class="project__modal-tech-icon" data-tech="Linux" title="Linux"><i class="fab fa-linux"></i></span>';
        case 'AI': return '<span class="project__modal-tech-icon" data-tech="AI" title="AI"><i class="fas fa-brain"></i></span>';
        case 'Networking': return '<span class="project__modal-tech-icon" data-tech="Networking" title="Networking"><i class="fas fa-network-wired"></i></span>';
        default: return '<span class="project__modal-tech-icon" data-tech="'+tech+'">'+tech+'</span>';
    }
}
document.querySelectorAll('.project__details-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var card = btn.closest('.project__card');
        var modalTemplate = document.querySelector('.project__modal-template');
        if (!modalTemplate) return;
        var modal = document.createElement('div');
        modal.className = 'project__modal active';
        // Clone modal content
        var content = modalTemplate.firstElementChild.cloneNode(true);
        // Fill modal content from card data attributes
        content.querySelector('.project__modal-title').textContent = card.getAttribute('data-title') || '';
        content.querySelector('.project__modal-desc').textContent = card.getAttribute('data-desc') || '';
        var img = content.querySelector('.project__modal-img');
        img.src = card.getAttribute('data-img') || '';
        img.alt = card.getAttribute('data-title') || 'Project preview';
        // Tech stack icons
        var techs = (card.getAttribute('data-tech')||'').split(',');
        var techIcons = '';
        techs.forEach(function(tech) { if(tech.trim()) techIcons += getTechIcon(tech); });
        content.querySelector('.project__modal-tech-icons').innerHTML = techIcons;
        // Links
        var links = '';
        var github = card.getAttribute('data-github');
        if (github) links += '<a href="'+github+'" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>';
        var demo = card.getAttribute('data-demo');
        if (demo) links += '<a href="'+demo+'" target="_blank" rel="noopener"><i class="fas fa-external-link-alt"></i> Demo/README</a>';
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
        modal.addEventListener('click', function(ev) {
            if (ev.target === modal) closeModal();
        });
        document.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', esc); }
        });
    });
});

/*===== HERO SCROLL INDICATOR SMOOTH SCROLL =====*/
document.querySelectorAll('.hero__scroll-indicator').forEach(function(indicator) {
    indicator.addEventListener('click', function(e) {
        e.preventDefault();
        var about = document.getElementById('about');
        if (about) {
            about.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

/*===== TIMELINE FADE-IN ON SCROLL =====*/
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < window.innerHeight - 60 &&
        rect.bottom > 60
    );
}
function revealTimeline() {
    document.querySelectorAll('.timeline__item').forEach(function(item) {
        if (isInViewport(item)) {
            item.style.opacity = 1;
            item.style.transform = 'translateY(0)';
        } else {
            item.style.opacity = 0;
            item.style.transform = 'translateY(40px)';
        }
    });
}
window.addEventListener('scroll', revealTimeline);
window.addEventListener('resize', revealTimeline);
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.timeline__item').forEach(function(item) {
        item.style.transition = 'opacity 0.7s, transform 0.7s';
        item.style.opacity = 0;
        item.style.transform = 'translateY(40px)';
    });
    revealTimeline();
    var yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    var formStatus = document.getElementById('form-status');
    if (formStatus) { formStatus.textContent = ''; }
});

/*===== DARK/LIGHT MODE TOGGLE =====*/
(function() {
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
    toggleBtn.addEventListener('click', function() {
        dark = !body.classList.contains(darkClass);
        setTheme(dark);
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
})();

/*===== VIEW MORE/LESS PROJECTS BUTTONS =====*/
(function() {
    var moreBtn = document.getElementById('projects-more-btn');
    var lessBtn = document.getElementById('projects-less-btn');
    var hiddenProjects = document.querySelectorAll('.project--hidden');
    var projectsSection = document.getElementById('projects');
    if (!moreBtn || !lessBtn) return;
    moreBtn.addEventListener('click', function() {
        hiddenProjects.forEach(function(card) {
            card.style.display = '';
        });
        moreBtn.style.display = 'none';
        lessBtn.style.display = '';
    });
    lessBtn.addEventListener('click', function() {
        hiddenProjects.forEach(function(card) {
            card.style.display = 'none';
        });
        lessBtn.style.display = 'none';
        moreBtn.style.display = '';
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
})();

(function() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var status = document.getElementById('form-status');
    function setStatus(msg, isError) {
        if (!status) return;
        status.textContent = msg;
        status.className = isError ? 'form-status form-status--error' : 'form-status form-status--ok';
        status.setAttribute('aria-live', 'polite');
    }
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    form.addEventListener('submit', function(e) {
        var name = form.querySelector('input[name="name"]');
        var email = form.querySelector('input[name="email"]');
        var message = form.querySelector('textarea[name="message"]');
        setStatus('', false);
        [name, email, message].forEach(function(el){ if (el) el.classList.remove('input-error'); });
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

document.addEventListener('DOMContentLoaded', function() {
  function revealSections() {
    document.querySelectorAll('.section').forEach(function(section) {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 60) {
        section.classList.add('visible');
      }
    });
  }
  window.addEventListener('scroll', revealSections);
  window.addEventListener('resize', revealSections);
  revealSections();
});

