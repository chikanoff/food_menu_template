from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.admin import router as admin_router
from app.api.public import router as public_router
from app.config import get_settings
from app.db import SessionLocal
from app.seed import init_db, seed_if_empty


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        seed_if_empty(db)
    finally:
        db.close()
    yield


settings = get_settings()
app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public_router)
app.include_router(admin_router)

media_path = Path(settings.media_root)
media_path.mkdir(parents=True, exist_ok=True)
app.mount(settings.media_url_prefix, StaticFiles(directory=str(media_path)), name="media")
