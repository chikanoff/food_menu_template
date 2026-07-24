"""Media processing: ffmpeg transcode for videos, Pillow recompress for images.

Every uploaded video becomes three artifacts:
- full:    H.264 <=1280px, CRF 23, faststart — dish detail page
- preview: H.264 <=720px, 24fps, no audio, CRF 28, <=10s — looping card preview
- poster:  webp frame <=900px — instant LCP-friendly cover

If ffmpeg/Pillow are unavailable the original file is kept as-is, so local
dev without system deps still works (just without optimization).
"""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

FFMPEG = shutil.which("ffmpeg")
FFPROBE = shutil.which("ffprobe")

FULL_MAX_DIM = 1280
PREVIEW_MAX_DIM = 720
POSTER_MAX_DIM = 900
PREVIEW_MAX_SECONDS = 10
IMAGE_MAX_DIM = 1600
IMAGE_WEBP_QUALITY = 82


@dataclass
class ProcessedVideo:
    full: Path
    preview: Path | None
    poster: Path | None


def ffmpeg_available() -> bool:
    return bool(FFMPEG and FFPROBE)


def _run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True, timeout=600)


def _probe(src: Path) -> tuple[int, int, float]:
    """Return (width, height, duration_seconds)."""
    out = subprocess.run(
        [
            FFPROBE or "ffprobe",
            "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height",
            "-show_entries", "format=duration",
            "-of", "json",
            str(src),
        ],
        check=True,
        capture_output=True,
        timeout=60,
    )
    data = json.loads(out.stdout)
    stream = data["streams"][0]
    duration = float(data.get("format", {}).get("duration") or 0)
    return int(stream["width"]), int(stream["height"]), duration


def _fit(width: int, height: int, max_dim: int) -> tuple[int, int]:
    scale = min(1.0, max_dim / max(width, height))
    even = lambda v: max(2, int(round(v * scale / 2)) * 2)  # noqa: E731
    return even(width), even(height)


def process_video(src: Path, out_dir: Path, poster_dir: Path, stem: str) -> ProcessedVideo:
    """Transcode `src` into full/preview/poster files. Raises on ffmpeg failure."""
    width, height, duration = _probe(src)

    full = out_dir / f"{stem}.mp4"
    fw, fh = _fit(width, height, FULL_MAX_DIM)
    _run([
        FFMPEG, "-y", "-i", str(src),
        "-vf", f"scale={fw}:{fh}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "96k",
        "-movflags", "+faststart",
        str(full),
    ])

    preview: Path | None = out_dir / f"{stem}_preview.mp4"
    pw, ph = _fit(width, height, PREVIEW_MAX_DIM)
    try:
        _run([
            FFMPEG, "-y", "-i", str(src),
            "-t", str(PREVIEW_MAX_SECONDS),
            "-vf", f"scale={pw}:{ph},fps=24",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
            "-profile:v", "main", "-pix_fmt", "yuv420p",
            "-an",
            "-movflags", "+faststart",
            str(preview),
        ])
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        logger.warning("Preview transcode failed for %s", src, exc_info=True)
        preview = None

    poster = _extract_poster(src, poster_dir, stem, width, height, duration)
    return ProcessedVideo(full=full, preview=preview, poster=poster)


def _extract_poster(
    src: Path, poster_dir: Path, stem: str, width: int, height: int, duration: float
) -> Path | None:
    tw, th = _fit(width, height, POSTER_MAX_DIM)
    jpg = poster_dir / f"{stem}_poster.jpg"
    # Grab a frame slightly into the clip (first frames are often dark/blurred).
    for ss in ("0.5", "0"):
        if float(ss) >= duration > 0:
            continue
        try:
            _run([
                FFMPEG, "-y", "-ss", ss, "-i", str(src),
                "-frames:v", "1",
                "-vf", f"scale={tw}:{th}",
                "-q:v", "3",
                str(jpg),
            ])
            if jpg.exists() and jpg.stat().st_size > 0:
                break
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
            continue
    if not jpg.exists() or jpg.stat().st_size == 0:
        logger.warning("Poster extraction failed for %s", src)
        return None

    webp = compress_image(jpg, poster_dir / f"{stem}_poster.webp")
    if webp is not None:
        jpg.unlink(missing_ok=True)
        return webp
    return jpg


def compress_image(src: Path, dest_webp: Path, max_dim: int = IMAGE_MAX_DIM) -> Path | None:
    """Resize to `max_dim` and re-encode as webp. Returns None if Pillow is unavailable/fails."""
    try:
        from PIL import Image, ImageOps
    except ImportError:
        logger.warning("Pillow not installed — keeping original image %s", src)
        return None

    try:
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
            if im.mode not in ("RGB", "RGBA"):
                im = im.convert("RGBA" if "A" in im.getbands() else "RGB")
            im.save(dest_webp, "WEBP", quality=IMAGE_WEBP_QUALITY, method=4)
        return dest_webp
    except Exception:
        logger.warning("Image compression failed for %s", src, exc_info=True)
        dest_webp.unlink(missing_ok=True)
        return None
