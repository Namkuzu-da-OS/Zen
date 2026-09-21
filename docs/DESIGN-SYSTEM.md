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

### Parchment — the parable inverts into this

| Token | Value | Used for |
|---|---|---|
| `--paper` | `#e9e0ce` | the parable's background |
| `--paper-ink` | `#2b2823` | text on parchment |
| `--paper-mute` | `#6a6155` | glosses, act mark on parchment |
| `--paper-line` | `ink @ 16%` | hairlines on parchment |

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
font-size: .58rem;
letter-spacing: .34em;
text-transform: uppercase;
```

Anything that isn't a label must not wear it.

### Display scale

Uppercase display titles carry `letter-spacing: .17em` **plus a matching
`text-indent`** — tracking adds space after the final letter, which pushes
centred text visibly off-centre without it.

| Element | Size |
|---|---|
| `.hero-title` | `clamp(2.15rem, 7.4vw, 4.6rem)` |
| `.turn-title` | `clamp(1.95rem, 6.6vw, 3.9rem)` |
| `.question` | `clamp(1.85rem, 6.2vw, 3.6rem)` italic |
| `.parable-title` | `clamp(1.6rem, 4.6vw, 2.35rem)` |
| body | `1rem` / `1.85`; parable `1.95` |

---

## 4. Spacing

Two variables carry the whole rhythm:

```css
--gutter:  clamp(1.35rem, 5vw, 3rem);   /* every page edge */
--measure: 34rem;                        /* reading column cap */
```

Each act is `min-height: 100svh` (`svh`, not `vh` — mobile browser
chrome makes `vh` overshoot and clip the bottom of every section).

---

## 5. Components

| Component | Where | Notes |
|---|---|---|
| `.masthead` | fixed, all acts | Adds `.on-light` over the parable and inverts. Hides in fullscreen. |
| `.door` / `.chamber` | masthead | One hamburger; overlay lists the five acts. Matches the homepage's hamburger-only nav. |
| `.act` | the five sections | `[data-scene]` adds a photographic backdrop + scrim. |
| `.invitation` | threshold | The single call. Becomes an animated level meter when sound is on. |
| `.gloss` | parable, awakening | Seal + term + italic meaning. `.dark` variant for dark acts. |
| `.enso` | transition | Generated brush path, not a CSS circle. See §7. |
| `.rail` | sanctuary | Five labelled controls: Sound, Sit, Dawn, Rake, Fullscreen. |
| `.sitting` | sanctuary | Timer over the garden, not beside it. |

### Per-act backdrop controls

Set on the section, consumed by `.act[data-scene]::before`:

```html
style="--scene: url('/assets/images/scenes/awakening.jpg');
       --scene-pos: 58% center;
       --scene-light: .8;"      /* default .56 */
```

`--scene-light` exists because the awakening is the emotional peak and
has to be the brightest moment on the page.

> **Scene paths must be root-relative (`/assets/...`).** A relative
> `url()` inside a custom property resolves against the *stylesheet*,
> not the document, so `assets/…` silently becomes
> `assets/css/assets/…` and the image never loads.

---

## 6. Motion

- Easing: `cubic-bezier(.22, .61, .36, 1)`; reveal duration `1.1s`.
- Stagger: `.d1`–`.d4` = `.14s` steps.
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
