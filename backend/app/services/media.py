import uuid
from pathlib import Path

import aiofiles
from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

settings = get_settings()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
VIDEO_TYPES = {"video/mp4", "video/webm"}


class MediaStorage:
    def __init__(self, root: str | None = None, url_prefix: str | None = None) -> None:
        self.root = Path(root or settings.media_root)
        self.url_prefix = (url_prefix or settings.media_url_prefix).rstrip("/")
        self.root.mkdir(parents=True, exist_ok=True)

    def url(self, relative_path: str) -> str:
        return f"{self.url_prefix}/{relative_path.lstrip('/')}"

    def path_from_url(self, url: str) -> Path | None:
        prefix = f"{self.url_prefix}/"
        if not url.startswith(prefix):
            return None
        return self.root / url[len(prefix) :]

    async def save(self, file: UploadFile) -> tuple[str, str, int]:
        content_type = file.content_type or "application/octet-stream"
        if content_type in IMAGE_TYPES:
            max_bytes = settings.max_image_mb * 1024 * 1024
            folder = "images"
            ext = _ext_for(content_type, file.filename, ".jpg")
        elif content_type in VIDEO_TYPES:
            max_bytes = settings.max_video_mb * 1024 * 1024
            folder = "videos"
            ext = _ext_for(content_type, file.filename, ".mp4")
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file type. Use jpeg/png/webp or mp4/webm.",
            )

        data = await file.read()
        size = len(data)
        if size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File too large. Max {max_bytes // (1024 * 1024)} MB.",
            )

        target_dir = self.root / folder
        target_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid.uuid4().hex}{ext}"
        path = target_dir / filename
        async with aiofiles.open(path, "wb") as out:
            await out.write(data)

        relative = f"{folder}/{filename}"
        return self.url(relative), content_type, size

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
    }
    if content_type in mapping:
        return mapping[content_type]
    if filename and "." in filename:
        return "." + filename.rsplit(".", 1)[-1].lower()
    return fallback


media_storage = MediaStorage()
