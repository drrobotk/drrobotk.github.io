# Design: 3D / Futuristic Upgrade for drrobotk.github.io

**Date:** 2026-06-07
**Branch:** `3d-futuristic` (restore point: tag `pre-3d-checkpoint` / branch `main`)

## Goal
Push the existing "Spacetime Hacker" Jekyll theme from a flat 2D-canvas look into a
genuinely 3D, dynamic, futuristic experience — without adding a build step (the site
is static Jekyll deployed on GitHub Pages).

## Existing state (what we build on)
- `assets/js/theme.js` — 2D canvas particle field, typewriter, scroll-reveal,
  stat count-up, CSS `book-stack` page-flip scroll engine, dark/light toggle.
- `assets/css/theme.css` — design tokens: `--cyan #00d4ff`, `--violet #8b5cf6`,
  `--emerald #10b981`, bg `#030a1a`; fonts Space Grotesk / Inter / JetBrains Mono.
- `_layouts/base.html` — shell; `_layouts/home.html` — `book-stack` hero pages.
- `_includes/webgl.html` — orphaned Three.js popup demo (icosahedrons + particles).

## Approach (chosen)
**Vanilla Three.js via ES-module CDN**, no bundler. A single site-wide fixed
WebGL canvas behind all content gives the whole site depth; the home hero gets the
richest treatment.

Rejected alternatives:
- *React Three Fiber* — would force a React/build toolchain onto a static Jekyll site. No.
- *Spline embed* — heavyweight iframe, less control, off-brand. No.

## Components
1. **`assets/js/three-bg.js`** — self-contained ES module:
   - Full-viewport `WebGLRenderer({ alpha:true, antialias:true })`, fixed behind content.
   - **3D particle starfield** (~1500 desktop / ~500 mobile) in cyan/violet/white,
     additive blending, gentle drift.
   - **Rotating wireframe polyhedron** (icosahedron) as a focal "spacetime lattice".
   - **Mouse parallax** (camera eases toward pointer) + **scroll-driven** camera
     dolly/rotation tying into the existing book-stack scroll.
   - Pauses rAF on `document.hidden`; clamps `setPixelRatio` to ≤2 (1 on mobile).
2. **Wiring** — `_layouts/base.html` gets `<canvas id="space-bg">`; the Three.js
   module is loaded site-wide. The old 2D `#particles-canvas` becomes the
   **fallback** (used only when WebGL is unavailable).
3. **Card depth** — subtle pointer-driven 3D tilt on `.glass-card` / `.featured-card`
   (CSS `transform: rotateX/rotateY`, JS pointer handler), respecting reduced-motion.

## Fallback / accessibility
- `hasWebGL()` guard → if false, keep the existing 2D particle canvas.
- `prefers-reduced-motion: reduce` → render one static frame, no animation loop, no tilt.
- Procedural geometry only → zero asset downloads, no loading state needed.

## Performance budget
- Desktop 60fps / mobile 30–60fps; DPR clamped; particle count scaled by device.
- Single ambient + single point light; one BufferGeometry for all particles.

## Success criteria
- Site builds with `bundle exec jekyll serve` and renders the WebGL background.
- Home hero shows the 3D field + wireframe with mouse parallax and scroll motion.
- No-WebGL and reduced-motion paths degrade gracefully.
- Restore to prior look via `git checkout main`.
