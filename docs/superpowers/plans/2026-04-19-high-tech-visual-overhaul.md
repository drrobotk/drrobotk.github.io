# High-Tech Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the dark sci-fi website with neon-glow stat cards, animated count-up stats, a featured projects strip, denser particles with nebula orb, scan-line section dividers, shimmer card effects, and fix the oversized inner-page banner.

**Architecture:** Pure CSS/JS/HTML modifications to the existing Jekyll theme. All changes are additive to `theme.css` and `theme.js`, with one structural edit to `home.html`. No new pages, no new dependencies.

**Tech Stack:** Jekyll (Liquid templates), vanilla CSS, vanilla JS (already loaded via `theme.js`), existing FontAwesome icons.

---

### Task 1: Fix inner-page banner height

**Files:**
- Modify: `assets/css/theme.css` (around line 1096 — `.intro-header.no-img`)

Inner pages (Projects, About, Research, CV, Writing) have a huge empty gap above the page title because `.intro-header.no-img` uses `padding: calc(var(--nav-height) + 3rem) 2rem 3rem` — that's 7rem+ of top padding. Reduce it.

- [ ] **Step 1: Edit the padding in theme.css**

Find this block (around line 1093):
```css
.intro-header.no-img {
  background: linear-gradient(180deg, var(--bg2) 0%, var(--bg) 100%);
  border-bottom: 1px solid var(--border);
  padding: calc(var(--nav-height) + 3rem) 2rem 3rem;
  text-align: center;
  position: relative;
}
```

Change only the `padding` line:
```css
  padding: calc(var(--nav-height) + 1rem) 2rem 2rem;
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:4000/projects` — the gap between navbar and "Projects" heading should be much tighter (roughly 1 viewport-height less white space).

- [ ] **Step 3: Commit**

```bash
cd /Users/drrobot/drrobotk.github.io
git add assets/css/theme.css
git commit -m "fix: reduce inner-page banner top padding"
```

---

### Task 2: Neon-glow stat cards

**Files:**
- Modify: `assets/css/theme.css` (`.hero-stats`, `.stat-item`, `.stat-number`, `.stat-label` block around line 568)

Currently stats are plain text floated in a row. Wrap each in a glowing glass card.

- [ ] **Step 1: Replace the stat item CSS block**

Find this block (around line 568):
```css
.hero-stats {
  display: flex;
  gap: 2.5rem;
  margin-top: 2rem;
  opacity: 0;
  animation: fadeInUp 0.8s forwards 1.1s;
}

.stat-item { text-align: left; }
.stat-number {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.stat-label {
  font-size: 0.8rem;
  color: var(--text3);
  font-family: var(--font-mono);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-top: 0.25rem;
}
```

Replace with:
```css
.hero-stats {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  opacity: 0;
  animation: fadeInUp 0.8s forwards 1.1s;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  padding: 1rem 1.5rem;
  background: rgba(0,212,255,0.04);
  border: 1px solid rgba(0,212,255,0.18);
  border-radius: var(--radius);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 90px;
}

.stat-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%);
  pointer-events: none;
}

.stat-item:hover {
  border-color: rgba(0,212,255,0.4);
  box-shadow: 0 0 24px rgba(0,212,255,0.15), inset 0 0 16px rgba(0,212,255,0.04);
  transform: translateY(-2px);
}

@keyframes statPulse {
  0%, 100% { box-shadow: 0 0 12px rgba(0,212,255,0.1); }
  50%       { box-shadow: 0 0 28px rgba(0,212,255,0.25); }
}

.stat-item { animation: statPulse 3s ease-in-out infinite; }

.stat-number {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text3);
  font-family: var(--font-mono);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 0.4rem;
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `http://localhost:4000` — the three stat items (15+, 5, PhD) should now appear as glowing glass pill cards with a subtle cyan pulse.

- [ ] **Step 3: Commit**

```bash
git add assets/css/theme.css
git commit -m "feat: neon-glow glass cards for hero stats"
```

---

### Task 3: Count-up animation for stat numbers

**Files:**
- Modify: `assets/js/theme.js` — add `initStatCountUp()` function and call it in the boot block

- [ ] **Step 1: Add the count-up function**

In `theme.js`, after the `initSmoothScroll` function and before the `/* ── Boot ──*/` comment, insert:

```js
  /* ── Stat Count-Up ── */
  function initStatCountUp() {
    const stats = document.querySelectorAll('.stat-number[data-target]');
    if (!stats.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
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
      },
      { threshold: 0.5 }
    );

    stats.forEach((el) => observer.observe(el));
  }
```

- [ ] **Step 2: Call it in the boot block**

Find:
```js
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParticles();
    initTypewriter();
    initReveal();
    initDarkMode();
    initActiveNav();
    initSmoothScroll();
  });
```

Replace with:
```js
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParticles();
    initTypewriter();
    initReveal();
    initDarkMode();
    initActiveNav();
    initSmoothScroll();
    initStatCountUp();
  });
```

- [ ] **Step 3: Add data-target attributes to stat numbers in home.html**

In `_layouts/home.html`, find:
```html
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">15+</div>
          <div class="stat-label">Years Coding</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">5</div>
          <div class="stat-label">Publications</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">PhD</div>
          <div class="stat-label">Maths &amp; Physics</div>
        </div>
      </div>
```

Replace with:
```html
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number" data-target="15" data-suffix="+">15+</div>
          <div class="stat-label">Years Coding</div>
        </div>
        <div class="stat-item">
          <div class="stat-number" data-target="5" data-suffix="">5</div>
          <div class="stat-label">Publications</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">PhD</div>
          <div class="stat-label">Maths &amp; Physics</div>
        </div>
      </div>
```

(PhD is text not a number, so no count-up — it just displays as-is.)

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:4000`. On first load the stats should count up from 0 → 15+ and 0 → 5 when they scroll into view.

- [ ] **Step 5: Commit**

```bash
git add assets/js/theme.js _layouts/home.html
git commit -m "feat: count-up animation for hero stat numbers"
```

---

### Task 4: Scan-line animation on section dividers

**Files:**
- Modify: `assets/css/theme.css` — `.section-divider` block (around line 644)

- [ ] **Step 1: Replace section-divider CSS**

Find:
```css
/* Divider */
.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border2), transparent);
  margin: 0;
}
```

Replace with:
```css
/* Divider */
.section-divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border2), transparent);
  margin: 0;
  position: relative;
  overflow: hidden;
}

.section-divider::after {
  content: '';
  position: absolute;
  top: 0;
  left: -30%;
  width: 30%;
  height: 100%;
  background: linear-gradient(to right, transparent, var(--cyan), transparent);
  animation: scanLine 4s linear infinite;
  opacity: 0.6;
}

@keyframes scanLine {
  0%   { left: -30%; }
  100% { left: 130%; }
}
```

- [ ] **Step 2: Verify in browser**

Reload `http://localhost:4000`. The thin horizontal lines between sections should now have a cyan light that sweeps across them left-to-right on a loop.

- [ ] **Step 3: Commit**

```bash
git add assets/css/theme.css
git commit -m "feat: animated scan-line sweep on section dividers"
```

---

### Task 5: Shimmer effect on glass cards + badge glow

**Files:**
- Modify: `assets/css/theme.css` — `.glass-card` block and `.hero-badge` block

- [ ] **Step 1: Add shimmer to glass cards**

Find the `.glass-card` block (around line 661). After the existing `.glass-card:hover` rule (around line 683), insert:

```css
.glass-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    105deg,
    transparent 40%,
    rgba(255,255,255,0.04) 50%,
    transparent 60%
  );
  transition: left 0.6s ease;
  pointer-events: none;
}

.glass-card:hover::after {
  left: 150%;
}
```

- [ ] **Step 2: Add glow to hero badges on hover**

Find:
```css
.hero-badge.cyan { border-color: rgba(0,212,255,0.4); color: var(--cyan); background: rgba(0,212,255,0.08); }
.hero-badge.violet { border-color: rgba(139,92,246,0.4); color: var(--violet); background: rgba(139,92,246,0.08); }
.hero-badge.emerald { border-color: rgba(16,185,129,0.4); color: var(--emerald); background: rgba(16,185,129,0.08); }
```

Add after these three lines:
```css
.hero-badge { transition: all 0.2s ease; cursor: default; }
.hero-badge.cyan:hover   { box-shadow: 0 0 12px rgba(0,212,255,0.5);    background: rgba(0,212,255,0.14);   transform: translateY(-1px); }
.hero-badge.violet:hover { box-shadow: 0 0 12px rgba(139,92,246,0.5);  background: rgba(139,92,246,0.14);  transform: translateY(-1px); }
.hero-badge.emerald:hover{ box-shadow: 0 0 12px rgba(16,185,129,0.5);  background: rgba(16,185,129,0.14);  transform: translateY(-1px); }
```

- [ ] **Step 3: Add glow to tech badges on hover**

Find `.tech-badge:hover` (around line 770):
```css
.tech-badge:hover {
  border-color: var(--border3);
  color: var(--text);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
```

Replace with:
```css
.tech-badge:hover {
  border-color: rgba(0,212,255,0.4);
  color: var(--cyan);
  transform: translateY(-2px);
  box-shadow: 0 0 14px rgba(0,212,255,0.25), 0 4px 12px rgba(0,0,0,0.3);
}
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:4000`. Hovering a glass card should show a subtle white shimmer sweep. Hovering badges should show neon glow lift.

- [ ] **Step 5: Commit**

```bash
git add assets/css/theme.css
git commit -m "feat: shimmer on glass cards, neon glow on badges"
```

---

### Task 6: More particles + slow nebula orb

**Files:**
- Modify: `assets/js/theme.js` — `initParticles()` function

- [ ] **Step 1: Increase particle count and add nebula orb**

Find the CONFIG object inside `initParticles()`:
```js
    const CONFIG = {
      count:       90,
      maxDist:     130,
      speed:       0.3,
      dotSize:     1.5,
      colorCyan:   [0, 212, 255],
      colorViolet: [139, 92, 246],
      colorWhite:  [200, 220, 255],
    };
```

Replace with:
```js
    const CONFIG = {
      count:       140,
      maxDist:     130,
      speed:       0.3,
      dotSize:     1.5,
      colorCyan:   [0, 212, 255],
      colorViolet: [139, 92, 246],
      colorWhite:  [200, 220, 255],
    };

    // Slow-drifting nebula orb
    const orb = {
      x: 0, y: 0,
      vx: 0.12, vy: 0.08,
      r: 180,
    };
```

- [ ] **Step 2: Draw the orb in the draw loop**

Inside the `draw()` function, find `ctx.clearRect(0, 0, W, H);` and insert right after it:

```js
      // Draw nebula orb
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < 0 || orb.x > W) orb.vx *= -1;
      if (orb.y < 0 || orb.y > H) orb.vy *= -1;
      const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grad.addColorStop(0, 'rgba(139,92,246,0.06)');
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
```

- [ ] **Step 3: Initialise orb position in start()**

Find the `start()` function:
```js
    function start() {
      resize();
      initParticles();
      draw();
    }
```

Replace with:
```js
    function start() {
      resize();
      orb.x = W * 0.6;
      orb.y = H * 0.4;
      initParticles();
      draw();
    }
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:4000`. The hero particle field should be noticeably denser, and a soft violet glow orb should drift slowly across it.

- [ ] **Step 5: Commit**

```bash
git add assets/js/theme.js
git commit -m "feat: denser particles + slow drifting nebula orb in hero"
```

---

### Task 7: Remove Recent Posts, add Featured Projects strip

**Files:**
- Modify: `_layouts/home.html`

- [ ] **Step 1: Remove the Recent Posts section**

In `_layouts/home.html`, find and delete the entire block from:
```html
<div class="section-divider"></div>

<!-- ═══════════════════════════════════════════════
     RECENT POSTS
```
...all the way through to (and including) the closing `</section>` of that block and the next `<div class="section-divider"></div>` after it:
```html
</section>

<div class="section-divider"></div>

<!-- ═══════════════════════════════════════════════
     TECH STACK
```

So after deletion, the "What I Do" `</section>` is followed immediately by the `<div class="section-divider"></div>` and then the Tech Stack section.

- [ ] **Step 2: Add Featured Projects strip after the What I Do section**

After the `</section>` that closes the "What I Do" cards section and before the first `<div class="section-divider"></div>` that leads into Tech Stack, insert:

```html
<div class="section-divider"></div>

<!-- ═══════════════════════════════════════════════
     FEATURED PROJECTS
═══════════════════════════════════════════════ -->
<section class="section reveal">
  <div class="section-header">
    <p class="section-label">Selected Work</p>
    <h2 class="section-title">Featured Projects</h2>
    <p class="section-desc">A curated selection — <a href="{{ '/projects' | relative_url }}">view all projects →</a></p>
  </div>

  <div class="featured-projects-grid">
    <div class="featured-card cyan-top reveal reveal-delay-1">
      <div class="featured-card-category cyan">Data Engineering</div>
      <h3 class="featured-card-title">PriceIndexCalc</h3>
      <p class="featured-card-desc">Open-source Python package for computing bilateral and multilateral price indices. Used by the Office for National Statistics to track least-cost grocery items at scale.</p>
      <div class="featured-card-footer">
        <span class="tech-tag">Python</span>
        <span class="tech-tag">Pandas</span>
        <span class="tech-tag">PyPI</span>
        <a href="https://github.com/drrobotk/PriceIndexCalc" target="_blank" rel="noopener" class="featured-card-link">GitHub <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="featured-card violet-top reveal reveal-delay-2">
      <div class="featured-card-category violet">Physics &amp; Maths</div>
      <h3 class="featured-card-title">py_integrability_sugra</h3>
      <p class="featured-card-desc">Symbolic verification engine for Killing Spinor Equation integrability in supergravity theories. Covers D=4–11 (IIA, heterotic, M-theory) with a unified 9-step pipeline driven by a JSON theory schema.</p>
      <div class="featured-card-footer">
        <span class="tech-tag">Python</span>
        <span class="tech-tag">Cadabra2</span>
        <span class="tech-tag">Supergravity</span>
        <a href="https://github.com/drrobotk/py_integrability_sugra" target="_blank" rel="noopener" class="featured-card-link">GitHub <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>

    <div class="featured-card violet-top reveal reveal-delay-3">
      <div class="featured-card-category violet">PhD Research</div>
      <h3 class="featured-card-title">Black Hole Horizons</h3>
      <p class="featured-card-desc">Proved dynamical supersymmetry enhancement theorems for black hole horizons in type IIA, massive IIA, D=5, and D=6 supergravity — part of the string/M-theory landscape.</p>
      <div class="featured-card-footer">
        <span class="tech-tag">String Theory</span>
        <span class="tech-tag">Supergravity</span>
        <span class="tech-tag">5 Papers</span>
        <a href="{{ '/cv' | relative_url }}" class="featured-card-link">Publications <i class="fas fa-arrow-right"></i></a>
      </div>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Add CSS for featured project cards**

In `assets/css/theme.css`, at the very end of the file, append:

```css
/* =============================================================================
   FEATURED PROJECTS (homepage)
   ============================================================================= */

.featured-projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.featured-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: transparent;
  transition: background 0.3s;
}

.featured-card.cyan-top::before  { background: linear-gradient(to right, var(--cyan), var(--emerald)); }
.featured-card.violet-top::before { background: linear-gradient(to right, var(--violet), var(--cyan)); }

.featured-card:hover {
  transform: translateY(-5px);
  border-color: var(--border2);
}

.featured-card.cyan-top:hover   { box-shadow: 0 8px 40px rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.3); }
.featured-card.violet-top:hover { box-shadow: 0 8px 40px rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.3); }

/* Shimmer on hover */
.featured-card::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%; height: 100%;
  background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%);
  transition: left 0.55s ease;
  pointer-events: none;
}
.featured-card:hover::after { left: 150%; }

.featured-card-category {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
}
.featured-card-category.cyan   { color: var(--cyan); }
.featured-card-category.violet { color: var(--violet); }

.featured-card-title {
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.featured-card-desc {
  font-size: 0.875rem;
  color: var(--text2);
  line-height: 1.65;
  flex: 1;
  margin: 0;
}

.featured-card-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.featured-card-link {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--cyan) !important;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  transition: gap 0.2s;
}
.featured-card-link:hover { gap: 0.5rem; text-decoration: none; }
```

- [ ] **Step 4: Verify in browser**

Reload `http://localhost:4000`. The "Recent Posts" section should be gone. Scrolling below "What I Do" should reveal the "Featured Projects" strip with 3 glowing cards.

- [ ] **Step 5: Commit**

```bash
git add _layouts/home.html assets/css/theme.css
git commit -m "feat: replace recent posts with featured projects strip on homepage"
```

---

### Task 8: Final verification pass

- [ ] **Step 1: Check all pages in browser**

Using the Playwright MCP browser, visit each page and take a screenshot:
- `http://localhost:4000/` — hero, stats cards, What I Do, Featured Projects, Tech Stack, Publications
- `http://localhost:4000/projects` — tighter banner, project cards
- `http://localhost:4000/aboutme` — tighter banner
- `http://localhost:4000/cv` — tighter banner
- `http://localhost:4000/research` — tighter banner

- [ ] **Step 2: Click the Home nav link from /projects**

Should return to `/`. (Already fixed — verify it's still working.)

- [ ] **Step 3: Check mobile responsiveness**

Resize browser to 768px width. Hero should stack vertically (photo above text). Stat cards should wrap. Featured cards should go single column.

- [ ] **Step 4: Final commit if any last-minute fixes needed**

```bash
git add -A
git commit -m "fix: visual polish tweaks from final verification"
```
