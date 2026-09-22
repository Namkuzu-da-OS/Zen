# Zen — Design System

The quietest room in the Meatball Labs universe. Same family as
meatball-labs.com; lower voice.

---

## 1. Principle

The interface recedes. The story leads. Nothing on the page asks for
attention before the visitor has had a chance to slow down.

Three rules that decided most of the details:

1. **One invitation per screen.** Never two things competing to be clicked.
2. **The photograph stays a photograph.** Grade it enough to hold type and
   no further. Crushing it to black is how the old site lost its mountain.
3. **Labels, not emoji.** Every control says what it is in words.

---

## 2. Colour

Defined once in `:root` in `assets/css/zen.css`.

### Ink — the dark half

| Token | Value | Used for |
|---|---|---|
| `--void` | `#05080a` | page base, footer, closing act |
| `--ink-deep` | `#0a1013` | sanctuary base |
| `--ink` | `#111a1e` | raised dark surfaces |
| `--stone` | `#29373c` | rarely; borders on dark |

### Light — the warm half

| Token | Value | Used for |
|---|---|---|
| `--ivory` | `#ece4d5` | display type, primary text on dark |
| `--ivory-dim` | `ivory @ 72%` | body text on dark |
| `--ivory-faint` | `ivory @ 44%` | act marks, captions, UI labels at rest |
| `--mist` / `--mist-dim` | `#8a9a9c` / `#637375` | colophon |

### Washi — the parable lightens into this

Grey-ivory, not cream. It has to hold the fog in the monk's photograph,
which bleeds into it, rather than fight it.

| Token | Value | Used for |
|---|---|---|
| `--paper` / `--paper-warm` / `--paper-deep` | `#e3ddd1` / `#ebe6db` / `#cfc8ba` | the parable's page, as a soft radial |
| `--paper-ink` | `#2a2723` | text on the page |
| `--paper-mute` | `#625c55` | glosses |
| `--paper-gold` | `#8f7743` | the gloss seal and the title's hairline |
| `--paper-line` | `ink @ 18%` | hairlines on the page |

A faint SVG-noise fibre (`#parable::before`, multiply) keeps it a material.

### Accents — sparingly, never decoration

| Token | Value | Used for |
|---|---|---|
| `--gold` | `#c9a961` | act numbers, the one hairline, focus ring |
| `--gold-soft` | `#e3cd9b` | ensō, active controls, the turn line |
| `--moss` | `#6d8a71` | garden moss only |

Gold appears at most **twice per screen**. If a third use shows up,
one of them is decoration — cut it.

---

## 3. Type

Three families, each with exactly one job.

| Role | Family | Used for |
|---|---|---|
| Display | **Cormorant Garamond** 300/400 | hero titles, chapter heads, ensō section, the dial |
| Reading | **EB Garamond** 400/400i | the parable, the beats, all prose |
| Interface | **Inter** 300/400 | labels, act marks, nav numbers — *never prose* |

### The `.ui` class

Every interface label is the same object:

```css
font-family: var(--ui);
font-size: .72rem;      /* 11.5px — nothing that means something goes under 10.5px */
letter-spacing: .2em;
text-transform: uppercase;
```

Anything that isn't a label must not wear it. The hero's creed is prose
(EB Garamond italic), not a label.

### Display scale

Only the two "Enter Zen" titles are uppercase; they carry
`letter-spacing: .11em` and, when centred on a phone, a matching
`text-indent` — tracking adds space after the final letter, which pushes
centred text visibly off-centre without it. Left-aligned on desktop the
indent is dropped. Chapter heads and the question are mixed case.

| Element | Size |
|---|---|
| `.hero-title` | `clamp(2.35rem, 7.4vw, 5.3rem)` uppercase |
| `.turn-title` | `clamp(2.2rem, 6.8vw, 4.4rem)` uppercase |
| `.question` | `clamp(2.2rem, 7.4vw, 4.9rem)` italic, ≤17ch |
| `.parable-title` | `clamp(2rem, 4.8vw, 3.1rem)` mixed case |
| body | `1rem` / `1.85`; parable `1.06–1.14rem` / `1.85` |

---

## 4. Spacing

Two variables carry the whole rhythm:

```css
--gutter:  clamp(1.35rem, 5vw, 3rem);   /* every page edge on a phone */
--edge:    clamp(3rem, 7vw, 7rem);      /* the act's inset on desktop  */
--measure: 34rem;                        /* reading column cap */
```

On desktop the threshold, awakening and transition are `min-height:
100svh` (`svh`, not `vh` — mobile browser chrome makes `vh` overshoot and
clip the bottom of every section) and their `.inner` is a two-column
grid: copy on the darker side of the photograph, the picture left alone
on the other. On a phone only the threshold and the sanctuary fill the
screen; the reading acts are as tall as their copy.

---

## 5. Components

| Component | Where | Notes |
|---|---|---|
| `.masthead` | fixed, all acts | Adds `.on-light` over the parable and inverts. Adds `.is-deep` once the visitor is past the threshold: the lockup, creed and home link fade and only the door stays (the name returns while the menu is open, or on hover). Hides in fullscreen. |
| `.door` / `.chamber` | masthead | One hamburger; overlay lists the five acts. Matches the homepage's hamburger-only nav. |
| `.act` | the five sections | `[data-scene]` adds a photographic backdrop + scrim. `[data-wake]` (the awakening) also receives `.is-in` from the reveal sweep and clears its own grade. |
| `.act-mark` | 02–05 | Bottom-left on desktop. On a phone it moves to the top-left, where the lockup has just faded out, so the two never share an edge. |
| `.plate` | parable | The monk. Left edge of the act on desktop, banner on a phone; a mask dissolves its fog into the paper. |
| `.halo` | threshold | Three faint rings. Above the title on a phone; over the sun on desktop. |
| `.invitation` | threshold | The single call. Becomes an animated level meter when sound is on. |
| `.gloss` | parable, awakening | Seal + term + italic meaning. `.dark` variant for dark acts. |
| `.enso` | transition | Generated brush path, not a CSS circle. Ivory on a phone; ink on the sky on desktop, with the peak breaking the ring. See §7. |
| `.rail` | sanctuary | Overlaid in the shade at the foot of the garden. Sit is `.primary` (a ring) in the middle; Sound, Dawn, Rake, Fullscreen are quieter. Every target is ≥ 56×60. Pressed state: gold + a dot under the label. |
| `.sitting` | sanctuary | Timer over the garden, not beside it. The rail stays usable above it. |
| `.night` / `.playing` | sanctuary | The night meditation. The garden opens at dawn; **Dusk** on the rail starts `KTN.mp3` — *Episode 1, Kill the Noise* — inside the click, then stages the visual change over ~11s rather than swapping a single class: `#sanctuary` picks up `.is-hushing` (0s, the garden loses warmth), `.is-veiling` (~2.2s, an ink-indigo tide spreads and the garden stops taking the hand), `.is-arriving` (~5s, the cosmic plate fades to fully opaque and the garden canvas fades to `opacity:0`), then `.is-night` (~11s, ambient drift starts). The plate is preloaded on approach (`IntersectionObserver` on `#sanctuary`), never on click, so the sequence is never gated on the picture. `.night-nebula` and `.night-haze` are two low-opacity gradient layers that only animate `transform`/`opacity`, paused via `.is-ambient-paused` when the section is offscreen or the tab is hidden. `.playing` shows the episode, the title, a hairline progress, elapsed / total, Pause / Resume, and a hairline voice slider; it arrives (`.is-in`) after the hush, though it is in the accessibility tree from the first frame. The same control, now reading **Dawn**, reverses the whole sequence — the stage classes drop immediately but `--leave-seconds` (set per-exit: 6s early, 9s on the recording's own end) stretches every transition back out, so it reads as a reveal, not a snap; the garden regains the hand only once it is substantially back (~65% into that reveal). The stream ambience steps out while the voice speaks and returns if it was on. If playback fails the night stays and a *Play again* affordance replaces Pause. `#sanctuary[data-track-phase]` tracks a coarse five-phase read of the recording's own clock (threshold / release / immersion / stillness / return) for the ambient amplitude and at most one cue word (`.night-cue`) at a time — never a lyric, never over the player. |

### Per-act backdrop controls

The section names the picture and the crops; the stylesheet owns the
grade:

```html
style="--scene-webp: url('/assets/images/scenes/awakening.webp');
       --scene-jpg:  url('/assets/images/scenes/awakening.jpg');
       --scene-pos: 50% 34%;            /* desktop crop */
       --scene-pos-narrow: 46% 50%;"    /* phone crop  */
```

```css
#awakening { --scene-sat: .62; --scene-light: .58; --scene-contrast: 1.04; --scrim: …; }
```

`--scrim` is directional: it shades the part of the frame the copy sits
on and leaves the rest of the picture alone. Each act has a desktop and
a phone scrim. The awakening's grade lifts on `.is-in` so it is the
clearest moment on the page.

> **Scene paths must be root-relative (`/assets/...`).** A relative
> `url()` inside a custom property resolves against the *stylesheet*,
> not the document, so `assets/…` silently becomes
> `assets/css/assets/…` and the image never loads.

> **The JPEG is the floor.** `image-set()` with `type()` is applied
> inside `@supports`; an unsupported `image-set()` would otherwise
> invalidate the declaration and leave the act black.

---

## 6. Motion

- Easing: `cubic-bezier(.22, .61, .36, 1)`; reveal duration `1.1s`.
- Stagger: `.d1`–`.d4` = `.14s` steps.
- The awakening's backdrop clears over `3s` and settles from a `1.06`
  scale over `22s` once reached — the only ambient motion on the page.
- Reveals are **geometry-based, not IntersectionObserver** — see §7.
- `prefers-reduced-motion` forces every reveal visible and kills animation.
- `<noscript>` does the same, so the story survives with scripting off.

---

## 7. Decisions worth not re-litigating

**Reveals don't use IntersectionObserver.** Every `.reveal` starts at
`opacity: 0`. If the observer is throttled or never delivers — background
tabs and some embedded webviews do exactly that — the entire page renders
blank. A rAF-throttled `getBoundingClientRect` sweep cannot fail that way.

**`backdrop-filter` is attached to the open state.** A hidden
full-viewport `backdrop-filter` still costs the compositor every frame;
`visibility: hidden` does not take it out of the pipeline. Two stacked
here were enough to stall paint entirely. Never put one on a
permanently-present overlay.

**The ensō is a generated filled path**, not a stroked circle. The brush
lands heavy, swells through the belly and lifts to a fine tail — a stroked
`<circle>` has none of that. Regenerate with
`docs/enso.py` if the shape ever needs changing.

**All sound is synthesised.** The old site hotlinked five clips from
soundbible.com and every one is now a 404, including the mountain stream
the whole story turns on. Nothing carrying the meaning gets to depend on
someone else's server. See `assets/js/audio.js`.

**Module imports carry their own version.** `zen.js?v=8` does *not* bust
`garden.js`. Run `./bump.sh` — never hand-edit one of the four.

---

## 8. Files

```
index.html                 the five acts
assets/css/zen.css         tokens + every section
assets/js/zen.js           journey, reveals, masthead, timer, controls
assets/js/audio.js         synthesised stream, bell, rake, stone
assets/js/garden.js        the raked-sand canvas
assets/images/scenes/      threshold · parable · awakening · transition
bump.sh                    one command to move every cache version
backup/index-legacy.html   the previous site, kept for reference
```
