/* =============================================================
   ZEN · the cosmos
   The night's visual for Episode 1, "Kill the Noise".

   Not a music visualiser and not an ambient loop. The recording is a
   guided meditation, and around 2:27 the narration names the image
   outright: the speaker is the sun at the centre of his solar system,
   and every distraction is just a planet, an asteroid or a comet
   spinning around him. He then asks the listener to see their own
   distractions that way, and closes by telling them they are the sun.

   So the scenes are his instructions, on his timing. The narration
   itself never appears on screen.

   Nothing here is driven by audio amplitude. An earlier pass pulsed
   the bloom with his voice, which is a visualiser by definition — it
   made the picture twitch on his consonants. The light now follows the
   scene and his guided breath; his voice only nudges the pace, and
   barely. Re-derive the timings with docs/track-phases.py.
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

/* --- the scenes ---
   `at` is seconds into the recording. Every number is a target the look
   eases toward, so a scene arrives rather than cuts.

   Each boundary sits on something he actually says, located by
   transcribing the audio and cross-checking against a novelty curve
   over the waveform. Fifteen of sixteen land within a second.

   chaos  1 = scattered and inbound, 0 = settled into orbit
   crowd  1 = the debris ring you instead of drifting through
   spread multiplies every orbit radius
   depart the one planet that leaves for good
   pulse  one slow swell of the sun
   breath 1 = the light follows his guided cadence
   dim    an eyelid vignette, not a flat fill                         */
export const SCENES = [
  // arrival, and naming the adversary
  { at:   0,   name:'arrive',   field:.20, pace:.34, sun:0,   orbit:0,   debris:0,   chaos:1,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:.55, breath:0, dim:0,   cast:0 },
  // find a chill spot, sit down, plant your feet
  { at:  26,   name:'settle',   field:.12, pace:.18, sun:0,   orbit:0,   debris:0,   chaos:1,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:.40, breath:0, dim:0,   cast:0 },
  // "now close your eyes"
  { at:  40.7, name:'eyes',     field:.08, pace:.12, sun:0,   orbit:0,   debris:0,   chaos:1,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:.32, breath:0, dim:.62, cast:0 },
  // the breathing, on his cadence
  { at:  43.2, name:'breath',   field:.26, pace:.20, sun:0,   orbit:0,   debris:0,   chaos:1,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:1.1, breath:1, dim:.52, cast:0 },
  // the catalogue of distractions begins
  { at:  81,   name:'chaos',    field:.14, pace:1.3, sun:0,   orbit:0,   debris:1,   chaos:1,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:.50, breath:0, dim:.18, cast:1 },
  // "it feels like we're completely surrounded"
  { at: 126.8, name:'surround', field:.14, pace:1.5, sun:0,   orbit:0,   debris:1,   chaos:1,   crowd:1,  spread:1,    depart:0,  pulse:0, bloom:.42, breath:0, dim:.22, cast:1 },
  // you cannot escape it; he will show you how to embrace it
  { at: 133.5, name:'turn',     field:.18, pace:1.0, sun:.10, orbit:.14, debris:1,   chaos:.7,  crowd:.5, spread:1,    depart:0,  pulse:0, bloom:.70, breath:0, dim:.08, cast:1 },
  // he names the sun at the centre of his solar system
  { at: 147.4, name:'ignite',   field:.22, pace:.80, sun:1,   orbit:.55, debris:.95, chaos:.15, crowd:0,  spread:1,    depart:0,  pulse:1, bloom:1.2, breath:0, dim:0,   cast:1 },
  // observe what crashes into your orbit
  { at: 174.4, name:'orbit',    field:.24, pace:.60, sun:1,   orbit:1,   debris:.9,  chaos:0,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:1,   breath:0, dim:0,   cast:1 },
  // "remember, you are the sun"
  { at: 189,   name:'assert',   field:.22, pace:.48, sun:1,   orbit:1,   debris:.9,  chaos:0,   crowd:0,  spread:1,    depart:0,  pulse:1, bloom:1.3, breath:0, dim:0,   cast:1 },
  // the practice: notice one thing at a time, then let it go
  { at: 205.6, name:'notice',   field:.20, pace:.38, sun:1,   orbit:1,   debris:.85, chaos:0,   crowd:0,  spread:1,    depart:0,  pulse:0, bloom:.95, breath:0, dim:0,   cast:1 },
  // note it, then watch it drift away — the ice world starts to leave
  { at: 259.8, name:'release',  field:.18, pace:.32, sun:1,   orbit:.95, debris:.5,  chaos:0,   crowd:0,  spread:1.06, depart:.35,pulse:0, bloom:1.05,breath:0, dim:0,   cast:1 },
  // the asteroid that fizzles out, the planet that floats off
  { at: 272.1, name:'letgo',    field:.16, pace:.28, sun:1,   orbit:.9,  debris:.2,  chaos:0,   crowd:0,  spread:1.2,  depart:1,  pulse:0, bloom:1.1, breath:0, dim:0,   cast:1 },
  // now we slowly return
  { at: 289.6, name:'return',   field:.14, pace:.22, sun:1,   orbit:.8,  debris:.08, chaos:0,   crowd:0,  spread:1.25, depart:1,  pulse:0, bloom:1.2, breath:1, dim:0,   cast:1 },
  // "open your eyes" — the vignette lifts, centre-out
  { at: 299,   name:'open',     field:.18, pace:.28, sun:1,   orbit:.7,  debris:.04, chaos:0,   crowd:0,  spread:1.3,  depart:1,  pulse:1, bloom:1.35,breath:1, dim:0,   cast:1 },
  /* He stops speaking at 5:12; the last 23s is instrumental. The close
     is the ember alone — an earlier pass shrank and dimmed the sun
     here, which is the exact opposite of "you are the sun". */
  { at: 312,   name:'rest',     field:.06, pace:.14, sun:1,   orbit:0,   debris:0,   chaos:0,   crowd:0,  spread:1.4,  depart:1,  pulse:0, bloom:.55, breath:1, dim:0,   cast:0 }
];

/* Where he stops and leaves the listener to practise, plus the
   instrumental outro. Measured from energy in the speech band
   (300–3400 Hz) only: the music bed continues underneath, so overall
   loudness never reads as quiet, and Whisper's segment end times are
   padded and reported no gaps at all. Through these the system crawls. */
const HOLDS = [[213, 222], [312, 336]];

export function createCosmos(canvas, { audioEl, getContext }) {
  const c = canvas.getContext('2d', { alpha: true });

  /* Reduced motion does not switch this off — reaching it takes
     pressing Dusk and then play, the same opt-in as starting a video.
     It runs calmer instead. */
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, DPR = 1, raf = 0, running = false, last = 0;

  /* --- art: WebP first (452 KB for the set against 2.2 MB of PNG),
     and only fetched if the visitor actually enters the night. If both
     formats fail, `sprite()` draws a plain body rather than a hole. */
  const art = {};
  for (const [key, file] of Object.entries(SPRITES)) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = () => { art[key] = im; };
    im.onerror = () => {
      if (im.dataset.fellBack) { art[key] = null; return; }
      im.dataset.fellBack = '1';
      im.src = ART + file;
    };
    im.src = ART + file.replace(/\.png$/, '.webp');
  }

  /* --- the voice, used only to nudge pace --- */
  let analyser = null, freq = null, wired = false;
  let voice = 0;

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
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.88;
      src.connect(analyser);
      analyser.connect(ac.destination);
      freq = new Uint8Array(analyser.frequencyBinCount);
    } catch { analyser = null; }
  }

  /* --- the look --- */
  const KEYS = ['field','pace','sun','orbit','debris','chaos','crowd',
                'spread','depart','pulse','bloom','breath','dim','cast'];
  const look = {};
  let sceneIdx = -1;
  let target = SCENES[0];
  KEYS.forEach(k => look[k] = SCENES[0][k]);

  /* --- bodies ---
     Radii are deliberately unevenly spaced: arithmetic spacing reads as
     an orrery diagram. Tilts stay monotonic so the ellipses never
     cross. Every radius keeps its body outside the sun's disc — the sun
     draws unit*SUN_SIZE wide, an orbit radius is unit*0.5*r, so the
     smallest r must exceed SUN_SIZE. */
  const SUN_SIZE = .17;
  const BODIES = [
    { key:'moon',     r:.30, speed:-.26, size:.038, tilt:.66, phase:5.3 },
    { key:'gasgiant', r:.40, speed: .16, size:.105, tilt:.58, phase:0.4 },
    // the one that leaves, when he talks about letting things go. Pale,
    // so it stays legible all the way out.
    { key:'ice',      r:.63, speed:-.11, size:.072, tilt:.52, phase:2.1, leaves:true },
    { key:'indigo',   r:.79, speed: .075,size:.090, tilt:.46, phase:4.0 },
    // the only body allowed to behave differently: a real eccentric
    // path with the sun at one focus, not a circle
    { key:'comet',    r:1.0, speed: .05, size:.060, tilt:.40, phase:1.2, ecc:.6 }
  ];

  /* Debris carry two lives: a scattered inbound one and an orbital one.
     `chaos` morphs between them, so the system resolves from disorder
     into order on a single scalar. */
  const DEBRIS_N = calm ? 6 : 10;
  let debris = [];
  let motes = [];
  let orbitT = 0, breathT = 0, swirl = 0;
  let noticeT = 0, noticeIdx = 0;

  function seedDebris() {
    debris = new Array(DEBRIS_N).fill(0).map((_, i) => {
      const a = Math.random() * Math.PI * 2;
      const far = .62 + Math.random() * .5;
      return {
        key: ['d1','d2','d3'][i % 3],
        ax: Math.cos(a) * far, ay: Math.sin(a) * far,
        vx: -Math.cos(a) * (.02 + Math.random() * .05),
        vy: -Math.sin(a) * (.02 + Math.random() * .05),
        spin: (Math.random() - .5) * 1.2,
        rot: Math.random() * Math.PI,
        r: .36 + Math.random() * .56,
        speed: (Math.random() < .5 ? -1 : 1) * (.05 + Math.random() * .18),
        tilt: .42 + Math.random() * .26,
        phase: Math.random() * Math.PI * 2,
        size: .020 + Math.random() * .030,
        noticed: 0,        // brightens once, then eases out and fades
        push: 0
      };
    });
    noticeIdx = 0; noticeT = 0;
  }

  function seedMotes() {
    motes = new Array(calm ? 60 : 150).fill(0).map(() => ({
      x: Math.random() * W, y: Math.random() * H,
      z: .35 + Math.random() * .9, warm: Math.random() > .86,
      live: Math.random()
    }));
  }

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
    /* The field's wake needs a canvas that is never cleared. Everything
       else is drawn fresh each frame or it accumulates: additive fills
       against a 5% decay saturate within a second, which is what once
       exposed a hard fillRect edge and the gradient's dither grid as a
       box around the sun. */
    trail = document.createElement('canvas');
    trail.width = canvas.width;
    trail.height = canvas.height;
    tc = trail.getContext('2d');
    tc.setTransform(DPR, 0, 0, DPR, 0, 0);
    seedMotes();
    if (!debris.length) seedDebris();
  }

  function sceneAt(t) {
    let i = 0;
    for (let k = 0; k < SCENES.length; k++) { if (t >= SCENES[k].at) i = k; else break; }
    return i;
  }

  const holding = (t) => HOLDS.some(([a, b]) => t >= a && t <= b);

  function read(dt) {
    if (!analyser) { voice += (.4 - voice) * Math.min(1, dt * 2); return; }
    analyser.getByteFrequencyData(freq);
    let mid = 0;
    for (let i = 4; i < 40; i++) mid += freq[i];
    voice += (mid / (36 * 255) - voice) * Math.min(1, dt * 5);
  }

  function ease(dt) {
    const k = Math.min(1, dt * .5);
    for (const key of KEYS) {
      // the sun arriving is the one event in the piece that should be
      // quick: everything else drifts in over 3-4s, this lands in ~1.5
      const rate = key === 'sun' ? Math.min(1, dt * 1.4) : k;
      look[key] += (target[key] - look[key]) * rate;
    }
  }

  function sprite(key, x, y, size, alpha, rot) {
    if (alpha <= .004 || size <= .5) return;
    const im = art[key];
    c.globalAlpha = Math.min(1, alpha);
    if (im) {
      c.save();
      c.translate(x, y);
      if (rot) c.rotate(rot);
      c.drawImage(im, -size / 2, -size / 2, size, size);
      c.restore();
    } else {
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
    if (idx !== sceneIdx) { sceneIdx = idx; target = SCENES[idx]; }

    read(dt);
    ease(dt);

    // through his silences the whole system drops to a crawl
    const hold = holding(t) ? .18 : 1;
    // his voice is allowed to nudge the pace by a tenth, no more
    const pace0 = (calm ? .5 : 1) * hold * (1 + voice * .1);

    orbitT  += dt * look.pace * pace0;
    swirl   += dt * .05 * look.pace * pace0;
    breathT += dt;

    // the guided breath: in about 4s, out about 6s
    const cyc = (breathT % 10) / 10;
    const breath = cyc < .4
      ? .5 - .5 * Math.cos(Math.PI * (cyc / .4))
      : .5 + .5 * Math.cos(Math.PI * ((cyc - .4) / .6));
    // the light follows the scene, and his breath when he is leading it
    const drive = look.breath > .5 ? (.35 + breath * .65) : .7;

    const cx = W * .5;
    // optical centre, not geometric: the rail takes the bottom ~90px
    // and the player the bottom-right corner
    const cy = H * (W < 600 ? .42 : .47);
    const unit = Math.min(W, H);

    /* --- the trail layer: smear, then this frame's mote segments --- */
    tc.globalCompositeOperation = 'destination-out';
    tc.fillStyle = 'rgba(0,0,0,.06)';
    tc.fillRect(0, 0, W, H);
    tc.globalCompositeOperation = 'lighter';

    const pace = (10 + 22 * look.pace) * pace0;
    tc.lineCap = 'round';
    for (const m of motes) {
      if (m.live > look.field) continue;
      const a = (Math.sin(m.x * .0016 + orbitT * .19)
               + Math.cos(m.y * .0021 - orbitT * .14)) * 1.4 + swirl;
      const nx = m.x + Math.cos(a) * pace * m.z * dt;
      const ny = m.y + Math.sin(a) * pace * m.z * .72 * dt;
      const al = .075 * (.4 + m.z * .6);
      tc.strokeStyle = m.warm ? `rgba(227,205,155,${al})` : `rgba(176,200,216,${al})`;
      tc.lineWidth = .6 + m.z;
      tc.beginPath(); tc.moveTo(m.x, m.y); tc.lineTo(nx, ny); tc.stroke();
      m.x = nx; m.y = ny;
      if (m.x < -20) { m.x = W + 20; m.y = Math.random() * H; }
      else if (m.x > W + 20) { m.x = -20; m.y = Math.random() * H; }
      if (m.y < -20) { m.y = H + 20; m.x = Math.random() * W; }
      else if (m.y > H + 20) { m.y = -20; m.x = Math.random() * W; }
    }

    /* --- the visible canvas, rebuilt from scratch every frame --- */
    c.setTransform(DPR, 0, 0, DPR, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, W, H);
    c.drawImage(trail, 0, 0, W, H);
    c.globalCompositeOperation = 'lighter';

    /* 1. a pocket of shade for the system to sit in.
       The nebula's bright diagonal runs straight through the centre, so
       the sun — the warmest thing on the page — was landing on the
       highest-luminance patch and losing all its contrast. Re-cropping
       cannot fix it: at a typical desktop size the plate's width fits
       the viewport exactly under `cover`, leaving no horizontal freedom
       at all. So the shade is painted here instead, which also means it
       holds at every viewport and on a phone. */
    if (look.sun > .02 || look.orbit > .02) {
      c.globalCompositeOperation = 'source-over';
      const pr = unit * .62 * Math.max(look.sun, look.orbit);
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, pr);
      g.addColorStop(0,   'rgba(4,7,12,.62)');
      g.addColorStop(.45, 'rgba(4,7,12,.42)');
      g.addColorStop(1,   'rgba(4,7,12,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, pr, 0, Math.PI * 2); c.fill();
      c.globalCompositeOperation = 'lighter';
    }

    /* 2. the light */
    const br = unit * (.2 + drive * .16) * look.bloom;
    if (br > 2) {
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, br);
      g.addColorStop(0,   `rgba(201,169,97,${.030 * drive})`);
      g.addColorStop(.55, `rgba(150,170,200,${.014 * drive})`);
      g.addColorStop(1,   'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, br, 0, Math.PI * 2); c.fill();
    }

    /* 3. the orbit paths — barely there on purpose */
    if (look.orbit > .04) {
      c.strokeStyle = `rgba(214,231,236,${.022 * look.orbit})`;
      c.lineWidth = 1;
      for (const b of BODIES) {
        if (b.ecc || b.leaves) continue;      // one is eccentric, one leaves
        const rad = unit * .5 * b.r * look.spread;
        c.beginPath();
        c.ellipse(cx, cy, rad, rad * b.tilt, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }

    /* 4. the sun, as a body — normal blending, then its corona */
    if (look.sun > .02) {
      c.globalCompositeOperation = 'source-over';
      const pulse = 1 + (look.breath > .5 ? breath * .05 : 0) + look.pulse * .11;
      const size = unit * SUN_SIZE * pulse * (.45 + look.sun * .55);
      sprite('sun', cx, cy, size, Math.min(1, look.sun), 0);
      c.globalCompositeOperation = 'lighter';
      const gr = size * 1.5;
      const g = c.createRadialGradient(cx, cy, size * .42, cx, cy, gr);
      g.addColorStop(0,  `rgba(201,169,97,${.08 * look.sun})`);
      g.addColorStop(.6, `rgba(201,169,97,${.025 * look.sun})`);
      g.addColorStop(1,  'rgba(0,0,0,0)');
      c.fillStyle = g;
      c.beginPath(); c.arc(cx, cy, gr, 0, Math.PI * 2); c.fill();
    }

    /* 5. debris */
    c.globalCompositeOperation = 'source-over';
    if (look.debris > .02 && look.cast > .02) {
      /* The practice, one thing at a time: a single rock brightens,
         then eases outward and fades. An earlier version brightened
         rocks at random, which is just twinkle. */
      if (target.name === 'notice' || target.name === 'release') {
        noticeT += dt;
        if (noticeT > 4) {
          noticeT = 0;
          const d = debris[noticeIdx % debris.length];
          if (d) d.noticed = 1;
          noticeIdx++;
        }
      }

      for (const d of debris) {
        d.ax += d.vx * dt * pace0; d.ay += d.vy * dt * pace0;
        d.rot += d.spin * dt * pace0;
        if (Math.hypot(d.ax, d.ay) < .12) {
          const a = Math.random() * Math.PI * 2;
          d.ax = Math.cos(a) * 1.05; d.ay = Math.sin(a) * 1.05;
          d.vx = -Math.cos(a) * (.02 + Math.random() * .05);
          d.vy = -Math.sin(a) * (.02 + Math.random() * .05);
        }

        if (d.noticed > 0) {
          d.noticed = Math.max(0, d.noticed - dt * .14);   // ~7s to let go
          d.push += dt * .10;
        } else if (d.push > 0) {
          d.push = Math.max(0, d.push - dt * .04);
        }

        const oa = orbitT * d.speed * 2 + d.phase;
        const orad = unit * .5 * d.r * look.spread * (1 + d.push);
        const ox = cx + Math.cos(oa) * orad;
        const oy = cy + Math.sin(oa) * orad * d.tilt;

        /* "completely surrounded": they stop drifting through and ring
           you instead. Held at mid radius, not the frame edge — at
           390px wide the edge is off-screen. */
        let sx = cx + d.ax * unit * .5;
        let sy = cy + d.ay * unit * .5;
        if (look.crowd > .01) {
          const ang = Math.atan2(d.ay, d.ax);
          const ring = unit * .5 * (.5 + .25 * Math.abs(Math.sin(d.phase * 3)));
          sx += (cx + Math.cos(ang) * ring - sx) * look.crowd;
          sy += (cy + Math.sin(ang) * ring * .72 - sy) * look.crowd;
        }

        const k = look.chaos;
        const x = sx * k + ox * (1 - k);
        const y = sy * k + oy * (1 - k);

        const lit = d.noticed;
        const alpha = look.debris * look.cast * (1 - d.push * .8) * (.55 + lit * .45);
        sprite(d.key, x, y, unit * d.size, alpha, d.rot);

        if (lit > .01) {
          c.globalCompositeOperation = 'lighter';
          const s = unit * d.size * 2;
          const g = c.createRadialGradient(x, y, 0, x, y, s);
          g.addColorStop(0, `rgba(227,205,155,${.22 * lit})`);
          g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g;
          c.beginPath(); c.arc(x, y, s, 0, Math.PI * 2); c.fill();
          c.globalCompositeOperation = 'source-over';
        }
      }
    }

    /* 6. the bodies */
    if (look.orbit > .02) {
      for (const b of BODIES) {
        const leave = b.leaves ? look.depart : 0;
        const a = orbitT * b.speed * 2 + b.phase;
        let rad = unit * .5 * b.r * look.spread * (.88 + look.orbit * .12);
        if (b.ecc) {
          // the sun sits at one focus, so it genuinely swings in and out
          rad *= (1 - b.ecc * b.ecc) / (1 + b.ecc * Math.cos(a));
        }
        rad *= 1 + leave * 1.6;                 // and one of them leaves
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad * b.tilt;
        const alpha = Math.min(1, look.orbit) * (1 - leave);
        sprite(b.key, x, y, unit * b.size * (.72 + look.orbit * .28), alpha, 0);
      }
    }

    /* 7. he asks you to close your eyes.
       A vignette, not a flat fill: a flat 19% black reads as the
       monitor dimming; an eyelid closes from the edges in. */
    if (look.dim > .01) {
      c.globalCompositeOperation = 'source-over';
      const vr = Math.hypot(W, H) * .62;
      const g = c.createRadialGradient(cx, cy, vr * .2, cx, cy, vr);
      g.addColorStop(0, `rgba(3,6,9,${look.dim * .3})`);
      g.addColorStop(1, `rgba(3,6,9,${Math.min(.96, look.dim * .95)})`);
      c.fillStyle = g;
      c.fillRect(0, 0, W, H);
    }

    c.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

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
        if (tc) tc.clearRect(0, 0, W, H);
        sceneIdx = -1; breathT = 0;
        target = SCENES[0];
        KEYS.forEach(k => look[k] = SCENES[0][k]);
        seedDebris();
      }
    },
    get scene() { return SCENES[sceneIdx] ? SCENES[sceneIdx].name : null; },
    get running() { return running; },
    destroy() { this.stop({ clear: true }); ro.disconnect(); }
  };
}
