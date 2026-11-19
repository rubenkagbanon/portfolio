/* ===== PORTFOLIO SCRIPT ===== */

// ── THEME ──
const THEME_KEY = 'fns-theme';
const body = document.body;
const themeBtn = document.getElementById('themeBtn');
const themeIcon = document.getElementById('themeIcon');

function applyTheme(theme) {
  if (theme === 'light') {
    body.classList.add('light');
    themeIcon.textContent = '☀';
  } else {
    body.classList.remove('light');
    themeIcon.textContent = '◐';
  }
}

const saved = localStorage.getItem(THEME_KEY);
if (saved) {
  applyTheme(saved);
} else {
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(prefersLight ? 'light' : 'dark');
}

themeBtn?.addEventListener('click', () => {
  const isLight = body.classList.contains('light');
  const next = isLight ? 'dark' : 'light';
  applyTheme(next);
  localStorage.setItem(THEME_KEY, next);
});

// ── MOBILE MENU ──
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');
const mobileLinks = document.querySelectorAll('.mobile-link');

function openMenu() {
  mobileMenu.classList.add('active');
  mobileOverlay.classList.add('active');
  body.style.overflow = 'hidden';
}
function closeMenu() {
  mobileMenu.classList.remove('active');
  mobileOverlay.classList.remove('active');
  body.style.overflow = '';
}

menuBtn?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
mobileOverlay?.addEventListener('click', closeMenu);
mobileLinks.forEach(l => l.addEventListener('click', closeMenu));

// ── HEADER SCROLL ──
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header?.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

// ── ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// ── CURSOR ──
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mx = 0, my = 0;
let cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if (cursorDot) {
    cursorDot.style.left = mx + 'px';
    cursorDot.style.top  = my + 'px';
  }
}, { passive: true });

function animateCursor() {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  if (cursor) {
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .tech-pill, .filter-btn, .project-card, .cert-card[data-link]').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (!cursor) return;
    cursor.style.width = '48px';
    cursor.style.height = '48px';
    cursor.style.borderColor = 'var(--neon)';
    cursor.style.background = 'rgba(0,245,255,0.05)';
  });
  el.addEventListener('mouseleave', () => {
    if (!cursor) return;
    cursor.style.width = '32px';
    cursor.style.height = '32px';
    cursor.style.background = 'transparent';
  });
});

document.querySelectorAll('.cert-card[data-link]').forEach(card => {
  const openLink = () => {
    const url = card.dataset.link;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };
  card.addEventListener('click', openLink);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLink();
    }
  });
});

// ── REVEAL ON SCROLL ──
// Le delay est calculé par SECTION, pas par index global.
// Ainsi chaque groupe d'éléments visibles ensemble s'anime en cascade,
// sans délai cumulatif absurde pour les sections éloignées.

const revealEls = document.querySelectorAll('.reveal');

// Assigner un index LOCAL à chaque élément .reveal dans sa section parente
revealEls.forEach(el => {
  const parentSection = el.closest('section') || el.closest('.container') || el.parentElement;
  if (!parentSection._revealCounter) parentSection._revealCounter = 0;
  el.dataset.delay = parentSection._revealCounter * 80;
  parentSection._revealCounter++;
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay) || 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
        // Animer les barres de compétences si présentes dans cet élément
        entry.target.querySelectorAll('.bar-fill').forEach(fill => {
          fill.style.width = fill.dataset.w + '%';
        });
      }, delay);
      revealObserver.unobserve(entry.target); // Une seule fois, pas de boucle
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// ── COMPTEURS STATS ──
function animateStatCounters() {
  document.querySelectorAll('.num-value').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (target <= 0 || el.dataset.animated === 'true') return;
    el.dataset.animated = 'true';

    let current = 0;
    const interval = 200;
    const duration = 4000;
    const step = Math.max(1, Math.ceil(target / (duration / interval)));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      } else {
        el.textContent = current;
      }
    }, interval);
  });
}

const aboutStats = document.querySelector('.about-stats');
if (aboutStats) {
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateStatCounters();
      statsObserver.unobserve(entries[0].target); // Une seule fois
    }
  }, { threshold: 0.25 });
  statsObserver.observe(aboutStats);
}

// ── BARRES DE COMPÉTENCES ──
const skillSection = document.getElementById('skills');
if (skillSection) {
  const skillObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.bar-fill').forEach(fill => {
        fill.style.width = fill.dataset.w + '%';
      });
      skillObserver.unobserve(entries[0].target); // Une seule fois
    }
  }, { threshold: 0.1 });
  skillObserver.observe(skillSection);
}

// ── TYPED TEXT ──
const typedEl = document.getElementById('typedText');
const words = ['Data Scientist', 'Mobile Apps', 'ML Engineer', 'React Native Apps', 'Data Analyst', 'Django Backends'];
let wi = 0, ci = 0, deleting = false, pausing = false;

function typeLoop() {
  if (!typedEl) return;
  const word = words[wi];
  if (pausing) {
    pausing = false;
    setTimeout(typeLoop, 1400);
    return;
  }
  if (!deleting) {
    typedEl.textContent = word.slice(0, ++ci);
    if (ci === word.length) { pausing = true; deleting = true; }
    setTimeout(typeLoop, 90);
  } else {
    typedEl.textContent = word.slice(0, --ci);
    if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    setTimeout(typeLoop, pausing ? 1200 : 50);
  }
}
setTimeout(typeLoop, 1000);

// ── GRID CANVAS ──
const canvas = document.getElementById('gridCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let W, H;

  function resizeCanvas() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    drawGrid();
  }

  function drawGrid() {
    ctx.clearRect(0, 0, W, H);
    const gap = 50;
    ctx.strokeStyle = '#00f5ff';
    ctx.lineWidth = 0.4;
    for (let x = 0; x < W; x += gap) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gap) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
}

// ── PROJECT FILTER ──
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.display = match ? '' : 'none';
      if (match) card.style.animation = 'fadeIn 0.3s ease forwards';
    });
  });
});

// ── CONTACT FORM + EMAILJS ──
const contactForm = document.getElementById('contactForm');

// EmailJS : init après chargement complet de la page
window.addEventListener('load', () => {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: 'zNY6DfPspNqEMTqdu' });
    console.log('✅ EmailJS initialisé');
  } else {
    console.error('❌ EmailJS non chargé — vérifie le script dans <head>');
  }
});

contactForm?.addEventListener('submit', e => {
  e.preventDefault();

  if (typeof emailjs === 'undefined') {
    alert('Erreur : EmailJS non chargé. Vérifie ta connexion internet.');
    return;
  }

  // Injecter l'heure pour la variable {{time}} dans le template
  let timeInput = contactForm.querySelector('input[name="time"]');
  if (!timeInput) {
    timeInput = document.createElement('input');
    timeInput.type = 'hidden';
    timeInput.name = 'time';
    contactForm.appendChild(timeInput);
  }
  timeInput.value = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Envoi en cours...';

  emailjs.sendForm('service_q6dctvo', 'template_46s53zc', contactForm)
    .then(() => {
      btn.textContent = '✓ Message envoyé !';
      btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      contactForm.reset();
    })
    .catch(error => {
      console.error('EmailJS error:', error);
      btn.textContent = 'Échec. Réessaie';
      btn.style.background = 'linear-gradient(135deg, #f97316, #dc2626)';
    })
    .finally(() => {
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = originalText;
        btn.style.background = '';
      }, 3000);
    });
});

// ── FOOTER LOGO ANIMATION ──
// Le logo RK du footer s'anime une seule fois quand le footer devient visible
const footerLogo = document.querySelector('.footer .rk-logo-svg');
if (footerLogo) {
  const footerLogoObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      footerLogo.classList.add('rk-animate');
      footerLogoObserver.unobserve(entries[0].target); // une seule fois
    }
  }, { threshold: 0.5 });
  footerLogoObserver.observe(footerLogo);
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});