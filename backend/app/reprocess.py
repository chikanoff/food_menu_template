"""Re-process already uploaded media files with the optimization pipeline.

Usage (inside the api container):
    python -m app.reprocess

- dish videos without preview_url -> transcoded full + card preview + poster
- local images (dish/category/promo/restaurant) -> resized webp
- promo videos -> transcoded full

External URLs (e.g. seed unsplash links) are skipped. Idempotent.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models import Category, DishMedia, Promotion, RestaurantSettings
from app.seed import init_db
from app.services import processing
from app.services.media import media_storage

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
logger = logging.getLogger("reprocess")


def _local_path(url: str | None) -> Path | None:
    if not url:
        return None
    path = media_storage.path_from_url(url)
    if path and path.exists() and path.is_file():
        return path
    return None


def _reprocess_image(url: str | None) -> str | None:
    """Compress a local image to webp. Returns new url or None if unchanged."""
    src = _local_path(url)
    if src is None or src.suffix == ".webp":
        return None
    dest = src.parent / f"{src.stem}.webp"
    result = processing.compress_image(src, dest)
    if result is None:
        return None
    if result != src:
        src.unlink(missing_ok=True)
    logger.info("image: %s -> %s", src.name, result.name)
    return media_storage.url_for_path(result)


def _reprocess_video(url: str | None) -> processing.ProcessedVideo | None:
    src = _local_path(url)
    if src is None:
        return None
    videos_dir = media_storage.root / "videos"
    images_dir = media_storage.root / "images"
    videos_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    stem = uuid.uuid4().hex
    original = videos_dir / f"{stem}_orig{src.suffix}"
    src.rename(original)
    try:
        result = processing.process_video(original, videos_dir, images_dir, stem)
    except Exception:
        logger.exception("video transcode failed for %s — keeping original", src.name)
        original.rename(src)
        return None
    original.unlink(missing_ok=True)
    logger.info("video: %s -> %s (+preview, +poster)", src.name, result.full.name)
    return result


def reprocess_dish_media(db: Session) -> None:
    for media in db.query(DishMedia).all():
        if media.type == "photo":
            new_url = _reprocess_image(media.url)
            if new_url:
                media.url = new_url
                db.commit()
        elif media.type == "video" and not media.preview_url:
            result = _reprocess_video(media.url)
            if result:
                old_poster = media.poster_url
                media.url = media_storage.url_for_path(result.full)
                media.preview_url = media_storage.url_for_path(result.preview) if result.preview else None
                if result.poster:
                    media.poster_url = media_storage.url_for_path(result.poster)
                    if old_poster and old_poster != media.poster_url:
                        media_storage.delete(old_poster)
                db.commit()


def reprocess_other_media(db: Session) -> None:
    restaurant = db.query(RestaurantSettings).first()
    if restaurant:
        for field in ("logo_url", "cover_url"):
            new_url = _reprocess_image(getattr(restaurant, field))
            if new_url:
                setattr(restaurant, field, new_url)
                db.commit()

    for category in db.query(Category).all():
        new_url = _reprocess_image(category.image_url)
        if new_url:
            category.image_url = new_url
            db.commit()

    for promo in db.query(Promotion).all():
        new_url = _reprocess_image(promo.image_url)
        if new_url:
            promo.image_url = new_url
            db.commit()
        # "_opt" suffix marks an already-optimized promo video (idempotency)
        if promo.video_url and not Path(promo.video_url).stem.endswith("_opt"):
            result = _reprocess_video(promo.video_url)
            if result:
                optimized = result.full.with_name(f"{result.full.stem}_opt{result.full.suffix}")
                result.full.rename(optimized)
                promo.video_url = media_storage.url_for_path(optimized)
                if result.preview:
                    Path(result.preview).unlink(missing_ok=True)
                if result.poster:
                    Path(result.poster).unlink(missing_ok=True)
                db.commit()


def main() -> None:
    if not processing.ffmpeg_available():
        logger.warning("ffmpeg not found — videos will be skipped, only images compressed")
    init_db()
    db = SessionLocal()
    try:
        reprocess_dish_media(db)
        reprocess_other_media(db)
        logger.info("Done.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
