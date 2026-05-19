#!/usr/bin/env python3
"""Process the Stitch illustration set for web use.
Knocks out the baked background to transparency, trims, resizes, optimises.
Rerunnable. Source: stitch_lemon_man_illustration_set/  ->  assets/img/"""
import os, glob
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "stitch_lemon_man_illustration_set")
OUT  = os.path.join(ROOT, "assets", "img")

# folder-name substring -> (output name, max longest-edge px)
JOBS = [
    ("lemon_man_mascot._plump",                 "lemon-man.png",      900),
    ("lemon_man_mascot_waving",                 "lemon-man-wave.png", 620),
    ("bad_hire_lemon_character",                "char-lemon.png",     660),
    ("good_hire_peach_character",               "char-peach.png",     660),
    ("five_mischievous_lemon_characters_in_1",  "rogues.png",        1600),
    ("transformation_1",                        "ripening.png",      1400),
    ("award_trophy._classic_two_1",             "trophy.png",         560),
]

def find(sub):
    for d in sorted(glob.glob(os.path.join(SRC, "*"))):
        if sub in os.path.basename(d):
            p = os.path.join(d, "screen.png")
            if os.path.exists(p):
                return p
    return None

def knockout(img, thresh=150):
    """Flood-fill the background to transparent, seeded from the edges."""
    img = img.convert("RGBA")
    w, h = img.size
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1),
             (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2),
             (w // 4, 0), (3 * w // 4, 0), (w // 4, h - 1), (3 * w // 4, h - 1)]
    for s in seeds:
        try:
            ImageDraw.floodfill(img, s, (0, 0, 0, 0), thresh=thresh)
        except Exception:
            pass
    return img

for sub, out, maxdim in JOBS:
    src = find(sub)
    if not src:
        print("MISSING:", sub)
        continue
    img = Image.open(src)
    osz = img.size
    img = knockout(img)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    if max(img.size) > maxdim:
        r = maxdim / max(img.size)
        img = img.resize((round(img.size[0] * r), round(img.size[1] * r)), Image.LANCZOS)
    img.save(os.path.join(OUT, out), optimize=True)
    print(f"{out:22s} {osz} -> {img.size}")
