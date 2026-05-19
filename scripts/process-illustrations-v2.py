#!/usr/bin/env python3
"""Process Stitch set V2. Characters: knock background out to transparency.
Backgrounds: crop to the intended wide aspect ratio. Rerunnable.
Source: 'stitch_lemon_man_illustration_set V2/'  ->  assets/img/"""
import os, glob
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "stitch_lemon_man_illustration_set V2")
OUT  = os.path.join(ROOT, "assets", "img")

def find(sub):
    for d in sorted(glob.glob(os.path.join(SRC, "*"))):
        if sub in os.path.basename(d):
            p = os.path.join(d, "screen.png")
            if os.path.exists(p):
                return p
    return None

def knockout(img, thresh=150):
    img = img.convert("RGBA")
    w, h = img.size
    seeds = [(0,0),(w-1,0),(0,h-1),(w-1,h-1),(w//2,0),(w//2,h-1),(0,h//2),(w-1,h//2),
             (w//4,0),(3*w//4,0),(w//4,h-1),(3*w//4,h-1)]
    for s in seeds:
        try: ImageDraw.floodfill(img, s, (0,0,0,0), thresh=thresh)
        except Exception: pass
    return img

def save(img, name, maxdim):
    if max(img.size) > maxdim:
        r = maxdim / max(img.size)
        img = img.resize((round(img.size[0]*r), round(img.size[1]*r)), Image.LANCZOS)
    img.save(os.path.join(OUT, name), optimize=True)
    print(f"  {name:22s} {img.size}")

# --- Characters: knock out background ---
CHARS = [
    ("trio._modern_flat_vector_cartoon_illustration._three_3", "peach-workers.png", 1500),
    ("a2_lemon_man_the_fair_mediator", "mediator.png", 1100),   # picks _1; refined below
    ("a3_a_lemon_having_its_say",      "lemon-says.png",  620),
    ("a4_a_peach_celebrating",         "peach-cheer.png", 640),
    ("a5_the_good_hire_handshake",     "handshake.png",  1100),
    ("a6_lemon_man_gives_the_all_clear","lemon-man-clear.png", 640),
]
# explicit variant picks
PICK = {
    "mediator.png":  "a2_lemon_man_the_fair_mediator._modern_flat_vector_cartoon_illustration_of_the_2",
    "handshake.png": "a5_the_good_hire_handshake._modern_flat_vector_cartoon_illustration_of_the_1",
}
print("characters:")
for sub, name, maxd in CHARS:
    src = os.path.join(SRC, PICK[name], "screen.png") if name in PICK else find(sub)
    if not src or not os.path.exists(src):
        print("  MISSING", name); continue
    img = knockout(Image.open(src), 205 if name == "mediator.png" else 150)
    bb = img.getbbox()
    if bb: img = img.crop(bb)
    save(img, name, maxd)

# --- Backgrounds: crop to intended aspect, keep the cream (these are scenes) ---
print("backgrounds:")
# b1 grove -> keep the bottom strip (trees + sky), aim ~2.2:1
b1 = Image.open(os.path.join(SRC,
    "b1_soft_lemon_grove_backdrop._very_wide_aspect_ratio_illustration_of_a_gentle",
    "screen.png")).convert("RGB")
w, h = b1.size
b1 = b1.crop((0, h - 612, w, h))
save(b1, "grove-bg.png", 1600)

# b2 band -> auto-detect content rows by difference from the cream, crop to that band
b2 = Image.open(os.path.join(SRC,
    "b2_decorative_section_band._very_wide_panoramic_horizontal_strip_5_1_rendered",
    "screen.png")).convert("RGB")
w, h = b2.size
px = b2.load()
cr = px[4, 4]
def cdiff(p): return abs(p[0]-cr[0]) + abs(p[1]-cr[1]) + abs(p[2]-cr[2])
rows = [y for y in range(h) if any(cdiff(px[x, y]) > 42 for x in range(0, w, 3))]
top = max(0, min(rows) - 30); bot = min(h, max(rows) + 30)
b2 = b2.crop((0, top, w, bot))
save(b2, "band-bg.png", 1600)

# b3 confetti -> keep the cream; used as a full section background panel
b3 = Image.open(os.path.join(SRC,
    "b3_citrus_confetti_panel._square_1_1_pattern_of_scattered_tiny_citrus_motifs",
    "screen.png")).convert("RGB")
save(b3, "confetti.png", 900)

print("done")
