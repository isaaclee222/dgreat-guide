/**
 * wave-animation.js
 * Drop into any existing page. Call:
 *
 *   mountWaveAnimation('#your-container-id');
 *
 * The canvas + controls inject themselves inside that element.
 * CSS variables used: --wave-bg (canvas bg), --wave-color (wave stroke), --node-color (node ring)
 * Falls back to dark defaults if variables are not defined.
 */

(function () {
  'use strict';

  /* ── Public mount function ──────────────────────────────────── */
  window.mountWaveAnimation = function (selectorOrElement, options) {
    const container = typeof selectorOrElement === 'string'
      ? document.querySelector(selectorOrElement)
      : selectorOrElement;

    if (!container) {
      console.error('[wave-animation] Container not found:', selectorOrElement);
      return;
    }

    const opts = Object.assign({
      width:       680,
      rowHeight:   115,
      rows:        4,
      baseAmplitude: 30,
      waveLength:  72,
      initialSpeed: 3,
      showControls: true,
      showLegend:   true,
      /* Override amplitude pairs per row: [leftMultiplier, rightMultiplier] */
      rowAmplitudes: [
        [1.00, 1.00],
        [1.00, 1.00],
        [2.30, 0.28],
        [0.28, 2.30],
      ],
      rowPhases: [0, Math.PI * 0.55, 0, 0],
    }, options);

    /* ── Build DOM ──────────────────────────────────────────── */
    container.innerHTML = '';
    container.style.fontFamily = 'monospace';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      width: 100%;
      max-width: ${opts.width}px;
      border: 1px solid rgba(100,140,200,0.18);
      border-radius: 14px;
      overflow: hidden;
      background: var(--wave-bg, #060a10);
    `;

    const cv = document.createElement('canvas');
    cv.style.cssText = 'width:100%;display:block;';
    wrapper.appendChild(cv);

    if (opts.showControls) {
      const bar = document.createElement('div');
      bar.style.cssText = `
        display:flex; align-items:center; gap:14px; padding:10px 16px;
        border-top:1px solid rgba(100,140,200,0.10); flex-wrap:wrap;
      `;
      bar.innerHTML = `
        <button id="wavePlayBtn" style="
          background:transparent; border:1px solid rgba(58,214,232,0.35);
          color:rgba(58,214,232,0.85); border-radius:6px; padding:5px 14px;
          cursor:pointer; font-family:monospace; font-size:12px;">⏸ Pause</button>
        <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:140px;">
          <label for="waveSpdRange" style="font-size:11px;color:rgba(160,190,220,0.55);">Speed</label>
          <input type="range" id="waveSpdRange" min="1" max="10" value="${opts.initialSpeed}" step="1"
            style="flex:1;accent-color:#3ad6e8;cursor:pointer;"
            oninput="document.getElementById('waveSpdVal').textContent=this.value">
          <span id="waveSpdVal" style="font-size:12px;font-weight:600;color:#3ad6e8;min-width:14px;">
            ${opts.initialSpeed}
          </span>
        </div>
      `;
      wrapper.appendChild(bar);
    }

    if (opts.showLegend) {
      const leg = document.createElement('div');
      leg.style.cssText = `
        display:grid; grid-template-columns:1fr 1fr; gap:6px;
        padding:10px 16px 14px;
        border-top:1px solid rgba(100,140,200,0.10);
      `;
      const items = [
        ['Rows 1 & 2 — symmetric',    'Left A = Right A',               'Same amplitude, rows phase-offset'],
        ['Row 3 — left large, right small', 'Left amplified → node ← right attenuated', 'Both waves converge on boundary'],
        ['Row 4 — left small, right large', 'Left attenuated → node ← right amplified', 'Both waves converge on boundary'],
        ['Pink node ●',               'Boundary particle',              'Old wave ends, new wave begins here'],
      ];
      items.forEach(([title, desc, sub]) => {
        const item = document.createElement('div');
        item.style.cssText = `
          background:rgba(255,255,255,0.03); border:1px solid rgba(100,140,200,0.12);
          border-radius:8px; padding:8px 12px;
        `;
        item.innerHTML = `
          <div style="font-size:10px;color:rgba(160,190,220,0.45);margin-bottom:3px;">${title}</div>
          <div style="font-size:11px;color:rgba(58,214,232,0.80);">${desc}</div>
          <div style="font-size:10px;color:rgba(140,180,220,0.40);margin-top:2px;">${sub}</div>
        `;
        leg.appendChild(item);
      });
      wrapper.appendChild(leg);
    }

    container.appendChild(wrapper);

    /* ── Canvas init ────────────────────────────────────────── */
    const ctx  = cv.getContext('2d');
    const DPR  = Math.min(window.devicePixelRatio || 1, 2);
    const W    = opts.width;
    const ROW_H = opts.rowHeight;
    const ROWS  = opts.rows;
    const H     = ROW_H * ROWS;

    cv.width  = W * DPR;
    cv.height = H * DPR;
    cv.style.height = H + 'px';
    ctx.scale(DPR, DPR);

    const BASE_A = opts.baseAmplitude;
    const k      = (2 * Math.PI) / opts.waveLength;
    const CX     = W / 2;
    const PAD    = 14;

    let animT   = 0;
    let playing = true;
    let raf;

    /* ── Controls wiring ────────────────────────────────────── */
    const playBtn  = document.getElementById('wavePlayBtn');
    const spdRange = document.getElementById('waveSpdRange');

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        playing = !playing;
        playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
        if (playing) loop();
        else cancelAnimationFrame(raf);
      });
    }

    /* ── Draw ───────────────────────────────────────────────── */
    function drawRow(i) {
      const [leftMul, rightMul] = opts.rowAmplitudes[i];
      const rowPhase = opts.rowPhases[i];
      const labels   = [
        'ψ_L = ψ_R  (φ=0)',
        'ψ_L = ψ_R  (phase offset)',
        'ψ_L ≫ ψ_R  (left amplified)',
        'ψ_L ≪ ψ_R  (right amplified)',
      ];

      const yc   = i * ROW_H + ROW_H / 2;
      const LA   = leftMul  * BASE_A;
      const RA   = rightMul * BASE_A;
      const maxA = Math.max(LA, RA);

      ctx.save();

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(120,180,220,0.10)';
      ctx.lineWidth   = 0.5;
      ctx.moveTo(PAD, yc);
      ctx.lineTo(W - PAD, yc);
      ctx.stroke();

      /* left wave travels right */
      ctx.shadowColor = 'var(--wave-color, #3ad6e8)';
      ctx.shadowBlur  = 4;
      ctx.beginPath();
      ctx.strokeStyle = 'var(--wave-color, rgba(58,214,232,0.88))';
      ctx.lineWidth   = 2;
      let first = true;
      for (let x = PAD; x <= CX; x++) {
        const y = yc + LA * Math.sin(k * x - animT + rowPhase);
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.stroke();

      /* right wave travels left */
      first = true;
      ctx.beginPath();
      for (let x = CX; x <= W - PAD; x++) {
        const y = yc + RA * Math.sin(k * x + animT + rowPhase);
        first ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        first = false;
      }
      ctx.stroke();

      ctx.shadowBlur = 0;

      /* node */
      const mismatch = Math.abs(LA - RA) / (BASE_A * 2.3);
      ctx.shadowColor = 'var(--node-color, rgba(210,160,255,0.9))';
      ctx.shadowBlur  = 6 + mismatch * 12;
      ctx.beginPath();
      ctx.arc(CX, yc, 8, 0, Math.PI * 2);
      ctx.fillStyle = 'var(--wave-bg, #12002a)';
      ctx.fill();
      ctx.strokeStyle = 'var(--node-color, rgba(200,150,255,0.95))';
      ctx.lineWidth   = 1.8;
      ctx.stroke();
      ctx.shadowBlur  = 0;
      ctx.beginPath();
      ctx.arc(CX, yc, 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(235,205,255,1)';
      ctx.fill();

      /* label */
      ctx.font      = '500 10px monospace';
      ctx.fillStyle = 'rgba(58,214,232,0.45)';
      ctx.fillText(labels[i], PAD + 4, yc - maxA - 10);

      ctx.font      = '10px monospace';
      ctx.fillStyle = 'rgba(140,200,230,0.35)';
      ctx.fillText('A=' + leftMul.toFixed(2),  CX - 62, yc + maxA + 16);
      ctx.fillText('A=' + rightMul.toFixed(2), CX + 10, yc + maxA + 16);

      ctx.restore();
    }

    function draw() {
      ctx.fillStyle = 'var(--wave-bg, #060a10)';
      ctx.fillRect(0, 0, W, H);

      for (let i = 1; i < ROWS; i++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(70,110,180,0.07)';
        ctx.lineWidth   = 0.5;
        ctx.moveTo(0, i * ROW_H);
        ctx.lineTo(W, i * ROW_H);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.strokeStyle = 'rgba(120,80,200,0.08)';
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([3, 5]);
      ctx.moveTo(CX, 0);
      ctx.lineTo(CX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      for (let i = 0; i < ROWS; i++) drawRow(i);
    }

    function loop() {
      const spd = spdRange
        ? parseFloat(spdRange.value) * 0.006
        : opts.initialSpeed * 0.006;
      animT += spd;
      draw();
      if (playing) raf = requestAnimationFrame(loop);
    }

    loop();

    /* Return handle so caller can destroy or pause externally */
    return {
      pause:   () => { playing = false; cancelAnimationFrame(raf); },
      resume:  () => { playing = true;  loop(); },
      destroy: () => { cancelAnimationFrame(raf); container.innerHTML = ''; },
    };
  };

})();
