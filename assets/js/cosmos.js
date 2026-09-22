/* =============================================================
   ZEN · the cosmos
   The night's visual for Episode 1, "Kill the Noise".

   This is not a music visualiser and not an ambient loop. The
   recording is a guided meditation, and around 2:27 RZA names the
   image directly: he is the sun at the centre of his solar system,
   and every distraction is just a planet, an asteroid or a comet
   spinning around him. He then asks the listener to see their own
   distractions that way, and closes by telling them they are the
   sun.

   So the scenes below are his instructions, on his timing. The
   boundaries come from a transcript of the audio (local Whisper)
   cross-checked against a novelty curve over the waveform — the
   two agreed, which is why they are trusted. The narration itself
   never appears on screen.

   Re-derive both with docs/track-phases.py if the audio changes.
   ============================================================= */

const ART = '/assets/images/cosmos/';

const SPRITES = {
  sun:      'sun.png',
  gasgiant: 'planet-gasgiant.png',
  ice:      'planet-ice.png',
  indigo:   'planet-indigo.png',
  moon:     'planet-moon.png',
  comet:    'comet.png',
  d1:       'debris-01.png',
  d2:       'debris-02.png',
  d3:       'debris-03.png'
};

/* --- the eleven scenes ---
   `at` is seconds into the recording. Every value is a target the
   look eases toward, so scenes arrive rather than cut.

   chaos  1 = scattered and inbound, 0 = settled into orbit
   breath 1 = the bloom follows his guided cadence, not the waveform
   dim    darkens everything (he asks you to close your eyes)         */
export const SCENES = [
  { at:   0,   name: 'arrive',  field:.22, pace:.34, sun:0,   orbit:0,   debris:0,   chaos:1, bloom:.55, breath:0, dim:0,   rings:false },
  { at:  26,   name: 'settle',  field:.14, pace:.18, sun:0,   orbit:0,   debris:0,   chaos:1, bloom:.4,  breath:0, dim:.35, rings:false },
  { at:  43,   name: 'breath',  field:.3,  pace:.22, sun:0,   orbit:0,   debris:0,   chaos:1, bloom:1.1, breath:1, dim:.3,  rings:false },
  { at:  81,   name: 'chaos',   field:.85, pace:1.5, sun:0,   orbit:0,   debris:1,   chaos:1, bloom:.5,  breath:0, dim:.1,  rings:false },
  { at: 133,   name: 'turn',    field:.7,  pace:1.1, sun:.12, orbit:.15, debris:1,   chaos:.72, bloom:.7, breath:0, dim:0,  rings:false },
  { at: 147,   name: 'ignite',  field:.5,  pace:.8,  sun:1,   orbit:.5,  debris:.9,  chaos:.3, bloom:1.3, breath:0, dim:0,  rings:true  },
  { at: 174,   name: 'orbit',   field:.42, pace:.62, sun:1,   orbit:1,   debris:.8,  chaos:0, bloom:1,   breath:0, dim:0,   rings:true  },
  { at: 205,   name: 'notice',  field:.3,  pace:.4,  sun:1,   orbit:1,   debris:.7,  chaos:0, bloom:.95, breath:0, dim:0,   rings:true  },
  { at: 259,   name: 'release', field:.24, pace:.34, sun:1,   orbit:.9,  debris:.35, chaos:0, bloom:1.05,breath:0, dim:0,   rings:true  },
  { at: 289,   name: 'return',  field:.2,  pace:.26, sun:1,   orbit:.8,  debris:.15, chaos:0, bloom:1.25,breath:1, dim:0,   rings:true  },
  { at: 327.5, name: 'resolve', field:.1,  pace:.16, sun:.55, orbit:.3,  debris:0,   chaos:0, bloom:.7,  breath:1, dim:.2,  rings:false }
];

/* The two long silences he leaves for practice. The visual holds
   still through these instead of continuing to perform. */
const HOLDS = [[211, 221], [231, 247]];

export function createCosmos(canvas, { audioEl, getContext }) {
  const c = canvas.getContext('2d', { alpha: true });

  /* Reduced motion does not switch this off — reaching it takes
     pressing Dusk and then pressing play, the same opt-in as
     starting a video. It runs calmer instead. */
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1, raf = 0, running = false, last = 0;

  /* --- art --- */
  /* WebP first — the set is 430 KB as WebP against 2.2 MB as PNG, and
     it only downloads if the visitor actually enters the night. PNG is
     the fallback, and if both fail `sprite()` draws a plain body rather
     than a hole. */
  const art = {};
  let artLoaded = 0;
  for (const [key, file] of Object.entries(SPRITES)) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { art[key] = im; artLoaded++; };
    im.onerror = () => {
      if (im.dataset.fellBack) { art[key] = null; return; }
      im.dataset.fellBack = '1';
      im.src = ART + file;                     // the .png
    };
    im.src = ART + file.replace(/\.png$/, '.webp');
  }

  /* --- analysis: the voice, not a beat --- */
  let analyser = null, freq = null, wired = false;
  let voice = 0;                    // how much he is speaking right now
  let lowEnergy = 0;

  function wireAnalyser() {
    if (wired) return;
    wired = true;
    const ac = getContext && getContext();
    if (!ac) return;
    try {
      // Routing the element through Web Audio means we own its output:
      // the analyser MUST reach the destination or the track goes
      // silent. The element's own .volume still applies upstream.
      const src = ac.createMediaElementSource(audioEl);
      analyser = ac.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.82;
      src.connect(analyser);
      analyser.connect(ac.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
    } catch { analyser = null; }
  }

  /* --- the look, eased --- */
  const KEYS = ['field','pace','sun','orbit','debris','chaos','bloom','breath','dim'];
  const look = {};
  let sceneIdx = -1;
  let target = SCENES[0];
  KEYS.forEach(k => look[k] = SCENES[0][k]);
  let ringsOn = false;

  /* --- bodies --- */
  /* Every r here has to keep its body outside the sun's disc. The sun
     draws unit*SUN_SIZE wide, so its radius is unit*SUN_SIZE/2, while
     an orbit radius is unit*0.5*r — the innermost r must therefore
     exceed SUN_SIZE. The first pass had the moon at r .24 (152px)
     orbiting inside a 190px sun. */
  const SUN_SIZE = .17;
  const BODIES = [
    { key:'moon',     r:.31, speed:-.26, size:.040, tilt:.66, phase:5.3 },
    { key:'gasgiant', r:.45, speed: .16, size:.110, tilt:.58, phase:0.4 },
    { key:'ice',      r:.61, speed:-.11, size:.072, tilt:.52, phase:2.1 },
    { key:'indigo',   r:.77, speed: .075,size:.090, tilt:.46, phase:4.0 },
    { key:'comet',    r:.92, speed: .05, size:.062, tilt:.40, phase:1.2 }
  ];

  /* Debris carries two lives: a scattered inbound one and an orbital
     one. `chaos` morphs between them, so the whole system resolves
     from disorder into orbit on a single scalar. */
  const DEBRIS_N = calm ? 9 : 18;
  let debris = [];
  let motes = [];
  let rings = [];
  let orbitT = 0, breathT = 0, swirl = 0;

  function seedDebris() {
    debris = new Array(DEBRIS_N).fill(0).map((_, i) => {
      const a = Math.random() * Math.PI * 2;
      const far = 0.62 + Math.random() * 0.5;
      return {
        key: ['d1','d2','d3'][i % 3],
        // the scattered life: drifting in from outside the frame
        ax: Math.cos(a) * far, ay: Math.sin(a) * far,
        vx: -Math.cos(a) * (0.02 + Math.random() * 0.05),
        vy: -Math.sin(a) * (0.02 + Math.random() * 0.05),
        spin: (Math.random() - 0.5) * 1.4,
        rot: Math.random() * Math.PI,
        // the orbital life it is captured into
        r: 0.34 + Math.random() * 0.6,
        speed: (Math.random() < 0.5 ? -1 : 1) * (0.05 + Math.random() * 0.2),
        tilt: 0.4 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2,
        size: 0.014 + Math.random() * 0.026,
        lit: 0                        // brightens when "noticed"
      };
    });
  }

  function seedMotes() {
    motes = new Array(calm ? 70 : 200).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      z: .35 + Math.random() * .9, warm: Math.random() > .84,
      live: Math.random()
    }));
  }

  /* The field's wake needs a canvas that is never cleared. Everything
     else — bloom, sun, bodies, debris — must be drawn fresh each frame
     or it accumulates: additive fills against a 5% decay saturate
     within a second, which is what exposed a hard fillRect edge and
     the gradient's dither grid around the sun. So the trails get their
     own layer and the visible canvas is rebuilt every frame. */
  let trail = null, tc = null;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    if (w === W && h === H) return;
    W = w; H = h;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    trail = document.createElement('canvas');
    trail.width = canvas.width;
    trail.height = canvas.height;
    tc = trail.getContext('2d');
    tc.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedMotes();
    if (!debris.length) seedDebris();
  }

  /* --- the clock --- */

  function sceneAt(t) {
    let i = 0;
    for (let k = 0; k < SCENES.length; k++) { if (t >= SCENES[k].at) i = k; else break; }
    return i;
  }

  function holding(t) {
    return HOLDS.some(([a, b]) => t >= a && t <= b);
  }

  function read(dt) {
    if (!analyser) { voice += (0.45 - voice) * Math.min(1, dt * 2); return; }
    analyser.getByteFrequencyData(freq);
    // speech sits in the mids; this tracks "is he talking", not a beat
    let mid = 0;
    for (let i = 6; i < 70; i++) mid += freq[i];
    mid /= 64 * 255;
    let low = 0;
    for (let i = 1; i < 6; i++) low += freq[i];
    low /= 5 * 255;
    voice += (mid - voice) * Math.min(1, dt * 6);
    lowEnergy += (low - lowEnergy) * Math.min(1, dt * 4);
  }

  function ease(dt) {
    const k = Math.min(1, dt * 0.5);
    for (const key of KEYS) look[key] += (target[key] - look[key]) * k;
  }

  /* --- drawing helpers --- */

  function sprite(key, x, y, size, alpha, rot = 0) {
    const im = art[key];
    c.globalAlpha = alpha;
    if (im) {
      c.save();
      c.translate(x, y);
      if (rot) c.rotate(rot);
      c.drawImage(im, -size / 2, -size / 2, size, size);
      c.restore();
    } else {
      // the art has not arrived (or failed): a body, not a blank
      const g = c.createRadialGradient(x - size * .15, y - size * .15, size * .05, x, y, size * .5);
      g.addColorStop(0, 'rgba(226,233,236,.95)');
      g.addColorStop(1, 'rgba(120,138,150,.25)');
      c.fillStyle = g;
      c.beginPath(); c.arc(x, y, size * .5, 0, Math.PI * 2); c.fill();
    }
    c.globalAlpha = 1;
  }

  function frame(ts) {
    raf = 0;
    if (!running) return;
    const dt = Math.min(.05, last ? (ts - last) / 1000 : .016);
    last = ts;

    const t = audioEl.currentTime || 0;
    const idx = sceneAt(t);
    if (idx !== sceneIdx) {
      sceneIdx = idx;
      target = SCENES[idx];
      ringsOn = target.rings;
    }

    read(dt);
    ease(dt);

    // through his practice silences the system slows almost to a stop
    const hold = holding(t) ? 0.18 : 1;
    const pace0 = (calm ? .5 : 1) * hold;

    orbitT  += dt * look.pace * pace0;
    swirl   += dt * .05 * look.pace * pace0;
    breathT += dt;

    // the guided breath: in about 4s, out about 6s
    const cyc = (breathT % 10) / 10;
    const breath = cyc < .4
      ? .5 - .5 * Math.cos(Math.PI * (cyc / .4))
      : .5 + .5 * Math.cos(Math.PI * ((cyc - .4) / .6));

    const cx = W * .5, cy = H * .5;
    const unit = Math.min(W, H);

    /* --- the trail layer: smear, then this frame's mote segments --- */
    tc.globalCompositeOperation = 'destination-out';
    tc.fillStyle = `rgba(0,0,0,${.05 + .04 * voice})`;
    tc.fillRect(0, 0, W, H);
    tc.globalCompositeOperation = 'lighter';

    /* --- the visible canvas, rebuilt from scratch every frame --- */
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, W, H);
    c.drawImage(trail, 0, 0, W, H);
    c.globalCompositeOperation = 'lighter';

    /* 1. the bloom — his breath when he is guiding it, else his voice */
    const drive = look.breath > .5 ? breath : voice;
    const br = unit * (.16 + drive * .26) * look.bloom;
    if (br > 2) {
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, br);
      g.addColorStop(0,   `rgba(214,226,232,${(.028 + drive * .05) * (1 - look.dim * .6)})`);
      g.addColorStop(.55, `rgba(150,178,224,${(.014 + drive * .022) * (1 - look.dim * .6)})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, br, 0, Math.PI * 2); c.fill();
    }

    /* 2. the field, onto the trail layer */
    const pace = (10 + voice * 52) * look.pace * pace0;
    tc.lineCap = 'round';
    for (const m of motes) {
      if (m.live > look.field) continue;
      const a = (Math.sin(m.x * .0016 + orbitT * .19)
               + Math.cos(m.y * .0021 - orbitT * .14)) * 1.4 + swirl;
      const nx = m.x + Math.cos(a) * pace * m.z * dt;
      const ny = m.y + Math.sin(a) * pace * m.z * .72 * dt;
      const al = (.04 + voice * .14) * (.4 + m.z * .6) * (1 - look.dim);
      tc.strokeStyle = m.warm ? `rgba(227,205,155,${al})` : `rgba(186,216,232,${al})`;
      tc.lineWidth = .6 + m.z;
      tc.beginPath(); tc.moveTo(m.x, m.y); tc.lineTo(nx, ny); tc.stroke();
      m.x = nx; m.y = ny;
      if (m.x < -20) { m.x = W + 20; m.y = Math.random() * H; }
      else if (m.x > W + 20) { m.x = -20; m.y = Math.random() * H; }
      if (m.y < -20) { m.y = H + 20; m.x = Math.random() * W; }
      else if (m.y > H + 20) { m.y = -20; m.x = Math.random() * W; }
    }

    /* 3. the orbit paths */
    if (ringsOn && look.orbit > .04) {
      c.strokeStyle = `rgba(214,231,236,${.022 * look.orbit})`;
      c.lineWidth = 1;
      for (const b of BODIES) {
        const rad = unit * .5 * b.r;
        c.beginPath();
        c.ellipse(cx, cy, rad, rad * b.tilt, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    /* 4. the sun — normal blending, it is a body not a glow */
    if (look.sun > .02) {
      c.globalCompositeOperation = 'source-over';
      const pulse = 1 + (look.breath > .5 ? breath * .06 : voice * .05);
      const size = unit * SUN_SIZE * pulse * (.5 + look.sun * .5);
      sprite('sun', cx, cy, size, Math.min(1, look.sun) * (1 - look.dim * .5));
      c.globalCompositeOperation = 'lighter';
      // the corona it throws onto everything else
      const gr = size * 1.5;
      const g = c.createRadialGradient(cx, cy, size * .42, cx, cy, gr);
      g.addColorStop(0, `rgba(240,214,158,${.12 * look.sun})`);
      g.addColorStop(.6, `rgba(228,200,150,${.04 * look.sun})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, gr, 0, Math.PI * 2); c.fill();
    }

    /* 5. debris — scattered, then captured */
    c.globalCompositeOperation = 'source-over';
    if (look.debris > .02) {
      for (const d of debris) {
        // the scattered life drifts inward and re-enters from outside
        d.ax += d.vx * dt * pace0; d.ay += d.vy * dt * pace0;
        d.rot += d.spin * dt * pace0;
        if (Math.hypot(d.ax, d.ay) < .12) {
          const a = Math.random() * Math.PI * 2;
          d.ax = Math.cos(a) * 1.05; d.ay = Math.sin(a) * 1.05;
          d.vx = -Math.cos(a) * (.02 + Math.random() * .05);
          d.vy = -Math.sin(a) * (.02 + Math.random() * .05);
        }
        // the orbital life
        const oa = orbitT * d.speed * 2 + d.phase;
        const orad = unit * .5 * d.r;
        const ox = cx + Math.cos(oa) * orad;
        const oy = cy + Math.sin(oa) * orad * d.tilt;
        // and the blend between them
        const k = look.chaos;
        const x = (cx + d.ax * unit * .5) * k + ox * (1 - k);
        const y = (cy + d.ay * unit * .5) * k + oy * (1 - k);

        // in the naming section each one brightens briefly, in turn
        if (target.name === 'notice' || target.name === 'release') {
          d.lit = Math.max(0, d.lit - dt * .5);
          if (Math.random() < dt * .12) d.lit = 1;
        } else d.lit = Math.max(0, d.lit - dt);

        sprite(d.key, x, y, unit * d.size, look.debris * (.5 + d.lit * .5), d.rot);
        if (d.lit > .01) {
          c.globalCompositeOperation = 'lighter';
          const s = unit * d.size * 1.8;
          const g = c.createRadialGradient(x, y, 0, x, y, s);
          g.addColorStop(0, `rgba(227,205,155,${.2 * d.lit})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.fillRect(x - s, y - s, s * 2, s * 2);
          c.globalCompositeOperation = 'source-over';
        }
      }
    }

    /* 6. the bodies */
    if (look.orbit > .02) {
      for (const b of BODIES) {
        const a = orbitT * b.speed * 2 + b.phase;
        const rad = unit * .5 * b.r * (.86 + look.orbit * .14);
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad * b.tilt;
        sprite(b.key, x, y, unit * b.size * (.7 + look.orbit * .3), Math.min(1, look.orbit));
      }
    }

    /* 7. rings from the low end, the raked-sand shape again */
    c.globalCompositeOperation = 'lighter';
    // the expanding rings belong to the phases before the sun exists;
    // once there are orbits to look at they only compete with them
    if (ringsOn && !calm && look.orbit < .4
        && lowEnergy > .28 && Math.random() < dt * 2.2) {
      rings.push({ r: unit * .12, life: 1 });
    }
    const maxR = Math.hypot(W, H) * .55;
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.r += dt * maxR * .16 * pace0;
      r.life -= dt * .38;
      if (r.life <= 0 || r.r > maxR) { rings.splice(i, 1); continue; }
      c.strokeStyle = `rgba(214,231,236,${r.life * .07})`;
      c.lineWidth = 1 + r.life;
      c.beginPath(); c.ellipse(cx, cy, r.r, r.r * .84, 0, 0, Math.PI * 2); c.stroke();
    }

    /* 8. he asks you to close your eyes */
    if (look.dim > .01) {
      c.globalCompositeOperation = 'source-over';
      c.fillStyle = `rgba(3,6,9,${look.dim * .55})`;
      c.fillRect(0, 0, W, H);
    }

    c.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  /* --- api --- */
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    start() {
      if (running) return;
      resize();
      wireAnalyser();
      running = true; last = 0;
      canvas.classList.add('is-live');
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop({ clear = false } = {}) {
      running = false;
      cancelAnimationFrame(raf); raf = 0;
      if (clear) {
        canvas.classList.remove('is-live');
        c.setTransform(DPR, 0, 0, DPR, 0, 0);
        c.clearRect(0, 0, W, H);
        rings = []; sceneIdx = -1; breathT = 0;
        target = SCENES[0];
        KEYS.forEach(k => look[k] = SCENES[0][k]);
        seedDebris();
      }
    },
    get scene() { return SCENES[sceneIdx] ? SCENES[sceneIdx].name : null; },
    get artReady() { return artLoaded; },
    get running() { return running; },
    destroy() { this.stop({ clear: true }); ro.disconnect(); }
  };
}
