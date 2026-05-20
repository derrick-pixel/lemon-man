#!/usr/bin/env python3
"""Process Stitch set V3. Knockout for characters, keep cream for the
backdrop. Saves as .webp to match the rest of assets/img/. Rerunnable.
Source: 'stitch_lemon_man_illustration_set V3/' -> assets/img/"""
import os, glob
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = os.path.join(ROOT, "stitch_lemon_man_illustration_set V3")
OUT  = os.path.join(ROOT, "assets", "img")

def find(sub):
    for d in sorted(glob.glob(os.path.join(SRC, "*"))):
        if sub in os.path.basename(d):
            p = os.path.join(d, "screen.png")
            if os.path.exists(p):
                return p
    return None

def knockout(img, thresh=170):
    img = img.convert("RGBA")
    w, h = img.size
    seeds = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1),
             (w//2, 0), (w//2, h-1), (0, h//2), (w-1, h//2),
             (w//4, 0), (3*w//4, 0), (w//4, h-1), (3*w//4, h-1)]
    for s in seeds:
        try: ImageDraw.floodfill(img, s, (0, 0, 0, 0), thresh=thresh)
        except Exception: pass
    return img

def save_webp(img, name, maxdim, lossless=True, quality=88):
    if max(img.size) > maxdim:
        r = maxdim / max(img.size)
        img = img.resize((round(img.size[0]*r), round(img.size[1]*r)), Image.LANCZOS)
    p = os.path.join(OUT, name)
    img.save(p, "WEBP", lossless=lossless, quality=quality, method=6)
    print(f"  {name:22s} {img.size}")

# --- Characters: knockout + save webp -------------------------
CHARS = [
    # (slot match key,                                                   output,                maxdim)
    ("lemon_man_mascot_plump_lemon_yellow",                              "lemon-clipboard.webp", 620),
    ("lemon_man_mascot_holding_up_a",                                    "lemon-phone.webp",     620),
    ("lemon_man_mascot_hugging_a_thick",                                 "lemon-dossier.webp",   620),
    ("the_lemon_token_a_chunky_round_gold",                              "lemon-token.webp",     500),
    ("a_neat_stack_of_blank_paper_folders",                              "records.webp",         500),
    ("a_small_lemon_character_standing_on",                              "lost-lemon.webp",      560),
    ("a_perfectly_level_two_pan_balance",                                "balance.webp",        1100),
]
print("characters:")
for sub, name, md in CHARS:
    src = find(sub)
    if not src: print("  MISSING:", sub); continue
    img = knockout(Image.open(src), 175 if "a_perfectly_level" in sub else 170)
    bb = img.getbbox()
    if bb: img = img.crop(bb)
    save_webp(img, name, md)

# --- Backdrop: keep cream, save webp --------------------------
print("backdrop:")
src = find("c1_soft_kampong_street_backdrop")
if src:
    img = Image.open(src).convert("RGB")
    # the shophouses sit in the bottom half; crop to a wider strip
    w, h = img.size
    img = img.crop((0, h - 540, w, h))
    save_webp(img, "kampong-bg.webp", 1600, lossless=False, quality=85)
else:
    print("  MISSING kampong backdrop")
print("done")
