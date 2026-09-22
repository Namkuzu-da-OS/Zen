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
| 05 | **The Sanctuary** | A rakeable dry garden at dawn, a meditation timer, sound, fullscreen — and **Dusk**: the garden goes to night, the stars come in over it, and *Episode 1 — Kill the Noise* (`assets/audio/KTN.mp3`, 5:36) plays. Dawn, or the end of the recording, brings the light back. |

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
assets/js/cosmos.js        the night's eleven scenes, timed to the recording
assets/images/scenes/      threshold · parable · awakening · transition (.webp + .jpg)
assets/images/cosmos/      sun · 4 planets · 3 asteroids · comet (.webp, alpha)
docs/DESIGN-SYSTEM.md      colour, type, spacing, components, decisions
docs/ART-BRIEF.md          what each scene is, how it is graded, how to replace one
docs/enso.py               regenerates the ensō brush path
docs/track-phases.py       re-derives the night's scene timings from the audio
docs/sync.html             tap-by-ear tool for the closing pulse times (see below)
backup/index-legacy.html   the previous single-file site
```

---

## Two things to know

**The four scenes are real, distinct pictures.** Each act carries its own
photograph, its own grade and its own scrim, tuned in `zen.css` under the
act's id. Each ships as WebP with a JPEG fallback via `image-set()`. To
swap one, replace both files at the same path and re-check the
`--scene-pos` / `--scene-pos-narrow` crops in `index.html`. See
`docs/ART-BRIEF.md`.

**All sound is synthesised in the browser.** The old site hotlinked five
clips from soundbible.com and every one of them is now a 404 — including
the mountain stream the whole story turns on. `assets/js/audio.js` builds
the stream from filtered noise and the temple bell from inharmonic
partials, so there is nothing left to break.

---

## Timing the night by ear

`docs/sync.html` — open it, play, press `space` where a pulse belongs,
copy the array into `TONES` in `assets/js/cosmos.js`, run `./bump.sh`.
Nothing links to it; it is a tool.

It exists because the recording's ending genuinely cannot be measured.
Spectral flux finds no discrete onsets after 5:12, envelope-swell
picking produced irregular gaps that were audibly wrong, and tempo
autocorrelation across the post-speech region reads 0.038 — noise.

The tool defaults the trim to **−200 ms** because a tap always lands
late, and it flags any interval more than 25% off the median, which is
the check that would have caught the bad automated values before
anyone had to hear them.

Worth knowing: the tapped marks came out at 2.69s apart, which is 7.99
beats at the 178.2 BPM the autocorrelation measured — two bars of 4/4.
The tempo analysis was right; only its phase was wrong. So if these
ever need redoing, the grid is real and 2 bars is the interval; it is
the offset that needs an ear.

## Accessibility

- `prefers-reduced-motion` reveals everything immediately and stops animation.
- `<noscript>` does the same, so the story survives with scripting off.
- Reveals are geometry-based, not `IntersectionObserver` — a throttled
  observer would otherwise render the whole page blank.
- All controls are real `<button>`s with text labels and `aria-pressed`.
- Escape closes the menu and the timer.
