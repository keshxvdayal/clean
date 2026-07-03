// ---------- Scroll progress bar ----------
const progressBar = document.getElementById('progressBar');
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// ---------- Nav scroll state ----------
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

// ---------- Mobile menu ----------
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('navMobile');
burger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
});
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  });
});

// ---------- Cursor dot (desktop) ----------
const cursorDot = document.querySelector('.cursor-dot');
if (cursorDot) {
  window.addEventListener('mousemove', (e) => {
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
    cursorDot.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => cursorDot.style.opacity = '0');
}

// ---------- Parallax banner ----------
const bannerImg = document.getElementById('bannerImg');
const banner = document.getElementById('banner');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (bannerImg && !prefersReducedMotion) {
  window.addEventListener('scroll', () => {
    const rect = banner.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const offset = (rect.top - window.innerHeight / 2) * 0.12;
    bannerImg.style.transform = `translateY(${offset}px)`;
  }, { passive: true });
}

// ---------- Animated counters ----------
const counters = document.querySelectorAll('[data-count]');
function animateCounter(el) {
  const target = parseFloat(el.getAttribute('data-count'));
  const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = target * eased;
    el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterIO.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
counters.forEach(el => counterIO.observe(el));

// ---------- Magnetic buttons ----------
if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ---------- Service card 3D tilt ----------
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ---------- Hero wipe-reveal ----------
const frame = document.getElementById('heroVisual').querySelector('.visual-frame');
const cleanLayer = frame.querySelector('.clean');
const ring = document.getElementById('revealRing');
const RADIUS = 105;

function setReveal(x, y) {
  cleanLayer.style.clipPath = `circle(${RADIUS}px at ${x}px ${y}px)`;
  ring.style.left = x + 'px';
  ring.style.top = y + 'px';
}

let usingPointer = false;
frame.addEventListener('mousemove', (e) => {
  usingPointer = true;
  const rect = frame.getBoundingClientRect();
  setReveal(e.clientX - rect.left, e.clientY - rect.top);
  frame.classList.add('active');
});
frame.addEventListener('mouseleave', () => {
  usingPointer = false;
  frame.classList.remove('active');
});
frame.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (!t) return;
  const rect = frame.getBoundingClientRect();
  setReveal(t.clientX - rect.left, t.clientY - rect.top);
  frame.classList.add('active');
}, { passive: true });

// Idle ambient sweep so the effect is visible before interaction
let idleT = 0;
let idleRAF;
function idleSweep() {
  if (usingPointer) { idleRAF = requestAnimationFrame(idleSweep); return; }
  const rect = frame.getBoundingClientRect();
  if (rect.width === 0) { idleRAF = requestAnimationFrame(idleSweep); return; }
  idleT += 0.006;
  const x = rect.width * 0.5 + Math.sin(idleT) * rect.width * 0.32;
  const y = rect.height * 0.5 + Math.cos(idleT * 0.8) * rect.height * 0.28;
  setReveal(x, y);
  frame.classList.add('active');
  idleRAF = requestAnimationFrame(idleSweep);
}
idleRAF = requestAnimationFrame(idleSweep);

// ---------- Scroll reveal ----------
const revealTargets = document.querySelectorAll(
  '.service-card, .why-card, .process-step, .review-card, .price-card, .section-head, .contact-copy, .contact-form, .banner-content'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

revealTargets.forEach(el => io.observe(el));

// ---------- Contact form (demo submit) ----------
const form = document.getElementById('quoteForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    note.textContent = "Thanks — we'll be in touch within a couple of hours.";
    btn.textContent = original;
    btn.disabled = false;
    form.reset();
  }, 900);
});
