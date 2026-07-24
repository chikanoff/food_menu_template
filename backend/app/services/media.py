import asyncio
import logging
import uuid
from dataclasses import dataclass
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status

from app.config import get_settings
from app.services import processing

logger = logging.getLogger(__name__)
settings = get_settings()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
VIDEO_TYPES = {"video/mp4", "video/webm", "video/quicktime"}


@dataclass
class UploadResult:
    url: str
    content_type: str
    size: int
    poster_url: str | None = None
    preview_url: str | None = None


class MediaStorage:
    def __init__(self, root: str | None = None, url_prefix: str | None = None) -> None:
        self.root = Path(root or settings.media_root)
        self.url_prefix = (url_prefix or settings.media_url_prefix).rstrip("/")
        self.root.mkdir(parents=True, exist_ok=True)

    def url(self, relative_path: str) -> str:
        return f"{self.url_prefix}/{relative_path.lstrip('/')}"

    def url_for_path(self, path: Path) -> str:
        return self.url(path.relative_to(self.root).as_posix())

    def path_from_url(self, url: str) -> Path | None:
        prefix = f"{self.url_prefix}/"
        if not url.startswith(prefix):
            return None
        return self.root / url[len(prefix) :]

    async def save(self, file: UploadFile) -> UploadResult:
        content_type = file.content_type or "application/octet-stream"
        if content_type in IMAGE_TYPES:
            kind = "image"
            max_bytes = settings.max_image_mb * 1024 * 1024
            ext = _ext_for(content_type, file.filename, ".jpg")
        elif content_type in VIDEO_TYPES:
            kind = "video"
            max_bytes = settings.max_video_mb * 1024 * 1024
            ext = _ext_for(content_type, file.filename, ".mp4")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Use jpeg/png/webp or mp4/webm/mov.",
            )

        data = await file.read()
        if len(data) > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Max {max_bytes // (1024 * 1024)} MB.",
            )

        stem = uuid.uuid4().hex
        if kind == "image":
            return await self._save_image(data, stem, ext)
        return await self._save_video(data, stem, ext)

    async def _save_image(self, data: bytes, stem: str, ext: str) -> UploadResult:
        images_dir = self.root / "images"
        images_dir.mkdir(parents=True, exist_ok=True)
        original = images_dir / f"{stem}{ext}"
        async with aiofiles.open(original, "wb") as out:
            await out.write(data)

        webp = await asyncio.to_thread(
            processing.compress_image, original, images_dir / f"{stem}.webp"
        )
        if webp is not None and webp != original:
            original.unlink(missing_ok=True)
            return UploadResult(url=self.url_for_path(webp), content_type="image/webp", size=webp.stat().st_size)
        return UploadResult(url=self.url_for_path(original), content_type=_mime_for(ext), size=len(data))

    async def _save_video(self, data: bytes, stem: str, ext: str) -> UploadResult:
        videos_dir = self.root / "videos"
        images_dir = self.root / "images"
        videos_dir.mkdir(parents=True, exist_ok=True)
        images_dir.mkdir(parents=True, exist_ok=True)

        original = videos_dir / f"{stem}_orig{ext}"
        async with aiofiles.open(original, "wb") as out:
            await out.write(data)

        if not processing.ffmpeg_available():
            logger.warning("ffmpeg not available — storing video as uploaded (no preview/poster)")
            final = videos_dir / f"{stem}{ext}"
            original.rename(final)
            return UploadResult(url=self.url_for_path(final), content_type=_mime_for(ext), size=len(data))

        try:
            result = await asyncio.to_thread(
                processing.process_video, original, videos_dir, images_dir, stem
            )
        except Exception:
            logger.exception("Video transcode failed — storing original")
            final = videos_dir / f"{stem}{ext}"
            original.rename(final)
            return UploadResult(url=self.url_for_path(final), content_type=_mime_for(ext), size=len(data))

        original.unlink(missing_ok=True)
        return UploadResult(
            url=self.url_for_path(result.full),
            content_type="video/mp4",
            size=result.full.stat().st_size,
            poster_url=self.url_for_path(result.poster) if result.poster else None,
            preview_url=self.url_for_path(result.preview) if result.preview else None,
        )

    def delete(self, url: str | None) -> None:
        if not url:
            return
        path = self.path_from_url(url)
        if path and path.exists() and path.is_file():
            path.unlink()


def _ext_for(content_type: str, filename: str | None, fallback: str) -> str:
    mapping = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "video/quicktime": ".mov",
    }
    if content_type in mapping:
        return mapping[content_type]
    if filename and "." in filename:
        return "." + filename.rsplit(".", 1)[-1].lower()
    return fallback


def _mime_for(ext: str) -> str:
    return {
        ".jpg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mov": "video/quicktime",
    }.get(ext, "application/octet-stream")


media_storage = MediaStorage()
