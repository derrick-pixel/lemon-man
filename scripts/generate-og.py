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
ZEST = (227, 164, 0)
ZEST2 = (255, 210, 60)
SOUR = (168, 106, 0)

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

# citrus mark, right side — a filled lemon
cx, cy, r = 1000, 290, 138
d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ZEST, outline=INK, width=5)
for i in range(6):
    a = math.radians(i * 60 - 90)
    d.line([cx, cy, cx + (r - 20) * math.cos(a), cy + (r - 20) * math.sin(a)],
           fill=INK, width=5)
d.ellipse([cx - 15, cy - 15, cx + 15, cy + 15], fill=INK)

# kicker
d.text((90, 150), "THE CANDIDATE LEMON PLATFORM", font=font(MONO, 24), fill=SOUR)

# wordmark
d.text((88, 206), "Lemon Man", font=font(SERIF, 116), fill=INK)

# rule
d.line([92, 380, 470, 380], fill=(214, 202, 163), width=3)

# tagline (two lines)
tag = font(SERIF, 52)
d.text((90, 404), "Stop hiring", font=tag, fill=INK)
d.text((90, 466), "lemons.", font=tag, fill=SOUR)

# footer mark
d.text((90, 552), "Singapore  ·  concept-stage venture", font=font(MONO, 22), fill=INK3)

img.save(OUT, "PNG")
print("wrote", OUT)
