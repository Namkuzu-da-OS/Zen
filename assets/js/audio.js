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

  /* --- noise, the raw material for water ---
     Brown noise is the sound of a large body of water: its energy
     piles up at the bottom. A stream lives in the top half, so the
     bright layers need white. */
  function noiseBuffer(seconds = 4, colour = 'brown') {
    const n = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      if (colour === 'white') {
        for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * 0.5;
      } else {
        let last = 0;
        for (let i = 0; i < n; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          d[i] = last * 3.2;
        }
      }
    }
    return buf;
  }

  /* --- a mountain stream, recorded ---
     Synthesis lost this one. Three attempts all read as surf, and the
     last measurement said why: what separates a brook from an ocean is
     brightness and fast flicker, and a filtered noise bed cannot get
     there. A real recording measures at a 4100 Hz spectral centroid
     with a fast/slow envelope ratio of 64; the synthesised version was
     nowhere near either.

     assets/audio/stream.mp3 — "Brook sound" by Wikimedia Commons user
     TwoWings, CC BY 3.0, prepared in three ways: high-passed at 170 Hz
     because low rumble is the ocean signature; de-clicked, since the
     source carried 51 isolated single-sample spikes up to 3x the next
     loudest content, which would tick in a quiet loop; and crossfaded
     tail-into-head for a seamless 14.16s loop. Web Audio loops the
     decoded buffer, so mp3 encoder padding cannot open a gap.

     Self-hosted, deliberately. This site's predecessor hotlinked five
     clips and all five are now 404. */
  let streamBuf = null;

  async function loadStreamBuffer() {
    if (streamBuf) return streamBuf;
    const res = await fetch('/assets/audio/stream.mp3');
    if (!res.ok) throw new Error('stream ' + res.status);
    streamBuf = await ctx.decodeAudioData(await res.arrayBuffer());
    return streamBuf;
  }

  /* How loud the water sits under everything else. Separate from
     LEVEL, which is the module's master and also carries the rake and
     the stones — turning that down would quieten the garden too. */
  const STREAM_LEVEL = 0.58;

  function playSample(buf) {
    const out = ctx.createGain();
    out.gain.value = STREAM_LEVEL;

    /* Two copies of the same loop, started half a loop apart and
       panned wide. One mono source played straight is a point — a
       single jet hitting one spot, which is what it sounded like.
       Offsetting by half the loop decorrelates the two sides
       completely and permanently, so it becomes a field of water you
       are standing in rather than a thing in front of you. Costs no
       extra bytes: it is the same buffer twice. */
    const half = buf.duration / 2;
    const nodes = [];
    /* Near-hard pan: StereoPanner uses an equal-power law, so at
       +/-0.72 each copy still bleeds heavily into the opposite
       channel and the two sides measured 0.44 correlated - wider
       than mono, but not a field. */
    [[0, -0.95], [half, 0.95]].forEach(([offset, pan]) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const g = ctx.createGain();
      g.gain.value = 0.72;            // two sources, so back each off
      if (p) { p.pan.value = pan; src.connect(p).connect(g).connect(out); }
      else src.connect(g).connect(out);
      src.start(0, offset);
      nodes.push(src);
    });

    // No filter wander on top. Slow modulation is exactly what made
    // the synthesised version sound like surf; the recording already
    // has all the movement it needs.
    return { out, nodes };
  }

  /* --- the fallback: a synthesised stream ---
     The first version read as surf, and the reason was the
     modulation: two LFOs at 0.07 Hz and 0.031 Hz, so the filters
     swelled over 14 and 32 second cycles. Slow swells against a
     brown-noise bed is the definition of an ocean. A stream does the
     opposite — it is bright, it flickers fast, and it is granular,
     because the sound is thousands of separate collisions with stone.

     So: the deep bed is pushed back to almost nothing, the bright
     bands carry it, the modulation runs 20 to 50 times faster, and
     discrete gurgles are scheduled on top. The gurgles are what
     actually sell it; a filtered noise wash never will. */
  function buildSynthStream() {
    const brown = noiseBuffer(6, 'brown');
    const white = noiseBuffer(6, 'white');
    const out = ctx.createGain();
    out.gain.value = STREAM_LEVEL;      // match the recording it stands in for

    const layer = (buf, rate, type, freq, q, gain) => {
      const src = ctx.createBufferSource();
      src.buffer = buf; src.loop = true; src.playbackRate.value = rate;
      const f = ctx.createBiquadFilter();
      f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = ctx.createGain(); g.gain.value = gain;
      src.connect(f).connect(g).connect(out);
      src.start();
      return { src, f, g };
    };

    // the body of the water: present, but no longer the loudest thing
    const body   = layer(brown, 1.00, 'lowpass',  520,  0.7, 0.18);
    // the babble over stones — this is the stream
    const babble = layer(white, 1.00, 'bandpass', 1500, 0.9, 0.30);
    // and the fine spray at the top
    const spray  = layer(white, 1.27, 'bandpass', 4600, 0.7, 0.13);

    // fast, shallow movement. Water flickers; it does not swell.
    const wobble = (target, hz, depth) => {
      const lfo = ctx.createOscillator();
      lfo.type = 'triangle';
      lfo.frequency.value = hz;
      const amt = ctx.createGain();
      amt.gain.value = depth;
      lfo.connect(amt).connect(target);
      lfo.start();
      return lfo;
    };
    const l1 = wobble(babble.f.frequency, 1.7,  520);
    const l2 = wobble(spray.f.frequency,  2.9,  900);
    const l3 = wobble(babble.g.gain,      0.8,  0.05);

    /* The gurgles: short resonant blips, a few every second at random
       intervals and pitches. This is the granularity that separates
       running water from a noise wash. */
    let scheduled = ctx.currentTime;
    function fillGurgles() {
      if (!wanted) { scheduled = ctx.currentTime; return; }
      const horizon = ctx.currentTime + 1.2;
      while (scheduled < horizon) {
        scheduled += 0.06 + Math.random() * 0.22;
        const t = scheduled;
        const hi = Math.random() < 0.3;

        const src = ctx.createBufferSource();
        src.buffer = white;
        src.loop = false;
        // start somewhere random in the buffer for a fresh grain
        const off = Math.random() * 5;

        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        const base = hi ? 2200 + Math.random() * 2600 : 700 + Math.random() * 1100;
        f.frequency.setValueAtTime(base, t);
        // a blip of water rises slightly in pitch as the bubble collapses
        f.frequency.linearRampToValueAtTime(base * (1.1 + Math.random() * 0.5), t + 0.07);
        f.Q.value = 6 + Math.random() * 10;

        const g = ctx.createGain();
        const peak = (hi ? 0.05 : 0.09) * (0.5 + Math.random() * 0.8);
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05 + Math.random() * 0.08);

        src.connect(f).connect(g).connect(out);
        src.start(t, off, 0.2);
        src.stop(t + 0.22);
      }
    }
    fillGurgles();
    const gurgleTimer = setInterval(fillGurgles, 700);

    return { out, nodes: [body.src, babble.src, spray.src, l1, l2, l3], gurgleTimer };
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

    if (stream) { fade(master.gain, LEVEL, 3.2); return true; }

    /* The recording is the real thing and the synth is the safety net.
       The fade-in is 3.2s, so a short decode is invisible. */
    loadStreamBuffer()
      .then((buf) => {
        if (!wanted || stream) return;
        stream = playSample(buf);
        stream.out.connect(master);
        fade(master.gain, LEVEL, 3.2);
      })
      .catch(() => {
        if (!wanted || stream) return;
        stream = buildSynthStream();
        stream.out.connect(master);
        fade(master.gain, LEVEL, 3.2);
      });
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
