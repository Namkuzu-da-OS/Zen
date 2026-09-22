# Zen — Art Brief

**Status: the four scenes are in.** Each act now carries its own
generated photograph, and the placeholder crops of `mountain-path.jpg`
are gone. This document records what each picture is, how the page
grades it, and what to do if one is ever replaced.

---

## The scenes

Every scene lives in `assets/images/scenes/` twice: a WebP (served to
browsers that can negotiate formats) and a JPEG (the floor). The section
in `index.html` names both:

```html
style="--scene-webp: url('/assets/images/scenes/awakening.webp');
       --scene-jpg:  url('/assets/images/scenes/awakening.jpg');
       --scene-pos: 50% 34%;          /* desktop crop */
       --scene-pos-narrow: 46% 50%;"  /* phone crop  */
```

| File | Native size | Act | What it is | Where the copy sits |
|---|---|---|---|---|
| `threshold` | 1672×941 | 01 | Dawn over layered misty ridges, cedar forest falling into fog, a rock trail at bottom-left, the sun just breaking the far ridge top-right. | Left, in the shade of the near ridge. The three-ring halo hangs over the sun. |
| `parable` | 1122×1402 (portrait) | 02 | A robed monk in a straw hat on a rock outcrop, seen from behind, looking over a mist-filled gorge; a waterfall and a small temple far below. | It is the left edge of the parable on desktop and the banner on a phone; its fog dissolves into the paper via a mask. |
| `awakening` | 1145×1374 (portrait) | 03 | A mountain stream over dark wet stones, white water, shafts of light through the canopy. | The question and the beats sit on the mossy boulder at left; the water on the right is left alone. |
| `transition` | 1672×941 | 04 | One dark mountain in heavy mist, a nearly empty pale sky. | Copy in the shade at left; the ensō in ink on the sky, with the peak just breaking the ring. |

| `night` | 1672×941 | 05 | An opaque cosmic plate — a sapphire-and-indigo nebula sweeping diagonally through a dense starfield, no horizon, no landscape. It is the destination Dusk arrives at, not a sky laid over the garden. | Primed (not painted) well before the visitor can reach Dusk — an `IntersectionObserver` on `#sanctuary` sets the custom properties that start the fetch, so the click never waits on it. The crop keeps the diagonal nebula in frame with calm dark space held clear of the player on desktop (`--scene-pos`) and a deliberate portrait crop on a phone (`--scene-pos-narrow`). |

The sanctuary (05) otherwise needs no image for the garden itself — the
raked-sand canvas is live. The night plate is composited with a handful
of cheap CSS layers (`.night-veil`, `.night-stars`, `.night-plate`,
`.night-nebula`, `.night-haze`) that only animate `transform` and
`opacity`, so the ambient drift stays inexpensive; see
`docs/DESIGN-SYSTEM.md` for how the Dusk sequence stages them.

`night-source.png` alongside the production files is the untouched
generated plate, kept for reference and future re-encodes — not
referenced by the page.

The generated originals for the four daylight scenes are kept outside
the repository; the files here are the production encodes (JPEG q90
progressive, WebP q88). The night plate's encodes are JPEG q88 and
WebP q82 — it is a continuous-tone field with nothing worth spending
extra bits sharpening.

---

## How the page grades them

Grading is **per scene**, set in `assets/css/zen.css` under each act's
id, not inline:

```css
#threshold  { --scene-sat: .86; --scene-light: .8;  --scene-contrast: 1.03; --scrim: …; }
#awakening  { --scene-sat: .62; --scene-light: .58; }          /* on arrival   */
#awakening.is-in { --scene-sat: .96; --scene-light: 1; }        /* once reached */
#transition { --scene-sat: .7;  --scene-light: .82; }
```

`--scrim` is the shade laid over the picture. It is directional — it
darkens where the type sits and nowhere else — and each act has a
desktop and a phone version.

The awakening is the one act that changes state: it arrives dim and
slowly drifting and clears as the visitor reaches it (`[data-wake]` in
the markup, `.is-in` from the reveal sweep). It has to read as
perceptibly clearer and more alive than the threshold.

---

## Replacing a scene

1. Drop the new picture at the same two paths, same names, both formats.
2. Run `./bump.sh`.
3. Re-check the two crops on the section (`--scene-pos`, `--scene-pos-narrow`)
   at 1440×1000 and 390×844.
4. If the light has moved, retune that act's `--scene-*` and `--scrim`
   in the stylesheet. The rule that decides everything: the copy sits on
   the darkest usable part of the picture and the scrim only covers that.

Direction for any new picture stays as it was: deep charcoal, blue-black,
muted green, soft ivory, one restrained warm gold in the light at most.
Low directional light, mist, patience. No neon, no HDR, no lens flare,
no faces, no text.

---

---

## The cosmos (the night's visual)

`assets/images/cosmos/` holds the solar system that plays behind the
recording in the Sanctuary's night mode. Nine bodies, WebP with real
alpha, **452 KB for the whole set** — and only fetched if a visitor
actually presses Dusk.

| File | Native | What it is |
|---|---|---|
| `sun.webp` | 768x768 | The anchor. Warm gold, soft corona. |
| `planet-gasgiant.webp` | 512x512 | Ringed, muted ochre |
| `planet-ice.webp` | 512x512 | Pale blue-grey, cloud banding |
| `planet-indigo.webp` | 512x512 | Nearly silhouette, bright rim |
| `planet-moon.webp` | 512x512 | Small, grey-brown, cratered |
| `debris-01..03.webp` | 256x256 | Three asteroid shapes |
| `comet.webp` | 512x512 | Faint diffuse tail |

All lit from the same side, because they share one sun.

### Why these exist

This is not decoration. Around 2:27 the narration names the image
outright — the speaker describes himself as the sun at the centre of
his solar system, with every distraction just a planet, an asteroid or
a comet spinning around him, then asks the listener to see their own
distractions the same way. The visual is that instruction, on his
timing. `assets/js/cosmos.js` holds the eleven scenes.

### Replacing one

Drop a WebP at the same path and run `./bump.sh`. Two rules the code
depends on:

1. **True alpha, no baked background.** A flattened body composites over
   the nebula as a visible square. Check before you trust it:
   `Image.open(f).getchannel('A').getextrema()` and confirm the corners
   are 0.
2. **Centred, with margin.** The sun is scaled by `SUN_SIZE` and its
   corona must not clip.

If a file is missing the loader tries `.png`, then draws a plain
procedural body — the night degrades, it never breaks.

### One constraint worth keeping

Every orbit radius must keep its body **outside** the sun's disc. The
sun draws `unit * SUN_SIZE` wide, an orbit radius is `unit * 0.5 * r`,
so the smallest `r` has to exceed `SUN_SIZE`. The first pass had the
moon orbiting inside the sun.

### And one rendering rule

Bloom, corona, sun, bodies and debris are drawn **fresh every frame**
onto the visible canvas; only the field's wake lives on a second,
never-cleared layer. Additive fills against a 5% decay saturate within
a second — that is what exposed a hard `fillRect` edge and the
gradient's dither grid as a box around the sun. Keep the two layers
separate, and fill circles rather than rectangles for anything bright.

---

## Also worth removing

`assets/images/Future.JPEG`, `cosmic.jpg` and `mountain-path.jpg` are
left over from the old site and are **no longer referenced**. They can be
deleted once you're happy nothing else wants them.
