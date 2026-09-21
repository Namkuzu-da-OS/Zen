/* =============================================================
   ZEN · the journey
   Section reveals, the invitation, and the sanctuary controls.
   The interface should never be the thing you notice.
   ============================================================= */

import { Sound } from './audio.js?v=9';
import { createGarden } from './garden.js?v=9';

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
  pending = $$('.reveal');
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

  $('[data-control="sound"]')?.addEventListener('click', (e) => {
    const on = Sound.toggle();
    e.currentTarget.setAttribute('aria-pressed', String(on));
    syncSoundControl(on);
  });

  $('[data-control="atmosphere"]')?.addEventListener('click', (e) => {
    const mode = garden.atmosphere(garden.mode === 'night' ? 'day' : 'night');
    e.currentTarget.setAttribute('aria-pressed', String(mode === 'day'));
    e.currentTarget.querySelector('.lbl').textContent = mode === 'day' ? 'Dusk' : 'Dawn';
  });

  $('[data-control="reset"]')?.addEventListener('click', () => garden.reset());

  const stage = $('#sanctuary');
  $('[data-control="fullscreen"]')?.addEventListener('click', async (e) => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.requestFullscreen();
    } catch { /* the browser said no; nothing here is worth an alert */ }
    e.currentTarget.setAttribute('aria-pressed', String(!!document.fullscreenElement));
  });

  document.addEventListener('fullscreenchange', () => {
    const on = !!document.fullscreenElement;
    $('[data-control="fullscreen"]')?.setAttribute('aria-pressed', String(on));
    $('.masthead')?.classList.toggle('is-hidden', on);
  });

  wireSitting();
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

/* the masthead reads whatever it is currently sitting on */
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
  };

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
