/* =============================================================================
   Dr. UK - Spacetime Hacker Theme JS
   Particles, typewriter, scroll animations, navbar effects
   ============================================================================= */

(function () {
  'use strict';

  /* ── Navbar scroll effect ── */
  function initNavbar() {
    const nav = document.querySelector('.navbar-custom');
    if (!nav) return;

    function updateNav() {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  /* ── Canvas Particle System ── */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    const CONFIG = {
      count:       90,
      maxDist:     130,
      speed:       0.3,
      dotSize:     1.5,
      colorCyan:   [0, 212, 255],
      colorViolet: [139, 92, 246],
      colorWhite:  [200, 220, 255],
    };

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }

    function randBetween(a, b) { return a + Math.random() * (b - a); }

    function createParticle() {
      const pick = Math.random();
      let color;
      if (pick < 0.5)      color = CONFIG.colorCyan;
      else if (pick < 0.75) color = CONFIG.colorViolet;
      else                  color = CONFIG.colorWhite;

      return {
        x:   randBetween(0, W),
        y:   randBetween(0, H),
        vx:  randBetween(-CONFIG.speed, CONFIG.speed),
        vy:  randBetween(-CONFIG.speed, CONFIG.speed),
        r:   randBetween(0.8, CONFIG.dotSize),
        op:  randBetween(0.3, 0.8),
        color,
        twinkleSpeed: randBetween(0.005, 0.02),
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      };
    }

    function initParticles() {
      particles = Array.from({ length: CONFIG.count }, createParticle);
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // Update & draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Twinkle
        p.op += p.twinkleSpeed * p.twinkleDir;
        if (p.op >= 0.8) p.twinkleDir = -1;
        if (p.op <= 0.2) p.twinkleDir = 1;

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -5) p.x = W + 5;
        else if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        else if (p.y > H + 5) p.y = -5;

        // Draw dot
        const [r, g, b] = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.op})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.maxDist) {
            const alpha = (1 - dist / CONFIG.maxDist) * 0.15;
            const [rr, gg, bb] = p.color;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${rr},${gg},${bb},${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      initParticles();
      draw();
    }

    window.addEventListener('resize', () => {
      cancelAnimationFrame(animId);
      resize();
      start();
    }, { passive: true });

    start();
  }

  /* ── Typewriter Effect ── */
  function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const phrases = [
      'scalable data pipelines',
      'quantum spin chain models',
      'AI-powered data platforms',
      'black hole symmetry proofs',
      'big data solutions',
      'quantum computing foundations',
      'ETL pipelines at scale',
      'supergravity & string theory',
      'ML models for production',
      'entity resolution systems',
    ];

    let phraseIdx = 0;
    let charIdx   = 0;
    let deleting  = false;
    let wait      = 0;

    function tick() {
      const phrase = phrases[phraseIdx];

      if (deleting) {
        charIdx--;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === 0) {
          deleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          wait = 400;
        }
      } else {
        charIdx++;
        el.textContent = phrase.slice(0, charIdx);
        if (charIdx === phrase.length) {
          deleting = true;
          wait = 2000;
        }
      }

      const speed = deleting ? 50 : 90;
      setTimeout(tick, wait > 0 ? wait : speed);
      wait = 0;
    }

    setTimeout(tick, 800);
  }

  /* ── Scroll Reveal ── */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    items.forEach((el) => observer.observe(el));
  }

  /* ── Dark / Light Mode Toggle ── */
  function initDarkMode() {
    const btn = document.getElementById('dark-mode-toggle');
    if (!btn) return;

    const stored = localStorage.getItem('theme');
    if (stored === 'light') {
      document.body.classList.add('light-mode');
      btn.setAttribute('aria-label', 'Switch to dark mode');
      btn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      btn.innerHTML = '<i class="fas fa-sun"></i>';
      btn.setAttribute('aria-label', 'Switch to light mode');
    }

    btn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-mode');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      btn.innerHTML = isLight
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
  }

  /* ── Mark current nav link ── */
  function initActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.navbar-nav .nav-link').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;
      if (
        (path === '/' && (href === '/' || href === '')) ||
        (href !== '/' && href !== '' && path.startsWith(href))
      ) {
        link.classList.add('active-nav');
        link.style.color = 'var(--cyan)';
      }
    });
  }

  /* ── Smooth anchor scrolls ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-height')) || 64;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParticles();
    initTypewriter();
    initReveal();
    initDarkMode();
    initActiveNav();
    initSmoothScroll();
  });
})();
