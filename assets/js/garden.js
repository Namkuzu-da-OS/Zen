/* =============================================================
   ZEN · the garden
   A karesansui you can actually rake. Stones cast ripples; drag
   the sand and it holds the line. Nothing is scored, nothing is
   saved, nothing congratulates you.
   ============================================================= */

export function createGarden(canvas, { onRake, onStone } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  /* --- palettes: the two atmospheres --- */
  const PALETTE = {
    day: {
      sand:  ['#cfc7b6', '#b9b0a0'],
      groove:'rgba(92, 84, 70, .30)',
      crest: 'rgba(255, 252, 244, .42)',
      stone: ['#8d8a83', '#4b4a46', '#2c2b28'],
      moss:  'rgba(109, 138, 113, .55)',
      shade: 'rgba(60, 55, 46, .30)'
    },
    night: {
      // moonlit sand, not a grey void: it has to read as a material
      sand:  ['#5e6156', '#3b3e39'],
      groove:'rgba(14, 16, 14, .55)',
      crest: 'rgba(214, 214, 198, .30)',
      stone: ['#3f443f', '#232724', '#111412'],
      moss:  'rgba(86, 110, 88, .34)',
      shade: 'rgba(3, 6, 8, .6)'
    }
  };

  let mode = 'night';
  let pal = PALETTE[mode];

  /* --- state --- */
  let stones = [];
  let strokes = [];          // {pts:[{x,y}], w}
  let current = null;
  let dragging = null;       // a stone being moved
  let grain = null;          // pre-rendered sand texture
  let sandLayer = null;      // sand + grooves, redrawn only on change
  let sandDirty = true;
  let raf = 0;
  let lastRakeSound = 0;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- setup --- */

  function layoutStones() {
    // asymmetric, odd-numbered, never in a row — the old rules
    const spots = [
      [0.24, 0.62, 1.00],
      [0.31, 0.68, 0.52],
      [0.58, 0.44, 0.74],
      [0.74, 0.70, 1.18],
      [0.82, 0.62, 0.46]
    ];
    stones = spots.map(([fx, fy, s], i) => {
      const base = Math.min(W, H) * 0.075 * s;
      return {
        x: fx * W, y: fy * H,
        rx: base * (1.0 + (i % 2) * 0.22),
        ry: base * (0.68 + (i % 3) * 0.07),
        rot: (i * 1.31) % Math.PI,
        moss: (i * 7919 % 100) / 100
      };
    });
  }

  function makeGrain() {
    const g = document.createElement('canvas');
    const size = 220;
    g.width = g.height = size;
    const gc = g.getContext('2d');
    const img = gc.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 70;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 34;
    }
    gc.putImageData(img, 0, 0);
    grain = g;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    sandLayer = document.createElement('canvas');
    sandLayer.width = W * DPR;
    sandLayer.height = H * DPR;

    if (!stones.length) layoutStones();
    else {
      // keep stones proportionally placed across a resize
      layoutStones();
    }
    sandDirty = true;
  }

  /* --- drawing --- */

  function grooveLine(c, pts, width) {
    if (pts.length < 2) return;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    // the crest of displaced sand, offset up-left toward the light
    c.beginPath();
    c.moveTo(pts[0].x - 1.1, pts[0].y - 1.4);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x - 1.1, pts[i].y - 1.4);
    c.strokeStyle = pal.crest;
    c.lineWidth = width;
    c.stroke();

    // the trough
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.strokeStyle = pal.groove;
    c.lineWidth = width;
    c.stroke();
  }

  function ripples(c) {
    // concentric rings around each stone, the water that isn't there
    stones.forEach((s) => {
      const rings = 6;
      for (let i = 1; i <= rings; i++) {
        const pad = i * Math.min(W, H) * 0.022;
        const pts = [];
        const steps = 64;
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * Math.PI * 2;
          // a hand-raked ring is never a perfect ellipse
          const jitter = 1 + Math.sin(a * 3 + i) * 0.014;
          pts.push({
            x: s.x + Math.cos(a) * (s.rx + pad) * jitter,
            y: s.y + Math.sin(a) * (s.ry + pad) * jitter
          });
        }
        grooveLine(c, pts, 2.1);
      }
    });
  }

  function drawSand() {
    const c = sandLayer.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);

    const g = c.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, pal.sand[0]);
    g.addColorStop(1, pal.sand[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    if (grain) {
      const p = c.createPattern(grain, 'repeat');
      c.fillStyle = p;
      c.fillRect(0, 0, W, H);
    }

    ripples(c);
    strokes.forEach((s) => grooveLine(c, s.pts, s.w));
    sandDirty = false;
  }

  function drawStone(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);

    // what the stone sits in
    ctx.beginPath();
    ctx.ellipse(s.rx * 0.16, s.ry * 0.3, s.rx * 1.1, s.ry * 0.92, 0, 0, Math.PI * 2);
    ctx.fillStyle = pal.shade;
    ctx.filter = 'blur(7px)';
    ctx.fill();
    ctx.filter = 'none';

    // the stone
    // matte granite: a broad soft top-light, no specular hot spot
    const g = ctx.createLinearGradient(-s.rx * .5, -s.ry, s.rx * .4, s.ry);
    g.addColorStop(0, pal.stone[0]);
    g.addColorStop(0.42, pal.stone[1]);
    g.addColorStop(1, pal.stone[2]);

    ctx.beginPath();
    ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // moss on the shaded side, on some of them
    if (s.moss > 0.45) {
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.ellipse(s.rx * 0.12, s.ry * 0.74, s.rx * 0.8, s.ry * 0.42, 0.12, 0, Math.PI * 2);
      ctx.fillStyle = pal.moss;
      ctx.filter = 'blur(7px)';
      ctx.fill();
      ctx.restore();
      ctx.filter = 'none';
    }

    ctx.restore();
  }

  function frame() {
    raf = 0;
    if (sandDirty) drawSand();
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(sandLayer, 0, 0, W, H);
    stones.forEach(drawStone);
  }

  function invalidate() {
    if (!raf) raf = requestAnimationFrame(frame);
  }

  /* --- pointer --- */

  function at(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function stoneAt(p) {
    for (let i = stones.length - 1; i >= 0; i--) {
      const s = stones[i];
      const dx = (p.x - s.x) / (s.rx * 1.15);
      const dy = (p.y - s.y) / (s.ry * 1.15);
      if (dx * dx + dy * dy <= 1) return s;
    }
    return null;
  }

  function down(e) {
    canvas.setPointerCapture(e.pointerId);
    const p = at(e);
    const s = stoneAt(p);
    if (s) {
      dragging = { s, ox: p.x - s.x, oy: p.y - s.y };
      onStone && onStone();
    } else {
      current = { pts: [p], w: 5.5 };
      strokes.push(current);
      sandDirty = true;
      invalidate();
    }
  }

  function move(e) {
    if (dragging) {
      const p = at(e);
      dragging.s.x = p.x - dragging.ox;
      dragging.s.y = p.y - dragging.oy;
      sandDirty = true;       // the ripples follow the stone
      invalidate();
      return;
    }
    if (!current) return;
    const p = at(e);
    const last = current.pts[current.pts.length - 1];
    const d = Math.hypot(p.x - last.x, p.y - last.y);
    if (d < 3) return;
    current.pts.push(p);
    sandDirty = true;
    invalidate();

    const now = performance.now();
    if (now - lastRakeSound > 90) {
      lastRakeSound = now;
      onRake && onRake(Math.min(1, d / 26));
    }
  }

  function up(e) {
    if (canvas.hasPointerCapture?.(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    dragging = null;
    current = null;
  }

  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', up);

  /* --- api --- */

  const ro = new ResizeObserver(() => { resize(); invalidate(); });
  ro.observe(canvas);

  makeGrain();
  resize();
  invalidate();

  return {
    reset() {
      strokes = [];
      layoutStones();
      sandDirty = true;
      invalidate();
    },
    atmosphere(next) {
      mode = next === 'day' ? 'day' : 'night';
      pal = PALETTE[mode];
      sandDirty = true;
      invalidate();
      return mode;
    },
    get mode() { return mode; },
    destroy() { ro.disconnect(); cancelAnimationFrame(raf); }
  };
}
