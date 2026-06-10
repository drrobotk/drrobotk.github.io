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
    // If the Three.js WebGL background took over, skip the 2D system entirely.
    if (document.body.classList.contains('webgl-on')) return;

    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    const CONFIG = {
      count:       150,
      maxDist:     130,
      speed:       0.3,
      dotSize:     1.5,
      colorCyan:   [0, 212, 255],
      colorViolet: [139, 92, 246],
      colorWhite:  [200, 220, 255],
    };

    // Slow-drifting nebula orb
    const orb = { x: 0, y: 0, vx: 0.12, vy: 0.07, r: 200 };

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

      // Nebula orb
      orb.x += orb.vx; orb.y += orb.vy;
      if (orb.x < 0 || orb.x > W) orb.vx *= -1;
      if (orb.y < 0 || orb.y > H) orb.vy *= -1;
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, 'rgba(139,92,246,0.07)');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

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
      orb.x = W * 0.65; orb.y = H * 0.35;
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

  /* ── Stat Count-Up ── */
  function initStatCountUp() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const suffix = el.dataset.suffix || '';
        const duration = 1200;
        const start = performance.now();

        function step(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target + suffix;
        }
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    stats.forEach((el) => observer.observe(el));
  }

  /* ── Book-Stack 3D Scroll Engine ── */
  function initBookStack() {
    const stack    = document.getElementById('book-stack');
    const fog      = document.getElementById('depth-fog');
    if (!stack) return;

    const pages = Array.from(stack.querySelectorAll('.book-page'));
    const N = pages.length;
    if (!N) return;

    function setHeight() {
      stack.style.height = N * 100 + 'vh';
    }
    setHeight();
    window.addEventListener('resize', setHeight, { passive: true });

    let fogTimeout, lastProgress = 0, ticking = false;

    function render() {
      const progress = window.scrollY / window.innerHeight;
      const delta = Math.abs(progress - lastProgress);

      const cur  = Math.floor(progress);   // page index currently filling the viewport
      const frac = progress - cur;          // 0..1 progress through this page's scroll band

      pages.forEach((page, i) => {
        let rx, zi, op;

        if (i < cur) {
          // Past: flipped away and hidden
          rx = -100; zi = 0; op = 0;
        } else if (i === cur) {
          // Current: static then flips backward from top hinge
          if (frac < 0.45) {
            rx = 0; zi = 10; op = 1;
          } else {
            const t = (frac - 0.45) / 0.55;
            rx = -t * 100;            // rotates 100° back (past 90° = backface hidden)
            zi = 10;
            op = 1;
          }
        } else if (i === cur + 1 && i < N) {
          // Next page: stays hidden until the current page starts flipping away,
          // then fades in — so the 3D background shows behind the active panel
          // (and panels never double-stack over the transparent cosmos).
          rx = 0; zi = 9;
          op = frac < 0.45 ? 0 : (frac - 0.45) / 0.55;
        } else {
          // Future pages beyond next: invisible stack
          rx = 0; zi = i; op = 0;
        }

        page.style.zIndex   = zi;
        page.style.transform = `rotateX(${rx}deg)`;
        page.style.opacity   = op;
      });

      // Depth fog on fast scroll
      if (fog && delta > 0.07) {
        fog.classList.add('active');
        clearTimeout(fogTimeout);
        fogTimeout = setTimeout(() => fog.classList.remove('active'), 220);
      }

      lastProgress = progress;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(render);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    render();
  }

  /* ── Custom cursor glow (fine-pointer only) ── */
  function initCursorGlow() {
    const dot = document.getElementById('cursor-glow');
    if (!dot) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2;
    let tx = x, ty = y, shown = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!shown) { dot.classList.add('active'); shown = true; }
    }, { passive: true });
    document.addEventListener('mouseleave', () => dot.classList.remove('active'));

    const hoverSel = 'a, button, .btn-primary, .btn-secondary, .btn-ghost, .glass-card, ' +
      '.featured-card, .post-card, .hero-badge, .tech-badge, input, textarea, [role="button"]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) dot.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) dot.classList.remove('hovering');
    });

    (function follow() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(follow);
    })();
  }

  /* ── Magnetic buttons ── */
  function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-ghost').forEach((el) => {
      const strength = 0.35;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const mx = e.clientX - (r.left + r.width / 2);
        const my = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ── 3D tilt on cards ── */
  function initTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const MAX = 6;
    document.querySelectorAll('.glass-card, .featured-card, .post-card').forEach((card) => {
      card.addEventListener('mouseenter', () => { card.style.transition = 'transform 0.08s ease-out'; });
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(900px) rotateY(${px * MAX}deg) rotateX(${-py * MAX}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform = '';
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
    initStatCountUp();
    initBookStack();
    initCursorGlow();
    initMagnetic();
    initTilt();
  });
})();
