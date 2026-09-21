import math, random
random.seed(7)

# A brush enso: a ring with a gap, thick where the brush lands,
# tapering to nothing where it lifts. Built as a filled outline
# (outer edge out, inner edge back) so stroke width can vary.
CX = CY = 100.0
R   = 74.0
START = math.radians(-58)    # brush lands upper-right
SWEEP = math.radians(322)    # not quite closed -> the gap
N   = 180

def width_at(t):
    # t in 0..1 along the stroke
    # land heavy, swell through the belly, lift to a fine tail
    entry = min(1.0, t / 0.05) ** 0.6           # quick bite on landing
    exit_ = min(1.0, (1.0 - t) / 0.30) ** 1.55  # long taper on lift
    belly = 0.72 + 0.46 * math.sin(math.pi * min(1.0, t * 1.08))
    return 9.2 * entry * exit_ * belly

def wobble(t):
    # the hand is not a compass
    return (1.9 * math.sin(t * 7.3 + 1.1)
            + 1.15 * math.sin(t * 15.7 + 4.2)
            + 0.55 * math.sin(t * 29.1 + 2.7))

outer, inner = [], []
for i in range(N + 1):
    t = i / N
    a = START + SWEEP * t
    r = R + wobble(t)
    w = width_at(t) * 0.5
    ca, sa = math.cos(a), math.sin(a)
    outer.append((CX + ca * (r + w), CY + sa * (r + w)))
    inner.append((CX + ca * (r - w), CY + sa * (r - w)))

def path(pts):
    return " ".join(f"{x:.2f},{y:.2f}" for x, y in pts)

d = "M" + path(outer) + " L" + path(list(reversed(inner))) + " Z"
d = d.replace(" ", " L", 1) if False else d
# polyline -> explicit L commands
def fmt(pts):
    out = []
    for j, (x, y) in enumerate(pts):
        out.append(("M" if j == 0 else "L") + f"{x:.1f} {y:.1f}")
    return "".join(out)

d = fmt(outer) + fmt(list(reversed(inner)))[0:] .replace("M", "L", 1) + "Z"
print(len(d))
open("enso-path.txt", "w").write(d)
