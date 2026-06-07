# High-Tech Visual Overhaul — Design Spec
Date: 2026-04-19

## Goal
Make the site look more high-tech and polished: fix all spacing/whitespace bugs, add more animations, and enhance the existing dark sci-fi aesthetic. Same content — no new pages.

## Scope

### Bugs to fix
- `Home` nav link had empty URL → already fixed (`/`)
- Inner-page banner (`intro-header.no-img`) has excessive top padding (`calc(nav-height + 3rem)`) creating a large empty area — reduce to `calc(nav-height + 1.5rem)` bottom `2rem`
- Homepage `Recent Posts` section removed (unpublished research)

### Homepage changes (`_layouts/home.html`)
- Remove the "Recent Posts" section and its `section-divider`
- Add a **Featured Projects** strip (3 curated cards: PriceIndexCalc, py_integrability_sugra, Black Hole Horizons) with category-coloured top borders (cyan/violet/violet)

### CSS enhancements (`assets/css/theme.css`)
- **Stat cards**: wrap each `.stat-item` in a glowing glass card box (neon border + pulsing glow)
- **Section divider**: add animated cyan scan-line sweep over the gradient line
- **Glass cards**: increase backdrop-filter blur, add faint shimmer sweep on hover
- **Hero badges**: stronger neon glow on hover (`box-shadow: 0 0 12px currentColor`)
- **Tech badges**: neon glow on hover matching badge colour
- **Featured project cards**: glassmorphism, category-coloured top border, lift+glow on hover

### JS enhancements (`assets/js/theme.js`)
- **Count-up animation**: stat numbers count from 0 when scrolled into view (IntersectionObserver, 1.2s duration)
- **Particle density**: increase from 90 → 140 particles, add a slow-moving large "nebula" glow orb
- **Scan-line**: CSS `@keyframes` sweep on `.section-divider::after`
- **Shimmer**: CSS `@keyframes shimmer` applied to glass-card hover via `::after` pseudo-element

### No-change items
- Page structure, content, URLs, fonts — unchanged
- All other pages (About, CV, Research, Writing) — content unchanged; only banner height fixed

## Implementation files
1. `_layouts/home.html` — remove Recent Posts, add Featured Projects
2. `assets/css/theme.css` — stat cards, scan-line, shimmer, badge glow, featured project cards
3. `assets/js/theme.js` — count-up, more particles, nebula orb
