/* =============================================================
   ZEN · the journey
   Section reveals, the invitation, and the sanctuary controls.
   The interface should never be the thing you notice.
   ============================================================= */

import { Sound } from './audio.js?v=36';
import { createGarden } from './garden.js?v=36';
import { createCosmos, SCENES } from './cosmos.js?v=36';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 1. reveals ----------
   Deliberately geometry-based rather than IntersectionObserver.
   Every element here starts at opacity 0, so if the observer is
   throttled or never delivers — background tabs and some embedded
   webviews do exactly that — the whole page renders blank. Reading
   rects on a rAF-throttled scroll is cheaper than that risk. */

let pending = [];

function sweep() {
  if (!pending.length) return;
  const h = window.innerHeight || document.documentElement.clientHeight;
  const edge = h * 0.88;                 // reveal a little before centre
  const still = [];
  for (const el of pending) {
    const r = el.getBoundingClientRect();
    // Anything that has reached the trigger line is revealed — including
    // what is now above the viewport. Requiring it to still be on screen
    // meant an anchor jump or a fast scroll could vault straight over an
    // element, leaving it invisible for the rest of the session.
    if (r.top < edge) el.classList.add('is-in');   // arriving happens once
    else still.push(el);
  }
  pending = still;
}

function watchReveals() {
  // [data-wake] marks a whole act that changes state on arrival (the
  // awakening clears its own weather) without the opacity of a reveal.
  pending = $$('.reveal, [data-wake]');
  sweep();                                // whatever is already here, now

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sweep(); });
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  addEventListener('load', sweep);

  // last resort: nothing should stay hidden forever
  setTimeout(sweep, 1200);
}

/* ---------- 2. the door ---------- */

function wireDoor() {
  const door = $('.door');
  const chamber = $('.chamber');
  if (!door || !chamber) return;

  const setOpen = (open) => {
    door.setAttribute('aria-expanded', String(open));
    chamber.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  door.addEventListener('click', () =>
    setOpen(door.getAttribute('aria-expanded') !== 'true'));

  chamber.addEventListener('click', (e) => {
    if (e.target === chamber || e.target.closest('a')) setOpen(false);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

/* ---------- 3. the invitation ---------- */

function wireInvitation() {
  const btn = $('.invitation');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const on = Sound.toggle();
    btn.classList.toggle('is-playing', on);
    btn.setAttribute('aria-pressed', String(on));
    syncSoundControl(on);
    const lbl = btn.querySelector('.ui');
    if (lbl) lbl.textContent = on ? 'Listening' : 'Listen';
  });
}

function syncSoundControl(on) {
  const c = $('[data-control="sound"]');
  if (c) c.setAttribute('aria-pressed', String(on));
  const inv = $('.invitation');
  if (inv) {
    inv.classList.toggle('is-playing', on);
    inv.setAttribute('aria-pressed', String(on));
    const lbl = inv.querySelector('.ui');
    if (lbl) lbl.textContent = on ? 'Listening' : 'Listen';
  }
}

/* ---------- 4. the sanctuary ---------- */

const REFLECTIONS = [
  'In the end, there is no place to go and nothing to become. Only this moment, more alive.',
  'The stream was always sounding. Only the listening was new.',
  'You cannot arrive somewhere you have never left.',
  'Stillness is not the absence of motion. It is the absence of resistance.',
  'What is here, when you stop reaching for what is next?'
];

function wireSanctuary() {
  const canvas = $('#garden');
  if (!canvas) return;

  const garden = createGarden(canvas, {
    onRake: (i) => Sound.rake(i),
    onStone: () => Sound.stone()
  });

  /* --- the rail --- */

  const night = wireNight(garden);

  $('[data-control="sound"]')?.addEventListener('click', (e) => {
    const on = Sound.toggle();
    e.currentTarget.setAttribute('aria-pressed', String(on));
    syncSoundControl(on);
    // asked for under the voice, the stream stays well beneath it
    if (on && night.active) Sound.level(0.22);
  });

  $('[data-control="reset"]')?.addEventListener('click', () => garden.reset());

  const stage = $('#sanctuary');
  $('[data-control="fullscreen"]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;       // gone from the event once we await
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch { /* the browser said no; nothing here is worth an alert */ }
    btn.setAttribute('aria-pressed', String(!!document.fullscreenElement));
  });

  document.addEventListener('fullscreenchange', () => {
    const on = !!document.fullscreenElement;
    $('[data-control="fullscreen"]')?.setAttribute('aria-pressed', String(on));
    $('.masthead')?.classList.toggle('is-hidden', on);
  });

  wireSitting();
}

/* ---------- 4b. the night — Episode 1, Kill the Noise ----------
   Dusk is a choice, and a staged one: a hush over the garden, an ink
   tide that swallows it, then a cosmos that arrives whole — about
   eleven seconds, on a fixed clock, never waiting on the picture.
   Dawn — the same control — or the end of the recording reverses it,
   gracefully, over the same rhythm. The voice owns the soundstage:
   the stream steps out while it speaks and returns afterwards if it
   was there before. */

function wireNight(garden) {
  const stage   = $('#sanctuary');
  const btn     = $('[data-control="atmosphere"]');
  const plate   = $('.night-plate');
  const cue     = $('.night-cue');
  const box     = $('.playing');
  const audio   = $('#ktn');
  const api     = { active: false };
  if (!stage || !btn || !plate || !box || !audio) return api;

  const lbl     = btn.querySelector('.lbl');
  const hint    = btn.querySelector('.hint');
  const fill    = box.querySelector('.fill');
  const bar     = box.querySelector('.progress');
  const elapsed = box.querySelector('.elapsed');
  const total   = box.querySelector('.total');
  const pause   = box.querySelector('.pause');
  const pauseL  = pause.querySelector('.lbl');
  const replay  = box.querySelector('.replay');
  const voice   = box.querySelector('.voice input');
  const note    = box.querySelector('.note');

  /* The tide reads the recording itself and moves the night with it.
     It shares the one AudioContext rather than opening a second. */
  const cosmos = createCosmos($('.night-tide'), {
    audioEl: audio,
    getContext: () => Sound.wake()
  });

  const FALLBACK_LENGTH = 336;           // 5:36, until the file says otherwise

  // the staged arrival — hush, then the ink tide, then the cosmos.
  // Reduced motion does not skip this — it is still a day/night
  // *change*, not a swap — it only compresses it to a short, calm,
  // opacity-only cross-dissolve (~2.8s) with no drift and no scaling;
  // see the .night-veil / .night-plate / #garden overrides in the
  // prefers-reduced-motion block in zen.css, which give exactly these
  // elements a real transition-duration the blanket .001ms rule there
  // would otherwise erase.
  const HUSH_MS   = reduced ? 0    : 2200;  // the garden loses its warmth; the veil begins
  const VEIL_MS   = reduced ? 0    : 2200;  // the dissolve begins; the garden stops taking the hand
  const ARRIVE_MS = reduced ? 400  : 5000;  // the plate starts becoming opaque
  const NIGHT_MS  = reduced ? 2800 : 11000; // the garden is gone; the cosmos is the room
  const PLAYER_MS = reduced ? 2500 : HUSH_MS; // reduced: near the end, not right after the hush
  const LEAVE_S   = reduced ? 2.6  : 0;     // 0 here means "use the reason-based figure below"
  const LOCK_HOLD = 0.65;                   // dawn: how far in before the garden takes the hand again

  // the recording as a slow emotional clock, not a lyric sync — a
  // coarse phase, at most one cue word, updated only at a boundary
  /* The scene timeline in cosmos.js is the single source of truth for
     timing — derived from a transcript of the narration cross-checked
     against a novelty curve over the waveform. Here we only decide
     which scenes get a word on screen. The narration itself never
     appears; these are our own plain verbs. */
  const CUES = {
    arrive:  'Listen',
    breath:  'Breathe',
    notice:  'Notice',
    release: 'Release',
    return:  'Return'
  };
  const TRACK_PHASES = SCENES.map(s => ({
    at: s.at, name: s.name, cue: CUES[s.name] || null
  }));

  let wanted = 0.9;                      // the visitor's chosen voice level
  let fadeRaf = 0;
  let ambienceWasOn = false;
  let skyPrimed = false;
  let timers = [];                       // every setTimeout tied to entering or leaving
  let cueTimer = 0;
  let cueWord = null;
  let phaseIdx = -1;
  let offscreen = false;
  let docHidden = document.hidden;

  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
    clearTimeout(cueTimer);
  }
  function after(ms, fn) {
    if (!ms) { fn(); return; }
    timers.push(setTimeout(fn, ms));
  }

  /* --- the voice's level moves slowly, never steps --- */
  function fadeTo(v, seconds, done) {
    cancelAnimationFrame(fadeRaf);
    const from = audio.volume, t0 = performance.now();
    if (!seconds) { audio.volume = v; done && done(); return; }
    const step = (now) => {
      // a frame's timestamp can precede t0 by a fraction; keep p in [0, 1]
      const p = Math.min(1, Math.max(0, (now - t0) / (seconds * 1000)));
      audio.volume = Math.min(1, Math.max(0, from + (v - from) * p));
      if (p < 1) fadeRaf = requestAnimationFrame(step);
      else { fadeRaf = 0; done && done(); }
    };
    fadeRaf = requestAnimationFrame(step);
  }

  /* --- what the visitor can see of the recording --- */
  function paint() {
    const d = audio.duration || FALLBACK_LENGTH;
    const t = audio.currentTime || 0;
    elapsed.textContent = clock(t);
    const pct = Math.min(100, (t / d) * 100);
    fill.style.width = pct.toFixed(2) + '%';
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  /* one word, at a time, breathed in and out — never a lyric, never
     over the player */
  function setCue(word) {
    if (!cue || word === cueWord) return;
    cueWord = word;
    cue.classList.remove('is-in');
    clearTimeout(cueTimer);
    cueTimer = setTimeout(() => {
      if (!word) return;
      cue.textContent = word;
      requestAnimationFrame(() => cue.classList.add('is-in'));
    }, reduced ? 0 : 900);
  }

  function checkPhase() {
    const t = audio.currentTime || 0;
    let idx = 0;
    for (let i = 0; i < TRACK_PHASES.length; i++) {
      if (t >= TRACK_PHASES[i].at) idx = i; else break;
    }
    if (idx === phaseIdx) return;
    phaseIdx = idx;
    const phase = TRACK_PHASES[idx];
    stage.dataset.trackPhase = phase.name;
    setCue(phase.cue);
  }

  function setPlaying(on) {
    box.classList.toggle('is-playing', on);
    pauseL.textContent = on ? 'Pause' : 'Resume';
  }

  /* playback could not start, or stopped on its own. The night stays;
     the interface must not claim otherwise. */
  function failed() {
    if (!api.active) return;
    setPlaying(false);
    pause.hidden = true;
    replay.hidden = false;
    note.textContent = 'The recording did not start';
  }

  function attempt() {
    note.textContent = '';
    const p = audio.play();
    if (p && p.then) {
      p.then(() => { pause.hidden = false; replay.hidden = true; })
       .catch(failed);
    }
  }

  /* the plate is primed well before the visitor can reach Dusk, so the
     click itself never waits on a fetch. Setting these custom
     properties is enough to start the browser loading the image —
     opacity 0 does not defer it — so priming is decoupled entirely
     from the visible sequence below. */
  function primeSky() {
    if (skyPrimed) return;
    skyPrimed = true;
    plate.style.setProperty('--scene-webp', `url('${plate.dataset.webp}')`);
    plate.style.setProperty('--scene-jpg', `url('${plate.dataset.jpg}')`);
  }

  function syncAmbient() {
    const idle = offscreen || docHidden;
    stage.classList.toggle('is-ambient-paused', idle);
    // never leave the tide burning frames against a hidden tab
    if (idle) cosmos.stop();
    else if (api.active && !audio.paused) cosmos.start();
  }

  function enter() {
    if (api.active) return;
    api.active = true;
    clearTimers();
    stage.classList.remove('is-leaving', 'is-hushing', 'is-veiling', 'is-arriving', 'is-night', 'is-locked');
    primeSky();

    // the recording first: play() has to be inside the gesture
    audio.volume = 0;
    try { audio.currentTime = 0; } catch { /* not loaded yet; it starts at 0 anyway */ }
    attempt();
    fadeTo(wanted, reduced ? 0 : 2.5);

    // the stream steps out while the voice speaks
    ambienceWasOn = Sound.isOn();
    if (ambienceWasOn) { Sound.disable(); syncSoundControl(false); }

    // the garden's own colour drifts across the whole sequence; the
    // staged classes below carry the rest — the veil, the plate, the
    // canvas fading out entirely
    garden.atmosphere('night', reduced ? 0 : 10);
    stage.classList.add('is-hushing');
    after(VEIL_MS, () => stage.classList.add('is-veiling', 'is-locked'));
    after(ARRIVE_MS, () => stage.classList.add('is-arriving'));
    after(NIGHT_MS, () => stage.classList.add('is-night'));

    btn.setAttribute('aria-pressed', 'true');
    lbl.textContent = 'Dawn';
    if (hint) hint.textContent = ', end the night meditation';

    // present to keyboards and screen readers immediately; the .is-in
    // class only delays how soon it is *seen*
    box.hidden = false;
    paint();
    phaseIdx = -1;
    checkPhase();
    setPlaying(true);
    after(PLAYER_MS, () => box.classList.add('is-in'));
  }

  function leave(reason) {
    if (!api.active) return;
    api.active = false;
    clearTimers();
    cosmos.stop({ clear: true });

    if (reason === 'ended') {
      audio.pause();
      audio.currentTime = 0;
      Sound.bell(0.6, 0.55);            // one soft note to close
    } else {
      // early exit: the voice fades, then the recording goes back to the start
      fadeTo(0, reduced ? 0 : 1, () => { audio.pause(); audio.currentTime = 0; });
    }

    const seconds = reduced ? LEAVE_S : (reason === 'ended' ? 9 : 6);
    stage.style.setProperty('--leave-seconds', seconds + 's');
    stage.classList.add('is-leaving');
    stage.classList.remove('is-hushing', 'is-veiling', 'is-arriving', 'is-night');
    garden.atmosphere('day', seconds);
    after(seconds * 1000 + 500, () => stage.classList.remove('is-leaving'));

    // the garden only takes the hand again once dawn has substantially
    // revealed it — not the instant the click happens
    after(Math.round(seconds * 1000 * LOCK_HOLD), () => stage.classList.remove('is-locked'));

    btn.setAttribute('aria-pressed', 'false');
    lbl.textContent = 'Dusk';
    if (hint) hint.textContent = ', begin the night meditation';

    box.classList.remove('is-in');
    after(reduced ? 1000 : 1700, () => {
      if (!api.active) { box.hidden = true; note.textContent = ''; pause.hidden = false; replay.hidden = true; }
    });

    setCue(null);
    stage.dataset.trackPhase = '';
    phaseIdx = -1;

    // the stream comes back if it was there before; if the visitor
    // asked for it under the voice, it comes up to its usual level
    if (ambienceWasOn && !Sound.isOn()) { Sound.enable(); syncSoundControl(true); }
    else if (Sound.isOn()) Sound.level(0.5);
  }

  /* --- wiring --- */
  btn.addEventListener('click', () => (api.active ? leave('early') : enter()));

  pause.addEventListener('click', () => {
    if (audio.paused) attempt(); else audio.pause();
  });
  replay.addEventListener('click', attempt);

  voice.addEventListener('input', () => {
    wanted = Number(voice.value);
    if (api.active && !fadeRaf) audio.volume = wanted;
  });

  audio.addEventListener('timeupdate', () => { paint(); if (api.active) checkPhase(); });
  audio.addEventListener('durationchange', () => {
    if (isFinite(audio.duration)) total.textContent = clock(audio.duration);
  });
  audio.addEventListener('playing', () => {
    if (!api.active) return;
    setPlaying(true); note.textContent = '';
    if (!offscreen && !docHidden) cosmos.start();
  });
  audio.addEventListener('waiting', () => { if (api.active) note.textContent = 'Buffering'; });
  audio.addEventListener('pause', () => {
    cosmos.stop();
    if (api.active && !audio.ended) setPlaying(false);
  });
  audio.addEventListener('ended', () => leave('ended'));
  audio.addEventListener('error', failed);

  /* --- preload, well before the visitor can reach Dusk --- */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { primeSky(); io.disconnect(); }
    }, { rootMargin: '800px 0px' });
    io.observe(stage);
  } else {
    primeSky();
  }
  if ('requestIdleCallback' in window) requestIdleCallback(primeSky, { timeout: 4000 });
  else setTimeout(primeSky, 3000);

  /* --- the drifting layers cost nothing while no one can see them --- */
  if ('IntersectionObserver' in window) {
    offscreen = true;              // don't assume visible before the first callback
    const ioAmbient = new IntersectionObserver((entries) => {
      entries.forEach((e) => { offscreen = !e.isIntersecting; syncAmbient(); });
    }, { threshold: 0 });
    ioAmbient.observe(stage);
  }
  document.addEventListener('visibilitychange', () => { docHidden = document.hidden; syncAmbient(); });

  return api;
}

/* ---------- 5. the sitting ---------- */

function wireSitting() {
  const panel  = $('.sitting');
  const arc    = $('.dial .arc');
  const count  = $('.dial .count');
  const go     = $('.sit-go');
  const quote  = $('.reflection');
  if (!panel) return;

  const R = 46;
  const CIRC = 2 * Math.PI * R;
  arc.style.strokeDasharray = CIRC.toFixed(2);
  arc.style.strokeDashoffset = CIRC.toFixed(2);

  let minutes = 10;
  let remaining = minutes * 60;
  let tick = null;

  const clock = (s) => {
    const m = Math.floor(s / 60);
    const ss = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${ss}`;
  };

  function paint() {
    count.textContent = clock(remaining);
    const done = 1 - remaining / (minutes * 60);
    arc.style.strokeDashoffset = (CIRC * (1 - done)).toFixed(2);
  }

  function stop() {
    clearInterval(tick);
    tick = null;
    go.textContent = 'Begin';
  }

  function reset() {
    stop();
    remaining = minutes * 60;
    arc.style.transition = 'none';
    paint();
    requestAnimationFrame(() => { arc.style.transition = ''; });
  }

  function start() {
    Sound.wake();
    Sound.bell(0, 0.85);            // one, to begin
    go.textContent = 'Stop';
    showReflection();
    tick = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        remaining = 0;
        paint();
        stop();
        Sound.bell(0, 1);
        Sound.bell(3.4, 0.7);       // and two, to close
        return;
      }
      paint();
    }, 1000);
  }

  function showReflection() {
    if (!quote) return;
    quote.classList.remove('is-in');
    setTimeout(() => {
      quote.textContent = REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)];
      quote.classList.add('is-in');
    }, reduced ? 0 : 700);
  }

  $$('.spans button').forEach((b) => {
    b.addEventListener('click', () => {
      $$('.spans button').forEach((o) => o.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      minutes = Number(b.dataset.minutes);
      reset();
    });
  });

  go.addEventListener('click', () => (tick ? (stop(), reset()) : start()));

  const setOpen = (open) => {
    panel.classList.toggle('is-open', open);
    $('[data-control="sit"]')?.setAttribute('aria-pressed', String(open));
    if (open) { reset(); showReflection(); } else { stop(); }
  };

  $('[data-control="sit"]')?.addEventListener('click', () =>
    setOpen(!panel.classList.contains('is-open')));
  $('.sit-close')?.addEventListener('click', () => setOpen(false));
  $('.begin')?.addEventListener('click', () => {
    $('#sanctuary').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(() => setOpen(true), reduced ? 0 : 900);
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('is-open')) setOpen(false);
  });

  reset();
}

/* ---------- 6. the awakening deepens ---------- */

function wireAwakening() {
  const act = $('#awakening');
  if (!act) return;

  // if sound is on, the stream comes forward as you reach the question
  let deep = false;
  let queued = false;

  const check = () => {
    queued = false;
    if (!Sound.isOn()) return;
    const r = act.getBoundingClientRect();
    const h = window.innerHeight;
    const inside = r.top < h * 0.5 && r.bottom > h * 0.5;
    if (inside === deep) return;
    deep = inside;
    Sound.level(deep ? 0.78 : 0.5);
  };

  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  }, { passive: true });
}

/* ---------- 7. go ---------- */

/* the masthead reads whatever it is currently sitting on, and steps
   back once the visitor has crossed the threshold */
function wireMasthead() {
  const bar = $('.masthead');
  const light = $$('#parable');
  if (!bar || !light.length) return;

  let queued = false;
  const check = () => {
    queued = false;
    const y = bar.getBoundingClientRect().bottom;
    const onLight = light.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top < y && r.bottom > y;
    });
    bar.classList.toggle('on-light', onLight);
    const sy = window.scrollY;
    const h = window.innerHeight;
    bar.classList.toggle('is-deep', sy > h * 0.55);

    // the door steps aside while the reader is moving down the page
    // and comes back the moment they scroll up. Past the threshold only.
    const down = sy > lastY + 2;
    const upward = sy < lastY - 2;
    if (down && sy > h * 0.55) bar.classList.add('is-reading');
    else if (upward || sy <= h * 0.55) bar.classList.remove('is-reading');
    lastY = sy;

    // the scroll cue has done its job once the visitor has moved
    cue?.classList.toggle('is-gone', sy > h * 0.3);
  };

  let lastY = window.scrollY;
  const cue = $('.scroll-cue');

  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(check);
  }, { passive: true });
  addEventListener('resize', check, { passive: true });
  check();
}

function boot() {
  watchReveals();
  wireMasthead();
  wireDoor();
  wireInvitation();
  wireSanctuary();
  wireAwakening();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
