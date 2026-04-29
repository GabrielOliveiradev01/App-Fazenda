#!/usr/bin/env python3
"""
Remove light / white / beige backgrounds from amenity icons (PNG).
Targets files in icones-png/ used by index.html.
"""
from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
PNG_DIR = ROOT / "icones-png"


def is_background(r: int, g: int, b: int) -> bool:
    """True for pixels that should become transparent (paper / white / beige)."""
    mx, mn = max(r, g, b), min(r, g, b)
    chroma = mx - mn
    avg = (r + g + b) / 3.0

    # Near-white (exports and anti-aliased white fringes)
    if r >= 248 and g >= 248 and b >= 248:
        return True
    if avg >= 242 and chroma <= 18:
        return True

    # Very light neutral grays (leftover matting)
    if avg >= 228 and chroma <= 22:
        return True

    # Bege / crema (#CFC7B2, #E8E4DC, etc.)
    if avg >= 155 and chroma <= 60:
        if r >= 165 and g >= 155 and b >= 120:
            if (r - b) >= 6 or (g - b) >= 6:
                return True
        if 168 <= r <= 245 and 158 <= g <= 240 and 118 <= b <= 228:
            if abs(r - g) < 50:
                return True

    return False


def process_image(path: Path) -> tuple[int, int]:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    removed = 0
    total = w * h
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if is_background(r, g, b):
                px[x, y] = (r, g, b, 0)
                removed += 1
    im.save(path, optimize=True)
    return removed, total


def main() -> None:
    if not PNG_DIR.is_dir():
        print(f"Missing folder: {PNG_DIR}", file=sys.stderr)
        sys.exit(1)
    paths = sorted(PNG_DIR.glob("*.png"))
    if not paths:
        print(f"No PNG files in {PNG_DIR}", file=sys.stderr)
        sys.exit(1)
    for path in paths:
        removed, total = process_image(path)
        pct = 100.0 * removed / total if total else 0
        print(f"{path.name}: {removed}/{total} px transparent ({pct:.1f}%)")


if __name__ == "__main__":
    main()
