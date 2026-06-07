# Awwwards 3D — Research Dossier (for the futuristic site upgrade)

Compiled 2026-06-07 from three parallel research agents + live browsing of
[awwwards.com/websites/3d](https://www.awwwards.com/websites/3d/) and live
references (enzo-casalini.dev, apechain.com). This is the reference material
behind `2026-06-07-3d-futuristic-site-design.md`.

---

## 1. Exemplar award-winning 3D sites

| Site | Studio / author | Signature 3D effect | Stack | Most emulatable idea |
|---|---|---|---|---|
| [bruno-simon.com](https://bruno-simon.com) | Bruno Simon | Drivable car through a 3D world; projects are physical objects | Three.js + Cannon.js + GLSL | Scroll = camera rail through a scene; "collision reveals info" as hover |
| [lusion.co](https://lusion.co) | Lusion | Houdini cloth/fluid sims baked to vertex-animation textures, replayed real-time | Three.js + Houdini VAT | Encode one sim into a VAT texture, play back in a vertex shader (cinematic, cheap) |
| [unseen.co](https://unseen.co) | Unseen Studio | Infinite draggable grid; portal blend between scenes via shader mask | Three.js + troika-text + Lenis | Render 2 scenes to RenderTargets, blend in a full-screen GLSL noise mask |
| [activetheory.net](https://activetheory.net) | Active Theory | Real-time 3D "rooms" of their office; neon particle fields | Custom Hydra/WebGL + GSAP | 2–3 distinct scenes switched on nav via a dissolve shader, not page reload |
| [aristidebenoist.com](https://aristidebenoist.com) | Aristide Benoist | Image displacement through GLSL tied to cursor+scroll; riso grain | Vanilla WebGL + GLSL + GSAP | Displacement/wave vertex shader on a hero image plane, mouse-driven |
| [robinpayot.com](https://robinpayot.com) | Robin Payot | Refraction + risograph grain shader on dark bg | Three.js/R3F + GLSL | Screen-space grain post-pass + per-object refraction uniform |
| [phantom.land](https://www.phantom.land) | Phantom | Project planes with lens distortion; 78k-particle depth-map face clouds | Next + R3F + GSAP + GLSL | Sample a depth map in a vertex shader to scatter particles in Z; mouse repulsion |
| [samsy.ninja](https://samsy.ninja) | Samuel Honigstein | Cyberpunk city, wet-street reflections, volumetric bloom | Vue + Three.js TSL (WebGPU) | Screen-space reflection on bottom third for neon-on-wet-floor |
| [locomotive.ca](https://locomotive.ca) | Locomotive | Shader fluid flag; scroll-locked 3D scenes with per-section lighting | Three.js + Locomotive Scroll + GSAP | Each card = a sub-scene with its own camera target/lighting, driven by ScrollTrigger |
| [apechain.com](https://apechain.com) | Makemepulse | Single-colour bold WebGL hero, moving spotlight behind text | Next + WebGL (SOTD Jun 2026) | 1–2 colour palette + one moving spotlight behind text — restraint > noise |
| [resn.co.nz](https://resn.co.nz) | Resn | Morphing crystalline black drop; click-grab triggers animations | Custom WebGL | Morph a low-poly mesh between 3–4 vertex targets via GLSL mix() on mousedown |
| [joseph-san.com](https://joseph-san.com) | Joseph Santamaria | Tesseract card reveal; scroll camera through architectural scene | Three.js + GSAP + Blender | Drive a CatmullRomCurve3 camera path with ScrollTrigger → narrative "acts" |
| [thibault-introvigne.com](https://thibault-introvigne.com) | Thibault Introvigne | Sci-fi spaceman world; scattered collectibles | Three.js + R3F | One sun + ambient + rim light + a LUT colour-grade post-pass = sci-fi look, no 3D artist |

### Common threads (what separates award-level 3D from ordinary)
1. **Scene-as-narrative, not decoration** — projects are discovered *inside* the world; 3D is functional.
2. **One or two signature GLSL shaders** define the whole aesthetic; everything else is restrained.
3. **Scroll = camera choreography** — scroll progress mapped to `camera.position` along a curve, or to shader uniforms. Lenis smooth-scroll is near-universal.
4. **Dark bg + single accent colour + bloom/chromatic-aberration post-pass** = cinematic with near-zero art overhead.
5. **Particles that *react*** (mouse repulsion, depth maps, physics, VATs) — drifting points alone score low.
6. **Performance-first assets** — KTX2/Draco, instancing, VATs; juries score 60fps on mid-range hardware.
7. **Sound design** as an invisible ambient layer (optional, but its absence is noticed on high-effort sites).
8. **Typography integrated into the WebGL canvas** (troika-text, shader type, SplitText synced to camera beats).

---

## 2. Technique reference (vanilla Three.js + CDN, no bundler)

### CDN import map (one block in `<head>`, before any module script)
```html
<script type="importmap">
{ "imports": {
  "three":         "https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/",
  "postprocessing":"https://cdn.jsdelivr.net/npm/postprocessing@6.39.1/dist/index.esm.js"
}}
</script>
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.23/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.3.23/dist/lenis.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3/dist/ScrollTrigger.min.js"></script>
```
> Pin ALL three/addons imports to ONE three version + ONE CDN — mixing breaks `instanceof` silently.

### Technique → difficulty (porting to static Jekyll)
| Technique | Difficulty | Notes |
|---|---|---|
| Full-screen noise/gradient bg quad | Easy | `PlaneGeometry(2,2)` + ShaderMaterial + inline `snoise` (ashima) — **implemented** |
| Fresnel / rim lighting | Easy | `dot(viewDir, normal)` + AdditiveBlending — **implemented** on lattice core |
| Vertex displacement | Easy | High-poly geometry + noise in vertex shader |
| Raymarching full-screen quad (black hole, tunnel) | Easy | Zero geometry; all in fragment shader; halve march steps on mobile |
| GPU/FBO particles (curl noise + mouse repulsion) | Medium | `three/addons/misc/GPUComputationRenderer.js`; 65k particles @60fps desktop |
| Selective UnrealBloom (two-composer) | Medium | ~40 lines; the key "neon on black" move |
| `postprocessing` bloom + chromatic aberration + grain | Medium | More GPU-efficient than built-ins; add to import map |
| Lenis smooth scroll | Easy | 3kB; sync via `gsap.ticker.add(t => lenis.raf(t*1000))` |
| GSAP ScrollTrigger camera | Easy | Animate a `camState` object, set `camera.position`/`lookAt` in onUpdate |
| Custom cursor + magnetic buttons | Easy | GSAP DOM only — **implemented** (vanilla version) |
| Preloader (LoadingManager.onLoad) | Easy | GSAP reveal of `#preloader` |
| Page transitions | Easy–Hard | Barba.js / View Transitions API; renderer must persist outside swapped container |
| InstancedMesh | Easy | Mandatory for >20 identical meshes |
| Delta-time (`THREE.Clock`) | Easy | Never animate by frame count |
| Env maps instead of dynamic lights | Easy | `PMREMGenerator` + one `.hdr` |

### Renderer best-practice bootstrap
```js
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
```

### Performance & A11y guardrails (non-negotiable)
- DPR clamp ≤2 (1 on mobile). Reduce particles + march steps on mobile; drop DoF.
- Pause loop on `visibilitychange` (hidden tab).
- `prefers-reduced-motion` → freeze `uTime`, hide GPU particles, keep structural fades.
- **Text readability over particles**: backdrop-blur glass panel behind prose; `text-shadow: 0 0 30px rgba(0,0,0,.8)` on headings over canvas; WCAG AA (4.5:1) body, 7:1 small.
- Canvas: `position:fixed; z-index:-1; pointer-events:none` — never inside a scroll container.

---

## 3. Prioritized upgrade playbook (beyond the implemented v1)

Implemented in v1: shader nebula + fresnel wireframe lattice (home) + 3D particle field +
mouse parallax + scroll camera dolly + custom cursor + magnetic buttons + 3D card tilt +
WebGL/reduced-motion/mobile fallbacks.

| P | Upgrade | Why |
|---|---------|-----|
| **P1** | **Black-hole accretion-disk raymarch hero** | Single highest-impact, on-theme for a physics PhD; rare in portfolios. Full-screen fragment shader, Schwarzschild `1/r²` ray deflection, cyan→violet temperature disk, lensed starfield. |
| **P1** | **Lenis smooth scroll + GSAP ScrollTrigger** | Momentum scroll + scroll-linked camera makes it *feel* award-level. Merge into the single Three.js RAF loop. |
| **P1** | **Warped event-horizon grid** | 100×100 plane, vertex shader dips Y by `-1/r` → "spacetime curving into the singularity". |
| **P2** | **GPGPU curl-noise particles w/ mouse repulsion** | Particles that *react*, not just drift (thread #5). 128² mobile / 256² desktop. |
| **P2** | **Bloom + chromatic-aberration post-pass** | Cinematic neon glow; CA intensifies on scroll velocity. |
| **P2** | **SplitText staggered heading reveals + ScrambleText on code labels** | Typography craft; scramble fits the "hacker" theme (`01ABCDEF∇∂∫`). |
| **P3** | **Click-burst shockwave uniform**, scene transition on section cross, scramble/decode text | Polish. |

### Black-hole hero — fragment shader sketch (P1)
```glsl
// fullscreen quad + ortho cam; ro=vec3((uMouse-.5)*.6, 3.5); rd=normalize(vec3(uv,-1.5));
for (int i=0;i<80;i++){
  float r=length(pos); if(r<rs*0.8) break;
  rd -= pos * (rs/(r*r*r)) * 0.06; rd=normalize(rd);   // Schwarzschild deflection
  pos += rd * max(0.04,(r-rs)*0.12);
  float d=disk(pos,rs);                                 // swirling noise disk
  if(d>0.001){ col += diskColor(d,length(pos.xz))*transmit*step; transmit*=exp(-d*step*1.2); }
}
// + lensed starfield + cyan event-horizon glow ring
```

### Lenis + single RAF loop (P1)
```js
const lenis = new Lenis({ lerp: 0.08 });
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
function tick(t){ requestAnimationFrame(tick); lenis.raf(t); renderFrame(t*0.001); }
requestAnimationFrame(tick);   // ONE loop — never two
```

Full source detail retained in the agent transcripts; this dossier captures the actionable distillation.
