#!/usr/bin/env python3
"""Generate the 1200x630 Open Graph card for Lemon Man.
Rerunnable. Output: assets/img/og-image.png"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img", "og-image.png")

W, H = 1200, 630
PAPER = (245, 239, 223)
PAPER2 = (237, 227, 201)
INK = (31, 28, 20)
INK3 = (107, 100, 80)
ZEST = (217, 152, 0)
ZEST2 = (243, 198, 63)

def font(paths, size):
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                pass
    return ImageFont.load_default()

SERIF = ["/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
         "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
         "/Library/Fonts/Georgia.ttf"]
SERIF_R = ["/System/Library/Fonts/Supplemental/Georgia.ttf",
           "/System/Library/Fonts/Supplemental/Times New Roman.ttf"]
MONO = ["/System/Library/Fonts/Menlo.ttc",
        "/System/Library/Fonts/Courier.dfont"]

img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

# subtle deeper band along the bottom
d.rectangle([0, H - 8, W, H], fill=ZEST)

# citrus mark, right side
cx, cy, r = 1000, 285, 132
d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=ZEST, width=7)
d.ellipse([cx - r + 30, cy - r + 30, cx + r - 30, cy + r - 30], outline=ZEST, width=3)
for i in range(6):
    a = math.radians(i * 60 - 90)
    d.line([cx, cy, cx + (r - 18) * math.cos(a), cy + (r - 18) * math.sin(a)],
           fill=ZEST, width=4)
d.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], fill=ZEST2)

# kicker
d.text((90, 150), "WORKFORCE RELIABILITY NETWORK", font=font(MONO, 24), fill=ZEST)

# wordmark
d.text((88, 206), "Lemon Man", font=font(SERIF, 116), fill=INK)

# rule
d.line([92, 380, 470, 380], fill=(214, 202, 163), width=2)

# tagline (two lines)
tag = font(SERIF_R, 36)
d.text((90, 408), "A credit bureau for", font=tag, fill=INK3)
d.text((90, 452), "workplace conduct.", font=tag, fill=INK3)

# footer mark
d.text((90, 540), "Singapore  ·  concept-stage venture", font=font(MONO, 22), fill=INK3)

img.save(OUT, "PNG")
print("wrote", OUT)
