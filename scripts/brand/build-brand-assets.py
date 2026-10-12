#!/usr/bin/env python3
"""Build the GJMSSH web brand assets from the source artwork.

Sources (kept in docs/brand/, not deployed):
  gjms-icon-source.png     square icon mark on a white background
  gjms-lockup-source.png   horizontal icon + wordmark lockup on a white background

Derivatives (written to static/, which is copied verbatim into build/):
  brand/gjms-mark.png / -dark.png          transparent icon, light- and dark-UI variants
  brand/gjms-lockup.png / -dark.png        transparent lockup, light- and dark-UI variants
  icon-512.png, icon-192.png               schema.org logo and PWA icons
  apple-touch-icon.png                     opaque 180px tile for iOS
  favicon-32.png, favicon-32-dark.png      browser tab icons per colour scheme
  favicon.ico                              legacy /favicon.ico request
  og-image.jpg                             1200x630 social sharing card

The artwork is flat vector-style colour on white, so the pipeline is:
  1. crop the white margin (with a couple of % of padding),
  2. turn white into alpha with a soft ramp and un-premultiply the remaining
     colour so edges do not carry a white fringe,
  3. build a dark-UI variant by remapping the dark navy ink to a light slate
     while keeping the cyan swoosh and the gold dot.

Usage:  python3 scripts/brand/build-brand-assets.py
"""

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'docs' / 'brand'
BRAND = ROOT / 'static' / 'brand'
STATIC = ROOT / 'static'

WHITE_SOFT = 10.0   # distance from white that is still considered background
WHITE_FULL = 55.0   # distance from white at which a pixel is fully opaque ink
INK_MAX_CHANNEL = 150   # navy ink is darker than this; cyan/gold are brighter
DARK_INK = (233, 239, 248)  # light slate used for navy ink on dark backgrounds

BRAND.mkdir(parents=True, exist_ok=True)


def crop_margin(image: Image.Image, pad_ratio: float = 0.02) -> Image.Image:
    """Crop the uniform white border, keeping a small proportional padding."""
    rgb = np.asarray(image.convert('RGB')).astype(np.int16)
    mask = rgb.min(axis=2) < 240
    ys, xs = np.where(mask)
    if not len(xs):
        return image
    pad_x = int((xs.max() - xs.min()) * pad_ratio)
    pad_y = int((ys.max() - ys.min()) * pad_ratio)
    box = (
        max(0, xs.min() - pad_x),
        max(0, ys.min() - pad_y),
        min(image.width, xs.max() + 1 + pad_x),
        min(image.height, ys.max() + 1 + pad_y),
    )
    return image.crop(box)


def white_to_alpha(image: Image.Image) -> Image.Image:
    rgb = np.asarray(image.convert('RGB')).astype(np.float32)
    distance = np.sqrt(((255.0 - rgb) ** 2).mean(axis=2))
    alpha = np.clip((distance - WHITE_SOFT) / (WHITE_FULL - WHITE_SOFT), 0.0, 1.0)

    # Un-premultiply: observed = ink * a + white * (1 - a)
    safe = np.where(alpha[:, :, None] < 0.02, 1.0, alpha[:, :, None])
    ink = np.clip((rgb - 255.0 * (1.0 - alpha[:, :, None])) / safe, 0.0, 255.0)

    out = np.dstack([ink, alpha * 255.0]).astype(np.uint8)
    return Image.fromarray(out, 'RGBA')


def to_dark_variant(image: Image.Image) -> Image.Image:
    data = np.asarray(image).astype(np.int16).copy()
    rgb, alpha = data[:, :, :3], data[:, :, 3]
    navy = (rgb.max(axis=2) < INK_MAX_CHANNEL) & (alpha > 0)
    rgb[navy] = DARK_INK
    return Image.fromarray(data.astype(np.uint8), 'RGBA')


def fit_width(image: Image.Image, width: int) -> Image.Image:
    if image.width <= width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.LANCZOS)


def fit_box(image: Image.Image, box: int) -> Image.Image:
    scale = min(box / image.width, box / image.height)
    return image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)


def save(image: Image.Image, path: Path) -> None:
    image.save(path, optimize=True)
    print(f'  {path.relative_to(ROOT)}  {image.width}x{image.height}  {path.stat().st_size / 1024:.1f} KB')


print('Brand assets')

# --- icon mark ---------------------------------------------------------------
icon = white_to_alpha(crop_margin(Image.open(SRC / 'gjms-icon-source.png')))
icon_dark = to_dark_variant(icon)
# Painted at 40–48 px, so 48/96 px files (the 512 px master is kept only for the
# schema.org logo and the app icons below).
for suffix, box in (('-1x', 48), ('', 96)):
    save(fit_box(icon, box), BRAND / f'gjms-mark{suffix}.png')
    save(fit_box(icon_dark, box), BRAND / f'gjms-mark-dark{suffix}.png')
mark = fit_box(icon, 512)
mark_dark = fit_box(icon_dark, 512)

# --- horizontal lockup -------------------------------------------------------
lockup = white_to_alpha(crop_margin(Image.open(SRC / 'gjms-lockup-source.png')))
lockup_dark = to_dark_variant(lockup)

# Emitted at the sizes the pages actually paint (192 px slot → 192/384 px files)
# instead of one 1400 px master: the header logo is on every page's critical
# path, and a 7x oversized file was the single heaviest request on the site.
for suffix, width in (('-1x', 192), ('', 384)):
    save(fit_width(lockup, width), BRAND / f'gjms-lockup{suffix}.png')
    save(fit_width(lockup_dark, width), BRAND / f'gjms-lockup-dark{suffix}.png')

# --- icons -------------------------------------------------------------------
save(fit_box(icon, 512), STATIC / 'icon-512.png')
save(fit_box(icon, 192), STATIC / 'icon-192.png')

apple = Image.new('RGB', (180, 180), 'white')
apple_mark = fit_box(icon, 132)
apple.paste(apple_mark, ((180 - apple_mark.width) // 2, (180 - apple_mark.height) // 2), apple_mark)
save(apple, STATIC / 'apple-touch-icon.png')

save(fit_box(icon, 32), STATIC / 'favicon-32.png')
save(fit_box(icon_dark, 32), STATIC / 'favicon-32-dark.png')

ico = fit_box(icon, 48)
ico.save(STATIC / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print(f'  static/favicon.ico  multi-size  {(STATIC / "favicon.ico").stat().st_size / 1024:.1f} KB')

# --- social card -------------------------------------------------------------
card = Image.new('RGB', (1200, 630), 'white')
card_lockup = fit_width(lockup, 980)
card.paste(
    card_lockup,
    ((1200 - card_lockup.width) // 2, (630 - card_lockup.height) // 2),
    card_lockup,
)
# JPEG keeps the social card small; every platform accepts it.
card.save(STATIC / 'og-image.jpg', quality=90, optimize=True, progressive=True)
print(f'  static/og-image.jpg  1200x630  {(STATIC / "og-image.jpg").stat().st_size / 1024:.1f} KB')
(STATIC / 'og-image.png').unlink(missing_ok=True)

print('done')
