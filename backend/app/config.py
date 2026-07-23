from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "VideoMenu"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 12
    algorithm: str = "HS256"

    admin_username: str = "admin"
    admin_password: str = "admin123"

    database_url: str = "sqlite:///./data/videomenu.db"
    media_root: str = "./uploads"
    media_url_prefix: str = "/media"
    max_image_mb: int = 5
    max_video_mb: int = 40
    cors_origins: str = "http://localhost:5173,http://localhost:3000,http://localhost"
    public_base_url: str = "http://localhost:8000"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
