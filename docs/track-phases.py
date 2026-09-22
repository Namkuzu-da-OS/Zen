#!/usr/bin/env python3
"""
Re-derive the night's scene timeline from the recording itself.

The scene boundaries in assets/js/cosmos.js are not guesses. They come
from two independent passes over assets/audio/KTN.mp3:

  1. a novelty curve over the waveform  -> where the audio changes
  2. a Whisper transcript with timings  -> what is being said, and when

They agreed, which is the only reason either is trusted. If the audio is
ever replaced, run this and re-check SCENES against the output.

Usage
-----
    python docs/track-phases.py                    # waveform only
    python docs/track-phases.py --transcribe       # both passes

Requires ffmpeg, numpy and scipy. --transcribe also needs an
OpenAI-compatible speech-to-text endpoint; ours is the `bigpic-whisper`
container (speaches) on Atlas:

    --stt http://192.168.10.52:8910/v1/audio/transcriptions

Note the large model needs ~2 GB of free VRAM. If Ollama has the cards
full it will return HTTP 500 (CUDA out of memory) and you should pass
--model Systran/faster-whisper-tiny.en, which is plenty for clear
spoken narration.
"""

import argparse
import json
import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy.ndimage import uniform_filter1d
from scipy.signal import find_peaks

HERE = os.path.dirname(os.path.abspath(__file__))
MP3 = os.path.join(HERE, os.pardir, "assets", "audio", "KTN.mp3")

FRAME = 0.25          # seconds per analysis frame
SMOOTH = 9            # frames (~2.2 s)
WINDOW = 8.0          # seconds compared either side of a candidate
MIN_GAP = 18.0        # seconds between accepted boundaries


def decode(mp3, sr=22050):
    """mp3 -> mono float32 numpy array, via ffmpeg."""
    wav = os.path.join(tempfile.gettempdir(), "ktn-analysis.wav")
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", mp3, "-ac", "1", "-ar", str(sr), wav],
        check=True,
    )
    import soundfile as sf
    y, got = sf.read(wav)
    os.unlink(wav)
    return y, got


def novelty(y, sr):
    """Where does the character of the audio change?"""
    hop = int(sr * FRAME)
    n = len(y) // hop
    frames = y[: n * hop].reshape(n, hop)

    rms = np.sqrt((frames ** 2).mean(1)) + 1e-9
    spec = np.abs(np.fft.rfft(frames * np.hanning(hop), axis=1))
    fq = np.fft.rfftfreq(hop, 1 / sr)
    total = spec.sum(1) + 1e-9

    feats = np.vstack([
        np.log(rms),                        # loudness
        (spec * fq).sum(1) / total,         # spectral centroid (brightness)
        spec[:, fq < 250].sum(1) / total,   # low band share
        spec[:, fq > 3000].sum(1) / total,  # high band share
    ])
    feats = (feats - feats.mean(1, keepdims=True)) / (feats.std(1, keepdims=True) + 1e-9)
    feats = uniform_filter1d(feats, SMOOTH, axis=1)

    w = int(WINDOW / FRAME)
    m = feats.shape[1]
    nov = np.zeros(m)
    for i in range(w, m - w):
        nov[i] = np.linalg.norm(feats[:, i:i + w].mean(1) - feats[:, i - w:i].mean(1))
    return uniform_filter1d(nov, 5), feats


def clock(t):
    return f"{int(t // 60)}:{int(t % 60):02d}"


def transcribe(mp3, endpoint, model):
    """Post the file to an OpenAI-compatible /audio/transcriptions."""
    import urllib.request
    import uuid

    boundary = uuid.uuid4().hex
    with open(mp3, "rb") as fh:
        audio = fh.read()

    parts = []
    for key, val in (("model", model), ("response_format", "verbose_json"), ("language", "en")):
        parts.append(
            f"--{boundary}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{val}\r\n".encode()
        )
    parts.append(
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; "
        f"filename=\"{os.path.basename(mp3)}\"\r\nContent-Type: audio/mpeg\r\n\r\n".encode()
    )
    parts.append(audio)
    parts.append(f"\r\n--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        endpoint,
        data=b"".join(parts),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    with urllib.request.urlopen(req, timeout=600) as resp:
        return json.load(resp)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mp3", default=os.path.normpath(MP3))
    ap.add_argument("--transcribe", action="store_true")
    ap.add_argument("--stt", default="http://192.168.10.52:8910/v1/audio/transcriptions")
    ap.add_argument("--model", default="Systran/faster-whisper-tiny.en")
    ap.add_argument("--max", type=int, default=8, help="boundaries to report")
    args = ap.parse_args()

    if not os.path.exists(args.mp3):
        sys.exit(f"no audio at {args.mp3}")

    y, sr = decode(args.mp3)
    dur = len(y) / sr
    print(f"{os.path.basename(args.mp3)}  {clock(dur)}  ({dur:.1f}s)\n")

    nov, feats = novelty(y, sr)

    # The outro fade is such a large change that it swamps the
    # normalisation and hides every interior boundary. Find it
    # separately, then analyse the body of the track on its own.
    tail = int(322 / FRAME)
    body = nov[:tail]
    w = int(WINDOW / FRAME)
    peaks, _ = find_peaks(body, distance=int(MIN_GAP / FRAME),
                          height=body[w:tail - w].mean())
    peaks = sorted(sorted(peaks, key=lambda i: -body[i])[: args.max])

    print("WAVEFORM BOUNDARIES")
    for i in peaks:
        t = i * FRAME
        print(f"  {clock(t):>5}  ({t:6.1f}s)   strength {body[i] / body[peaks].max():.2f}")
    outro = int(np.argmax(nov[tail:])) + tail
    print(f"  {clock(outro * FRAME):>5}  ({outro * FRAME:6.1f}s)   the outro fade\n")

    if not args.transcribe:
        print("(run with --transcribe to cross-check against the narration)")
        return

    print(f"TRANSCRIBING via {args.stt}\n  model {args.model}")
    try:
        data = transcribe(args.mp3, args.stt, args.model)
    except Exception as exc:                                  # noqa: BLE001
        sys.exit(f"\ntranscription failed: {exc}\n"
                 "If this is CUDA out of memory, the GPUs are busy — "
                 "pass --model Systran/faster-whisper-tiny.en")

    segs = data.get("segments") or []
    words = len((data.get("text") or "").split())
    print(f"  {len(segs)} segments, {words} words\n")

    print("NARRATION, and the silences he leaves for practice")
    prev = 0.0
    for s in segs:
        gap = s["start"] - prev
        if gap > 3:
            print(f"  {clock(prev):>5} -> {clock(s['start']):<5}  SILENCE {gap:.0f}s")
        print(f"  {clock(s['start']):>5}  {s['text'].strip()[:86]}")
        prev = s["end"]

    print("\nCompare the two lists. Where they agree, that is a real boundary "
          "and belongs in SCENES in assets/js/cosmos.js.")


if __name__ == "__main__":
    main()
