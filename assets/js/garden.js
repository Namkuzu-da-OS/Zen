/* =============================================================
   ZEN · the garden
   A karesansui you can actually rake. Stones cast ripples; drag
   the sand and it holds the line. Nothing is scored, nothing is
   saved, nothing congratulates you.

   Three layers, so raking stays cheap:
     base  — sand colour, grain, mottling, light. Redrawn on
             resize or when the atmosphere changes.
     sand  — base + every groove. Redrawn on each rake move.
     frame — sand + stones, drawn to the visible canvas.
   ============================================================= */

export function createGarden(canvas, { onRake, onStone } = {}) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = 1;

  /* --- palettes: the two atmospheres --- */
  const PALETTE = {
    day: {
      sand:   ['#d6cebc', '#c3b9a6'],
      light:  'rgba(255, 250, 238, .16)',
      shade:  'rgba(64, 56, 44, .22)',
      groove: 'rgba(84, 74, 60, .24)',
      crest:  'rgba(255, 252, 244, .34)',
      stone:  ['#9a958c', '#5d5b55', '#312f2b'],
      rim:    'rgba(245, 240, 228, .22)',
      moss:   'rgba(109, 138, 113, .5)',
      cast:   'rgba(58, 52, 42, .34)',
      castLen: 1.05
    },
    night: {
      // moonlit sand, not a grey void: it has to read as a material
      sand:   ['#5f625a', '#3e413c'],
      light:  'rgba(214, 220, 214, .1)',
      shade:  'rgba(3, 6, 8, .4)',
      groove: 'rgba(10, 12, 10, .5)',
      crest:  'rgba(214, 214, 198, .2)',
      stone:  ['#4a4f4a', '#262a27', '#101412'],
      rim:    'rgba(200, 210, 204, .16)',
      moss:   'rgba(86, 110, 88, .34)',
      cast:   'rgba(2, 5, 7, .58)',
      castLen: 1.35
    }
  };

  // the garden opens at dawn; dusk is a choice the visitor makes
  let mode = 'day';
  let pal = PALETTE[mode];
  let blendRaf = 0;

  /* --- colours, so one atmosphere can become the other slowly --- */
  function parseColor(s) {
    if (s[0] === '#') {
      const n = parseInt(s.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 1];
    }
    const m = s.match(/[\d.]+/g).map(Number);
    return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1];
  }
  function mixColor(a, b, t) {
    const A = parseColor(a), B = parseColor(b);
    const c = A.map((v, i) => v + (B[i] - v) * t);
    return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${c[3].toFixed(3)})`;
  }
  function mixPalette(a, b, t) {
    const out = {};
    for (const k in a) {
      const v = a[k];
      out[k] = Array.isArray(v) ? v.map((c, i) => mixColor(c, b[k][i], t))
             : typeof v === 'number' ? v + (b[k] - v) * t
             : mixColor(v, b[k], t);
    }
    return out;
  }

  /* --- state --- */
  let stones = [];
  let strokes = [];          // {pts:[{x,y}], w}
  let current = null;
  let dragging = null;       // a stone being moved
  let grain = null;          // pre-rendered sand texture, fine
  let speckle = null;        // pre-rendered texture for the stones
  let baseLayer = null;      // sand + light, without grooves
  let sandLayer = null;      // base + grooves
  let sandDirty = true;
  let baseDirty = true;
  let raf = 0;
  let lastRakeSound = 0;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- a small seeded generator, so the garden is the same garden
         every time and every redraw --- */
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a += 0x6D2B79F5;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* --- setup --- */

  function layoutStones() {
    // asymmetric, odd-numbered, never in a row — the old rules
    const spots = [
      [0.24, 0.62, 1.00],
      [0.31, 0.69, 0.52],
      [0.58, 0.44, 0.74],
      [0.74, 0.70, 1.18],
      [0.83, 0.61, 0.46]
    ];
    stones = spots.map(([fx, fy, s], i) => {
      const r = rng(1013 + i * 7919);
      const base = Math.min(W, H) * 0.075 * s;
      // the outline: an ellipse worn by three low harmonics, so no
      // two stones share a silhouette and none is a perfect oval
      const harm = [
        [2, .05 + r() * .04, r() * Math.PI * 2],
        [3, .03 + r() * .04, r() * Math.PI * 2],
        [5, .012 + r() * .02, r() * Math.PI * 2]
      ];
      return {
        x: fx * W, y: fy * H,
        rx: base * (1.0 + (i % 2) * 0.22 + r() * .08),
        ry: base * (0.66 + (i % 3) * 0.07 + r() * .06),
        rot: (i * 1.31 + r() * .5) % Math.PI,
        harm,
        moss: (i * 7919 % 100) / 100,
        tone: r()                       // slight per-stone colour drift
      };
    });
  }

  function makeTextures() {
    // sand: fine, low-amplitude grain
    const g = document.createElement('canvas');
    const size = 256;
    g.width = g.height = size;
    const gc = g.getContext('2d');
    const img = gc.createImageData(size, size);
    const r = rng(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (r() - 0.5) * 54;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 26;
    }
    gc.putImageData(img, 0, 0);
    grain = g;

    // stone: sparser, harder speckle
    const s = document.createElement('canvas');
    s.width = s.height = 128;
    const sc = s.getContext('2d');
    const sim = sc.createImageData(128, 128);
    const r2 = rng(7);
    for (let i = 0; i < sim.data.length; i += 4) {
      const v = r2();
      const tone = v > .93 ? 210 : v < .06 ? 30 : 128;
      sim.data[i] = sim.data[i + 1] = sim.data[i + 2] = tone;
      sim.data[i + 3] = tone === 128 ? 0 : 38;
    }
    sc.putImageData(sim, 0, 0);
    speckle = s;
  }

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    baseLayer = document.createElement('canvas');
    baseLayer.width = W * DPR;
    baseLayer.height = H * DPR;
    sandLayer = document.createElement('canvas');
    sandLayer.width = W * DPR;
    sandLayer.height = H * DPR;

    layoutStones();            // keep stones proportionally placed
    baseDirty = true;
    sandDirty = true;
  }

  /* --- drawing --- */

  function drawBase() {
    const c = baseLayer.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);

    const g = c.createLinearGradient(0, 0, W * 0.4, H);
    g.addColorStop(0, pal.sand[0]);
    g.addColorStop(1, pal.sand[1]);
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);

    // mottling: the sand is not one colour. Soft patches, seeded.
    const r = rng(2024);
    const big = Math.max(W, H);
    for (let i = 0; i < 18; i++) {
      const x = r() * W, y = r() * H;
      const rad = big * (0.12 + r() * 0.22);
      const dark = r() > .5;
      const m = c.createRadialGradient(x, y, 0, x, y, rad);
      m.addColorStop(0, dark ? pal.shade.replace(/[\d.]+\)$/, '.09)') : pal.light.replace(/[\d.]+\)$/, '.12)'));
      m.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = m;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // the light comes from the upper left, low
    const l = c.createLinearGradient(0, 0, W, H);
    l.addColorStop(0, pal.light);
    l.addColorStop(.55, 'rgba(0,0,0,0)');
    l.addColorStop(1, pal.shade);
    c.fillStyle = l;
    c.fillRect(0, 0, W, H);

    // and falls off toward the edges under the eave
    const v = c.createRadialGradient(W * .5, H * .48, Math.min(W, H) * .3, W * .5, H * .5, big * .78);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, pal.shade);
    c.fillStyle = v;
    c.fillRect(0, 0, W, H);

    if (grain) {
      c.fillStyle = c.createPattern(grain, 'repeat');
      c.fillRect(0, 0, W, H);
    }
    baseDirty = false;
  }

  /* one groove: a lit crest offset toward the light, then the trough */
  function groove(c, pts, width, crestAlpha = 1, grooveAlpha = 1) {
    if (pts.length < 2) return;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    c.globalAlpha = crestAlpha;
    c.beginPath();
    c.moveTo(pts[0].x - 0.9, pts[0].y - 1.1);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x - 0.9, pts[i].y - 1.1);
    c.strokeStyle = pal.crest;
    c.lineWidth = width;
    c.stroke();

    c.globalAlpha = grooveAlpha;
    c.beginPath();
    c.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i].x, pts[i].y);
    c.strokeStyle = pal.groove;
    c.lineWidth = width;
    c.stroke();
    c.globalAlpha = 1;
  }

  /* a rake has tines. Three parallel grooves follow the hand. */
  function rakeStroke(c, pts, width) {
    if (pts.length < 2) return;
    const gap = width * 0.72;
    const tines = [-gap, 0, gap];
    for (const off of tines) {
      const line = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        // the normal, so the tines stay beside the path as it turns
        line.push({ x: pts[i].x - (dy / len) * off, y: pts[i].y + (dx / len) * off });
      }
      groove(c, line, width * 0.34, off === 0 ? 1 : .8, off === 0 ? 1 : .85);
    }
  }

  function ripples(c) {
    // concentric rings around each stone, the water that isn't there
    stones.forEach((s, si) => {
      const rings = 5;
      for (let i = 1; i <= rings; i++) {
        // the rings breathe apart a little further out
        const pad = i * Math.min(W, H) * 0.024 * (1 + i * 0.05);
        const pts = [];
        const steps = 72;
        for (let k = 0; k <= steps; k++) {
          const a = (k / steps) * Math.PI * 2;
          // a hand-raked ring is never a perfect ellipse
          const jitter = 1 + Math.sin(a * 3 + i + si) * 0.012 + Math.sin(a * 7 + si) * 0.004;
          pts.push({
            x: s.x + Math.cos(a) * (s.rx + pad) * jitter,
            y: s.y + Math.sin(a) * (s.ry + pad) * jitter
          });
        }
        const fade = 1 - (i - 1) / rings * 0.45;   // outer rings settle
        groove(c, pts, 1.7, fade, fade);
      }
    });
  }

  function drawSand() {
    if (baseDirty) drawBase();
    const c = sandLayer.getContext('2d');
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.clearRect(0, 0, W, H);
    c.drawImage(baseLayer, 0, 0, W, H);
    ripples(c);
    strokes.forEach((s) => rakeStroke(c, s.pts, s.w));
    sandDirty = false;
  }

  function stonePath(c, s, scale = 1) {
    const steps = 48;
    c.beginPath();
    for (let k = 0; k <= steps; k++) {
      const a = (k / steps) * Math.PI * 2;
      let rr = 1;
      for (const [n, amp, ph] of s.harm) rr += Math.sin(a * n + ph) * amp;
      const x = Math.cos(a) * s.rx * rr * scale;
      const y = Math.sin(a) * s.ry * rr * scale;
      if (k === 0) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.closePath();
  }

  function drawStone(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);

    // the shadow it throws, away from the light, longer by moonlight
    ctx.save();
    ctx.translate(s.rx * 0.22 * pal.castLen, s.ry * 0.34 * pal.castLen);
    stonePath(ctx, s, 1.04);
    ctx.fillStyle = pal.cast;
    ctx.filter = 'blur(9px)';
    ctx.fill();
    ctx.restore();
    ctx.filter = 'none';

    // the contact shadow where it sits in the sand
    ctx.save();
    ctx.translate(s.rx * 0.05, s.ry * 0.1);
    stonePath(ctx, s, 1.02);
    ctx.fillStyle = pal.cast;
    ctx.filter = 'blur(3px)';
    ctx.fill();
    ctx.restore();
    ctx.filter = 'none';

    // the stone: matte, a broad soft top-light, no specular hot spot
    const drift = (s.tone - .5) * 14;
    const g = ctx.createLinearGradient(-s.rx * .55, -s.ry, s.rx * .4, s.ry);
    g.addColorStop(0, shift(pal.stone[0], drift));
    g.addColorStop(0.44, shift(pal.stone[1], drift));
    g.addColorStop(1, shift(pal.stone[2], drift));

    stonePath(ctx, s);
    ctx.fillStyle = g;
    ctx.fill();

    // everything else stays inside the outline
    ctx.save();
    stonePath(ctx, s);
    ctx.clip();

    // the grain of the rock
    if (speckle) {
      ctx.globalAlpha = .55;
      ctx.fillStyle = ctx.createPattern(speckle, 'repeat');
      ctx.fillRect(-s.rx * 1.2, -s.ry * 1.2, s.rx * 2.4, s.ry * 2.4);
      ctx.globalAlpha = 1;
    }

    // the underside falls into its own shade
    const u = ctx.createRadialGradient(-s.rx * .25, -s.ry * .35, s.ry * .2, 0, 0, s.rx * 1.05);
    u.addColorStop(0, 'rgba(0,0,0,0)');
    u.addColorStop(.72, 'rgba(0,0,0,0)');
    u.addColorStop(1, 'rgba(0,0,0,.42)');
    ctx.fillStyle = u;
    ctx.fillRect(-s.rx * 1.2, -s.ry * 1.2, s.rx * 2.4, s.ry * 2.4);

    // a thin rim of light along the lit edge
    ctx.save();
    ctx.translate(s.rx * .06, s.ry * .1);
    stonePath(ctx, s, .97);
    ctx.strokeStyle = pal.rim;
    ctx.lineWidth = 1.4;
    ctx.filter = 'blur(1.2px)';
    ctx.stroke();
    ctx.restore();
    ctx.filter = 'none';

    // moss on the shaded side, on some of them
    if (s.moss > 0.45) {
      ctx.beginPath();
      ctx.ellipse(s.rx * 0.14, s.ry * 0.7, s.rx * 0.78, s.ry * 0.4, 0.12, 0, Math.PI * 2);
      ctx.fillStyle = pal.moss;
      ctx.filter = 'blur(7px)';
      ctx.fill();
      ctx.filter = 'none';
    }

    ctx.restore();
    ctx.restore();
  }

  /* nudge a colour by a few units — stones are not all one grey */
  function shift(col, d) {
    const [r0, g0, b0] = parseColor(col);
    const r = clamp(r0 + d), g = clamp(g0 + d * .9), b = clamp(b0 + d * .7);
    return `rgb(${r | 0},${g | 0},${b | 0})`;
  }
  const clamp = (v) => Math.max(0, Math.min(255, v));

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
      current = { pts: [p], w: 6 };
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

  makeTextures();
  resize();
  invalidate();

  return {
    reset() {
      strokes = [];
      layoutStones();
      sandDirty = true;
      invalidate();
    },
    /* day → night (or back) over `seconds`. The light leaves the sand
       the way it leaves a real garden: gradually, all of it at once.
       Reduced motion, or no duration, and it simply changes. */
    atmosphere(next, seconds = 0) {
      mode = next === 'day' ? 'day' : 'night';
      const from = pal;              // wherever the light is right now
      const to = PALETTE[mode];
      cancelAnimationFrame(blendRaf);
      blendRaf = 0;
      if (!seconds || reduced) {
        pal = to;
        baseDirty = true; sandDirty = true;
        invalidate();
        return mode;
      }
      const t0 = performance.now();
      let last = 0;
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / (seconds * 1000));
        const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        if (p === 1 || now - last > 50) {          // ~20 redraws a second is plenty
          last = now;
          pal = p === 1 ? to : mixPalette(from, to, e);
          baseDirty = true; sandDirty = true;
          invalidate();
        }
        blendRaf = p < 1 ? requestAnimationFrame(tick) : 0;
      };
      blendRaf = requestAnimationFrame(tick);
      return mode;
    },
    get mode() { return mode; },
    destroy() { ro.disconnect(); cancelAnimationFrame(raf); cancelAnimationFrame(blendRaf); }
  };
}
