# Zen — Art Brief

**Status: the site is built and the art is placeholder.**

Every scene in `assets/images/scenes/` is currently a re-crop and regrade
of the single original `mountain-path.jpg` (1024×768). Four different
crops, four different grades — it does not read as the same photo four
times, but it is one photo four times, and the awakening in particular is
carrying a distant stream where the reference calls for water filling the
frame.

**Nothing in the code has to change to fix this.** Drop a new file at the
same path, same name, and it's done. Then run `./bump.sh`.

---

## What to produce

Four images. Sizes are minimums — the threshold is full-bleed on a
desktop, so it is the one that most needs real resolution.

| File | Size | Act | Subject |
|---|---|---|---|
| `threshold.jpg` | 2560×1440 | 01 | Misty mountain ridges at dawn, layered conifer forest falling away below, a faint trail. Cinematic, vast, cold. Sun barely breaking the far ridge. |
| `parable.jpg` | 1400×1900 (portrait) | 02 | A lone robed monk in a straw hat standing on a rock outcrop, seen from behind or in silhouette, looking out over a misty valley. Pines, stone, a small temple far below. |
| `awakening.jpg` | 2200×1600 | 03 | A mountain stream over dark wet stones, water breaking white, shafts of light through forest canopy above. The water should fill the frame. |
| `transition.jpg` | 2560×1340 | 04 | A single dark mountain silhouette in heavy mist, sky above it nearly empty. Deliberately quiet — the ensō sits on top of this, so the centre must stay uncluttered. |

The sanctuary (05) needs **no image** — the raked-sand garden is a live
canvas.

---

## Direction

Match the reference board:

- **Palette** — deep charcoal, blue-black, muted green, soft ivory. A
  single restrained warm gold at most, in the light.
- **Mood** — ancient insight meeting future vision. Cinematic, patient,
  spacious. It should make someone slow down.
- **Light** — low, directional, misty. Dawn or late dusk.
- **Not** — neon, HDR, bright saturated greens, lens flare, wellness-app
  softness, occult symbolism, visible people's faces, any text.

Shoot wide and leave negative space. The page grades each image down
(`brightness ~.56`) and lays type over the centre, so deliver something
that is **already fairly dark and low-contrast** rather than punchy —
punchy material turns muddy under the scrim.

---

## Suggested prompts

> **threshold** — Cinematic dawn over layered misty mountain ridges,
> dense conifer forest falling into fog, faint trail on the near slope,
> muted blue-green and charcoal palette, soft directional light just
> breaking the far ridge, vast and silent, low contrast, photographic,
> no people, no text.

> **parable** — A lone monk in a dark robe and straw hat standing on a
> rock outcrop seen from behind, looking out over a mist-filled valley,
> pines and grey stone, a small temple far below, muted desaturated
> palette, soft overcast light, contemplative and still, photographic,
> vertical composition, no text.

> **awakening** — A clear mountain stream running over dark wet stones,
> white water breaking around rocks, shafts of soft light through a forest
> canopy above, deep green and charcoal, mist in the air, close and
> immersive, photographic, no people, no text.

> **transition** — A single dark mountain silhouette in heavy mist, nearly
> empty pale sky above, minimal, enormous negative space in the upper
> centre, muted blue-grey monochrome, quiet and meditative, photographic,
> no text.

---

## After dropping the files in

```bash
cd Zen
./bump.sh          # moves css/js/module versions together
```

Then check each act and re-tune two knobs if needed — both are per-section
and live in `index.html`, no CSS edit required:

```html
--scene-pos:   center 42%   /* which part of the frame is on screen */
--scene-light: .8           /* per-act brightness; default .56       */
```

---

## Also worth regenerating

`assets/images/Future.JPEG` and `cosmic.jpg` are left over from the old
site and are **no longer referenced**. They can be deleted once you're
happy nothing else wants them.
