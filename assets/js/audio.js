/* =============================================================
   ZEN · sound
   Everything here is synthesised in the browser. The old site
   hotlinked five clips from soundbible.com and every one of them
   is now a 404 — including the mountain stream the whole story
   turns on. Nothing that carries the meaning should depend on
   someone else's server staying up.
   ============================================================= */

export const Sound = (() => {
  let ctx = null;
  let master = null;
  let stream = null;
  let wanted = false;   // the visitor asked for sound
  let ready = false;

  const LEVEL = 0.5;

  /* --- the context can only be born from a gesture --- */
  function wake() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    ready = true;
    return ctx;
  }

  /* --- noise, the raw material for water --- */
  function noiseBuffer(seconds = 4) {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      // brown-ish noise: integrated white, gentler than white on the ear
      let last = 0;
      for (let i = 0; i < n; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        d[i] = last * 3.2;
      }
    }
    return buf;
  }

  /* --- a mountain stream ---
     Three layers: the body of the water, the babble over stones,
     and a slow wander in the filter so it never loops audibly. */
  function buildStream() {
    const buf = noiseBuffer(6);
    const out = ctx.createGain();
    out.gain.value = 1;

    // body — low, continuous
    const body = ctx.createBufferSource();
    body.buffer = buf; body.loop = true;
    const bodyFilter = ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.value = 780;
    bodyFilter.Q.value = 0.6;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = 0.55;
    body.connect(bodyFilter).connect(bodyGain).connect(out);

    // babble — brighter, narrower, where the water breaks
    const babble = ctx.createBufferSource();
    babble.buffer = buf; babble.loop = true;
    babble.playbackRate.value = 1.31;      // decorrelate from the body
    const babbleFilter = ctx.createBiquadFilter();
    babbleFilter.type = 'bandpass';
    babbleFilter.frequency.value = 2600;
    babbleFilter.Q.value = 0.85;
    const babbleGain = ctx.createGain();
    babbleGain.gain.value = 0.3;
    babble.connect(babbleFilter).connect(babbleGain).connect(out);

    // the wander — two slow LFOs, deliberately not in phase
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoAmt = ctx.createGain();
    lfoAmt.gain.value = 420;
    lfo.connect(lfoAmt).connect(babbleFilter.frequency);
    lfo.start();

    const lfo2 = ctx.createOscillator();
    lfo2.frequency.value = 0.031;
    const lfo2Amt = ctx.createGain();
    lfo2Amt.gain.value = 190;
    lfo2.connect(lfo2Amt).connect(bodyFilter.frequency);
    lfo2.start();

    body.start();
    babble.start();
    return { out, nodes: [body, babble, lfo, lfo2] };
  }

  function fade(param, to, seconds) {
    const t = ctx.currentTime;
    param.cancelScheduledValues(t);
    param.setValueAtTime(param.value, t);
    param.linearRampToValueAtTime(to, t + seconds);
  }

  /* --- public --- */

  function enable() {
    if (!wake()) return false;
    wanted = true;
    if (!stream) {
      stream = buildStream();
      stream.out.connect(master);
    }
    fade(master.gain, LEVEL, 3.2);   // arrive slowly
    return true;
  }

  function disable() {
    wanted = false;
    if (ctx && master) fade(master.gain, 0, 1.6);
  }

  function toggle() {
    if (wanted) { disable(); return false; }
    return enable();
  }

  function isOn() { return wanted; }

  function level(v) {
    if (!ctx || !master) return;
    fade(master.gain, wanted ? v : 0, 0.4);
  }

  /* --- a temple bell ---
     Inharmonic partials with independent decays — that spread is
     what separates a bell from a beep. */
  function bell(when = 0, strength = 1) {
    if (!wake()) return;
    const t = ctx.currentTime + when;
    /* Pitch is not a neutral choice here — a lower bell reads as
       settling, a higher one as alerting, and this one rings at the
       end of a meditation. F3 was too bright for that job; D3 sits
       under it without becoming a drone. Every partial below is a
       ratio, so this one number moves the whole bell. */
    const fundamental = 146.8;            // D3
    const partials = [
      [1.00, 1.00, 9.0],
      [2.01, 0.52, 6.4],
      [2.99, 0.34, 4.6],
      [4.17, 0.21, 3.1],
      [5.43, 0.13, 2.2],
      [6.79, 0.08, 1.5]
    ];

    const bus = ctx.createGain();
    bus.gain.value = 0.34 * strength;
    bus.connect(ctx.destination);

    partials.forEach(([ratio, amp, decay]) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamental * ratio;
      // bells drift very slightly flat as they ring out
      osc.frequency.exponentialRampToValueAtTime(
        fundamental * ratio * 0.997, t + decay);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(g).connect(bus);
      osc.start(t);
      osc.stop(t + decay + 0.1);
    });

    // the strike itself — the hammer on bronze
    const hit = ctx.createBufferSource();
    hit.buffer = noiseBuffer(0.3);
    const hitFilter = ctx.createBiquadFilter();
    hitFilter.type = 'bandpass';
    // the strike moves with the body, or a low bell still reads bright
    hitFilter.frequency.value = 2000;
    hitFilter.Q.value = 1.2;
    const hitGain = ctx.createGain();
    hitGain.gain.setValueAtTime(0.5 * strength, t);
    hitGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    hit.connect(hitFilter).connect(hitGain).connect(ctx.destination);
    hit.start(t);
    hit.stop(t + 0.3);
  }

  /* --- the rake through sand --- */
  function rake(intensity = 1) {
    if (!ctx || !wanted) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(0.2);
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = 3200 + Math.random() * 1400;
    f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045 * intensity, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.13);
    src.connect(f).connect(g).connect(master || ctx.destination);
    src.start(t);
    src.stop(t + 0.2);
  }

  /* --- a stone set down --- */
  function stone() {
    if (!ctx || !wanted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(52, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(g).connect(master || ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  return { enable, disable, toggle, isOn, level, bell, rake, stone, wake,
           get ready() { return ready; } };
})();
