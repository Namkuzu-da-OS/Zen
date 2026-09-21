# Zen · Enter Zen From There

The quietest room in the Meatball Labs universe.
Live at **[zen.meatball-labs.com](https://zen.meatball-labs.com/)**.

A guided five-act journey through a Zen parable, ending in a sanctuary you
can actually sit in.

| | Act | What happens |
|---|---|---|
| 01 | **The Threshold** | Arrival. One invitation: *Listen*. |
| 02 | **The Parable** | The page inverts to parchment. The story, paced, with glosses. |
| 03 | **The Awakening** | *"Do you hear the sound of that mountain stream?"* If sound is on, the stream comes forward here. |
| 04 | **The Transition** | A brush ensō. *Enter Zen From Here.* |
| 05 | **The Sanctuary** | A rakeable dry garden, a meditation timer, sound, atmosphere, fullscreen. |

---

## Running it

ES modules need a real origin — `file://` will not work.

```bash
python -m http.server 8778
# http://localhost:8778/
```

## Changing anything

```bash
./bump.sh     # moves every cache version together — always use this
```

`zen.js?v=N` does **not** bust `garden.js` or `audio.js`; module imports
carry their own version. `bump.sh` moves all four so they cannot drift.

## Structure

```
index.html                 the five acts
assets/css/zen.css         tokens + every section
assets/js/zen.js           journey, reveals, masthead, timer, controls
assets/js/audio.js         synthesised stream, bell, rake, stone
assets/js/garden.js        the raked-sand canvas
assets/images/scenes/      threshold · parable · awakening · transition
docs/DESIGN-SYSTEM.md      colour, type, spacing, components, decisions
docs/ART-BRIEF.md          ← the art is placeholder; this says how to fix it
docs/enso.py               regenerates the ensō brush path
backup/index-legacy.html   the previous single-file site
```

---

## Two things to know

**The art is placeholder.** All four scenes are re-crops of one 1024×768
photo. Dropping real files at the same paths is the entire fix — no code
changes. See `docs/ART-BRIEF.md` for sizes and prompts.

**All sound is synthesised in the browser.** The old site hotlinked five
clips from soundbible.com and every one of them is now a 404 — including
the mountain stream the whole story turns on. `assets/js/audio.js` builds
the stream from filtered noise and the temple bell from inharmonic
partials, so there is nothing left to break.

---

## Accessibility

- `prefers-reduced-motion` reveals everything immediately and stops animation.
- `<noscript>` does the same, so the story survives with scripting off.
- Reveals are geometry-based, not `IntersectionObserver` — a throttled
  observer would otherwise render the whole page blank.
- All controls are real `<button>`s with text labels and `aria-pressed`.
- Escape closes the menu and the timer.
