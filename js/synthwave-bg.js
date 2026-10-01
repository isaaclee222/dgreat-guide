/*
  Synthwave animated background. Procedural canvas: starfield, sun, scrolling
  perspective grid. Optimized to avoid full-scene 60fps redraw cost:
   - single 2D canvas, devicePixelRatio capped
   - static sky/sun layer is cached and only rebuilt on resize
   - animation frame rate is capped while preserving the same visual elements
   - pauses when the tab is hidden
   - prefers-reduced-motion → draws one static frame, no loop
  Mounted behind everything at z-index -3 (content panels sit on top).
*/
(function () {
  'use strict';
  if (document.getElementById('synthwave-bg')) return;

  const motionQuery = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = Boolean(motionQuery && motionQuery.matches);
  const canvas = document.createElement('canvas');
  canvas.id = 'synthwave-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-3;pointer-events:none;';
  document.documentElement.style.background = '#0b0418';
  (document.body || document.documentElement).appendChild(canvas);

  const ctx = canvas.getContext('2d', { alpha: false });
  let W = 0, H = 0, DPR = 1, horizon = 0;
  let stars = [];
  let raf = 0;
  let resizeRaf = 0;
  let t = 0;
  let lastFrame = 0;
  const TARGET_FPS = 30;
  const FRAME_MS = 1000 / TARGET_FPS;
  const staticCanvas = document.createElement('canvas');
  const staticCtx = staticCanvas.getContext('2d', { alpha: false });

  function resize() {
    // A lower cap keeps the fixed full-screen canvas from monopolizing weak GPUs.
    DPR = Math.min(1.25, window.devicePixelRatio || 1);
    W = canvas.width = staticCanvas.width = Math.max(1, Math.floor(innerWidth * DPR));
    H = canvas.height = staticCanvas.height = Math.max(1, Math.floor(innerHeight * DPR));
    horizon = H * 0.62;
    const count = Math.floor((W * horizon) / (17000 * DPR));
    stars = Array.from({ length: Math.min(180, count) }, () => ({
      x: Math.random() * W,
      y: Math.random() * horizon * 0.96,
      r: (Math.random() * 1.2 + 0.45) * DPR,
      p: Math.random() * Math.PI * 2,
      s: 0.6 + Math.random() * 1.8
    }));
    drawStaticLayer();
  }

  function drawStaticLayer() {
    staticCtx.clearRect(0, 0, W, H);
    drawSky(staticCtx);
    drawSun(staticCtx);
  }

  function drawSky(target) {
    const sky = target.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, '#0b0418');
    sky.addColorStop(0.55, '#1c0838');
    sky.addColorStop(1, '#43125f');
    target.fillStyle = sky;
    target.fillRect(0, 0, W, horizon);
  }

  function drawStars() {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < stars.length; i++) {
      const st = stars[i];
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.0006 * st.s + st.p));
      ctx.globalAlpha = tw * 0.9;
      ctx.fillRect(st.x, st.y, st.r, st.r);
    }
    ctx.globalAlpha = 1;
  }

  function drawSun(target) {
    const cx = W * 0.5;
    const r = Math.min(W, H) * 0.16;
    const cy = horizon - r * 0.25;
    const glow = target.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.4);
    glow.addColorStop(0, 'rgba(255,138,60,.5)');
    glow.addColorStop(0.5, 'rgba(255,43,214,.18)');
    glow.addColorStop(1, 'rgba(255,43,214,0)');
    target.fillStyle = glow;
    target.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8);

    const sun = target.createLinearGradient(0, cy - r, 0, cy + r);
    sun.addColorStop(0, '#ffd23c');
    sun.addColorStop(0.55, '#ff8a3c');
    sun.addColorStop(1, '#ff2bd6');
    target.save();
    target.beginPath();
    target.arc(cx, cy, r, Math.PI, 0);
    target.lineTo(cx + r, horizon);
    target.lineTo(cx - r, horizon);
    target.closePath();
    target.clip();
    target.fillStyle = sun;
    target.fillRect(cx - r, cy - r, r * 2, r * 2);
    target.fillStyle = '#0b0418';
    const slits = 5;
    for (let i = 0; i < slits; i++) {
      const yy = cy + (i / slits) * r * 0.9;
      target.fillRect(cx - r, yy, r * 2, (1.5 + i * 1.4) * DPR);
    }
    target.restore();
  }

  function drawGrid() {
    const ground = ctx.createLinearGradient(0, horizon, 0, H);
    ground.addColorStop(0, '#2b0a4e');
    ground.addColorStop(1, '#0b0418');
    ctx.fillStyle = ground;
    ctx.fillRect(0, horizon, W, H - horizon);

    ctx.lineWidth = Math.max(1, DPR);
    ctx.strokeStyle = 'rgba(255,43,214,.55)';
    ctx.shadowColor = 'rgba(255,43,214,.7)';
    ctx.shadowBlur = 5 * DPR;

    const cx = W * 0.5;
    const spread = W * 1.6;
    const lanes = 17;
    ctx.beginPath();
    for (let i = 0; i <= lanes; i++) {
      const f = i / lanes - 0.5;
      ctx.moveTo(cx + f * W * 0.22, horizon);
      ctx.lineTo(cx + f * spread, H);
    }
    ctx.stroke();

    const speed = (t * 0.00012) % 1;
    ctx.strokeStyle = 'rgba(34,211,238,.5)';
    ctx.shadowColor = 'rgba(34,211,238,.6)';
    ctx.beginPath();
    const rows = 11;
    for (let i = 0; i < rows; i++) {
      const p = ((i / rows) + speed) % 1;
      const y = horizon + Math.pow(p, 2.6) * (H - horizon);
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.beginPath();
    ctx.moveTo(0, horizon);
    ctx.lineTo(W, horizon);
    ctx.stroke();
  }

  function drawFrame(now) {
    t = now;
    ctx.drawImage(staticCanvas, 0, 0);
    drawStars();
    drawGrid();
  }

  function frame(now) {
    if (now - lastFrame >= FRAME_MS || !lastFrame) {
      lastFrame = now;
      drawFrame(now);
    }
    if (!reduced) raf = requestAnimationFrame(frame);
  }

  function start() {
    cancelAnimationFrame(raf);
    lastFrame = 0;
    raf = requestAnimationFrame(frame);
  }

  function scheduleResize() {
    if (resizeRaf) return;
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0;
      resize();
      if (reduced) drawFrame(performance.now());
    });
  }

  window.addEventListener('resize', scheduleResize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    if (document.hidden) cancelAnimationFrame(raf);
    else start();
  });

  resize();
  if (reduced) drawFrame(performance.now());
  else start();
})();
