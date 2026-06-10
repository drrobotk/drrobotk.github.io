/* =============================================================================
   Dr. UK — Spacetime Hacker 3D Background (Three.js / WebGL)
   ---------------------------------------------------------------------------
   One scene, one render call:
     • renderOrder -1 — full-screen animated simplex-noise NEBULA (cyan/violet)
     • a 3D PARTICLE STARFIELD + (home only) a rotating wireframe "spacetime
       lattice" (icosahedra) with a fresnel-glow core
   Interaction: eased mouse parallax + scroll-linked camera dolly.
   Always animates (prefers-reduced-motion is deliberately ignored — owner's
   choice; a frozen background reads as broken). Degradation: no WebGL →
   2D #particles-canvas; hidden tab → loop pauses; DPR clamped; particle
   count scaled on mobile.
   The bright lattice is HOME-ONLY so it never sits behind article text.
   ============================================================================= */

// Self-hosted Three.js r160 (no CDN / no importmap) so the WebGL background is
// not blocked by ad-blockers, Enhanced Tracking Protection, or browsers without
// import-map support (e.g. older Firefox). Relative to /assets/js/.
import * as THREE from './vendor/three.module.js';

(function () {
  const canvas = document.getElementById('space-bg');
  if (!canvas) return;

  function hasWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }
  if (!hasWebGL()) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches ||
                   /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isHome = document.body.classList.contains('has-hero');

  try {
    /* ---- renderer (autoClear on — single scene) ---- */
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance',
    });
    // On mobile the canvas is transparent so the CSS cosmic gradient shows through
    // (we skip the costly nebula shader there); on desktop it's an opaque backdrop.
    renderer.setClearColor(0x030a1a, isMobile ? 0 : 1);
    // Clamp DPR hard on mobile — the per-pixel work is what triggers GPU context
    // loss / thermal throttling on phones.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2));
    let W = window.innerWidth, H = window.innerHeight;
    renderer.setSize(W, H, false);

    const CYAN   = new THREE.Color(0x00d4ff);
    const VIOLET = new THREE.Color(0x8b5cf6);
    const WHITE  = new THREE.Color(0xc8dcff);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 14);

    /* =====================================================================
       full-screen nebula quad — camera-independent (NDC) vertex shader
       ===================================================================== */
    const bgUniforms = {
      uTime:   { value: 0 },
      uRes:    { value: new THREE.Vector2(W, H) },
      uCyan:   { value: CYAN },
      uViolet: { value: VIOLET },
      uMouse:  { value: new THREE.Vector2(0.5, 0.5) },
    };
    const bgQuad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        uniforms: bgUniforms,
        depthTest: false, depthWrite: false,
        vertexShader: `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
        `,
        fragmentShader: `
          precision highp float;
          varying vec2 vUv;
          uniform float uTime;
          uniform vec2  uRes;
          uniform vec2  uMouse;
          uniform vec3  uCyan;
          uniform vec3  uViolet;

          vec3 mod289(vec3 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
          vec2 mod289(vec2 x){ return x - floor(x * (1.0/289.0)) * 289.0; }
          vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }
          float snoise(vec2 v){
            const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                               -0.577350269189626, 0.024390243902439);
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz; x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
            m = m*m; m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x  = a0.x  * x0.x  + h.x  * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
          }
          float fbm(vec2 p){
            float s = 0.0, a = 0.5;
            for(int i=0;i<5;i++){ s += a*snoise(p); p *= 2.02; a *= 0.5; }
            return s;
          }
          void main(){
            vec2 uv = vUv;
            vec2 p = (uv - 0.5) * vec2(uRes.x/uRes.y, 1.0);
            float t = uTime * 0.03;
            vec2 q = vec2(fbm(p*1.5 + t), fbm(p*1.5 - t + 5.2));
            float n = fbm(p*2.0 + q*1.2 + vec2(t*0.5));
            n = smoothstep(-0.6, 0.9, n);
            float md = distance(uv, uMouse);
            float glow = smoothstep(0.55, 0.0, md) * 0.30;
            vec3 base = vec3(0.012, 0.039, 0.102);
            vec3 col = base;
            col = mix(col, uViolet * 0.65, n * 0.34);
            col = mix(col, uCyan   * 0.75, pow(n, 2.0) * 0.26 + glow * 0.85);
            float vig = smoothstep(1.25, 0.12, length(p));
            col *= 0.6 + 0.4 * vig;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      })
    );
    bgQuad.frustumCulled = false;
    bgQuad.renderOrder = -1;          // drawn first, as the background
    // Desktop only — on mobile the CSS gradient stands in for the nebula so the
    // GPU isn't running a 5-octave fbm per pixel every frame (context-loss risk).
    if (!isMobile) scene.add(bgQuad);

    /* =====================================================================
       particle starfield
       ===================================================================== */
    const COUNT = isMobile ? 900 : (isHome ? 3800 : 1600);
    const SPREAD = 30;
    const pgeo = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    const pcol = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = (Math.random() - 0.5) * SPREAD;
      pos[i*3+1] = (Math.random() - 0.5) * SPREAD;
      pos[i*3+2] = (Math.random() - 0.5) * SPREAD;
      const r = Math.random();
      const c = r < 0.5 ? CYAN : (r < 0.8 ? VIOLET : WHITE);
      pcol[i*3] = c.r; pcol[i*3+1] = c.g; pcol[i*3+2] = c.b;
    }
    pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pgeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));

    const sprite = (() => {
      const s = 64, cv = document.createElement('canvas'); cv.width = cv.height = s;
      const g = cv.getContext('2d');
      const grd = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
      grd.addColorStop(0,   'rgba(255,255,255,1)');
      grd.addColorStop(0.3, 'rgba(255,255,255,0.6)');
      grd.addColorStop(1,   'rgba(255,255,255,0)');
      g.fillStyle = grd; g.fillRect(0, 0, s, s);
      return new THREE.CanvasTexture(cv);
    })();

    const points = new THREE.Points(pgeo, new THREE.PointsMaterial({
      size: isMobile ? 0.28 : 0.24,
      map: sprite,
      vertexColors: true,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.95,
      sizeAttenuation: true,
    }));
    scene.add(points);

    /* =====================================================================
       wireframe spacetime lattice — HOME ONLY
       ===================================================================== */
    const lattice = new THREE.Group();
    scene.add(lattice);
    let core = null;
    if (isHome && !isMobile) {
      lattice.add(new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(4.2, 1)),
        new THREE.LineBasicMaterial({ color: CYAN, transparent: true, opacity: 0.9,
          depthTest: false, blending: THREE.AdditiveBlending })
      ));
      lattice.add(new THREE.LineSegments(
        new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(5.8, 1)),
        new THREE.LineBasicMaterial({ color: VIOLET, transparent: true, opacity: 0.45,
          depthTest: false, blending: THREE.AdditiveBlending })
      ));
      core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(3.0, 2),
        new THREE.ShaderMaterial({
          transparent: true, blending: THREE.AdditiveBlending,
          depthTest: false, depthWrite: false,
          uniforms: { uCyan: { value: CYAN }, uViolet: { value: VIOLET } },
          vertexShader: `
            varying float vF;
            void main(){
              vec3 nrm = normalize(normalMatrix * normal);
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              vec3 vd = normalize(-mv.xyz);
              vF = pow(1.0 - max(dot(nrm, vd), 0.0), 2.5);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: `
            varying float vF;
            uniform vec3 uCyan; uniform vec3 uViolet;
            void main(){
              vec3 c = mix(uViolet, uCyan, vF);
              gl_FragColor = vec4(c, vF * 0.85);
            }`,
        })
      );
      lattice.add(core);
    }

    /* =====================================================================
       interaction
       ===================================================================== */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.tx = (e.clientX / window.innerWidth) - 0.5;
      mouse.ty = (e.clientY / window.innerHeight) - 0.5;
      bgUniforms.uMouse.value.set(e.clientX / window.innerWidth,
                                  1.0 - e.clientY / window.innerHeight);
    }, { passive: true });

    let scrollY = window.scrollY;
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      bgUniforms.uRes.value.set(W, H);
    }
    window.addEventListener('resize', resize, { passive: true });

    function renderFrame(t) {
      bgUniforms.uTime.value = t;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      const sn = scrollY / Math.max(window.innerHeight, 1);
      camera.position.x = mouse.x * 3.0;
      camera.position.y = -mouse.y * 2.0 - Math.min(sn, 4) * 0.9;
      camera.position.z = 14 - Math.min(sn, 3) * 1.5;
      camera.lookAt(0, 0, 0);

      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.05) * 0.1;
      lattice.rotation.y = t * 0.08 + mouse.x * 0.6;
      lattice.rotation.x = t * 0.04 + mouse.y * 0.4;
      if (core) core.scale.setScalar(1 + Math.sin(t * 0.6) * 0.02);

      renderer.render(scene, camera);
    }

    document.body.classList.add('webgl-on');
    /* diagnostic handle (harmless; lets a quick console/eval confirm geometry) */
    window.__bg = { renderer, scene, info: () => renderer.info.render };

    const clock = new THREE.Clock();
    let running = false;
    let contextLost = false;
    // Cap mobile to ~30fps: the per-frame GPU work is what overheats phones and
    // makes the browser drop the WebGL context (the "background disappears" bug).
    const minFrameMs = isMobile ? 1000 / 30 : 0;
    let lastDraw = -1e9;

    function loop(nowMs) {
      if (!running || contextLost) return;
      if (nowMs - lastDraw >= minFrameMs) {
        lastDraw = nowMs;
        try { renderFrame(clock.getElapsedTime()); }
        catch (e) { /* context lost mid-render — the handler below recovers it */ }
      }
      requestAnimationFrame(loop);
    }
    function start() {
      if (running || contextLost) return;
      running = true;
      requestAnimationFrame(loop);
    }

    /* ── WebGL context loss is routine on mobile (GPU memory pressure). Recover
       gracefully instead of leaving a blank page; the CSS cosmic gradient stays
       visible behind the canvas throughout the gap. ── */
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();              // required, or the browser won't restore it
      contextLost = true; running = false;
    }, false);
    canvas.addEventListener('webglcontextrestored', () => {
      contextLost = false;             // three.js re-uploads its GL resources here
      resize();
      if (!document.hidden) start();
    }, false);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else start();
    });
    start();
  } catch (err) {
    document.body.classList.remove('webgl-on');
    console.warn('[three-bg] WebGL init failed, using 2D fallback:', err);
  }
})();
