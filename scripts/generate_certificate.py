#!/usr/bin/env python3
"""Generate a QDW completion certificate from the certificate template."""

from __future__ import annotations

import argparse
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


TEXT_COLOR = (214, 151, 86)
NAME_CENTER_X_RATIO = 0.5
NAME_CENTER_Y_RATIO = 0.475
NAME_MAX_WIDTH_RATIO = 0.44
BASE_FONT_SIZE_RATIO = 0.075
MIN_FONT_SIZE_RATIO = 0.035


def font_candidates() -> list[Path]:
    candidates: list[Path] = []
    env_font = os.environ.get("QDW_CERTIFICATE_FONT")
    if env_font:
        candidates.append(Path(env_font))

    candidates.extend(
        [
            Path("public/fonts/GreatVibes-Regular.ttf"),
            Path("public/fonts/Allura-Regular.ttf"),
            Path("C:/Windows/Fonts/Edwardian.ttf"),
            Path("C:/Windows/Fonts/BRUSHSCI.TTF"),
            Path("C:/Windows/Fonts/SCRIPTBL.TTF"),
            Path("C:/Windows/Fonts/segoesc.ttf"),
            Path("/System/Library/Fonts/Supplemental/Snell Roundhand.ttc"),
            Path("/System/Library/Fonts/Supplemental/Apple Chancery.ttf"),
            Path("/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf"),
            Path("/usr/share/fonts/truetype/liberation2/LiberationSerif-Italic.ttf"),
        ]
    )
    return candidates


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in font_candidates():
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)

    for font_name in ("DejaVuSerif-Italic.ttf", "LiberationSerif-Italic.ttf"):
        try:
            return ImageFont.truetype(font_name, size=size)
        except OSError:
            continue

    return ImageFont.load_default()


def text_size(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int]:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    return right - left, bottom - top


def fitted_font(draw: ImageDraw.ImageDraw, name: str, image_width: int) -> ImageFont.ImageFont:
    max_width = int(image_width * NAME_MAX_WIDTH_RATIO)
    font_size = int(image_width * BASE_FONT_SIZE_RATIO)
    min_size = int(image_width * MIN_FONT_SIZE_RATIO)

    while font_size > min_size:
        font = load_font(font_size)
        width, _ = text_size(draw, name, font)
        if width <= max_width:
            return font
        font_size -= 4

    return load_font(min_size)


def generate_certificate(name: str, template_path: Path, output_path: Path) -> None:
    clean_name = " ".join(name.split())
    if not clean_name:
        raise ValueError("Name is required")

    if not template_path.exists():
        raise FileNotFoundError(f"Certificate template not found: {template_path}")

    image = Image.open(template_path).convert("RGBA")
    draw = ImageDraw.Draw(image)
    font = fitted_font(draw, clean_name, image.width)
    width, height = text_size(draw, clean_name, font)

    center_x = image.width * NAME_CENTER_X_RATIO
    center_y = image.height * NAME_CENTER_Y_RATIO
    position = (center_x - width / 2, center_y - height / 2)

    draw.text(position, clean_name, fill=TEXT_COLOR, font=font)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output_path, "PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate a personalized QDW certificate PNG.")
    parser.add_argument("--name", required=True, help="Name to place on the certificate")
    parser.add_argument("--template", default="example_certificate.png", help="Path to the blank certificate PNG")
    parser.add_argument("--output", required=True, help="Path where the generated PNG should be written")
    args = parser.parse_args()

    generate_certificate(args.name, Path(args.template), Path(args.output))


if __name__ == "__main__":
    main()