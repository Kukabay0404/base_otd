from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parents[2]
ENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=ENV_PATH)


def _as_bool(value: str | None, default: bool) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _clean_str(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class Settings:
    APP_ENV: str
    IS_PRODUCTION: bool
    DATABASE_URL: str
    DB_ECHO: bool
    AUTO_CREATE_TABLES: bool
    JWT_SECRET_KEY: str
    JWT_ALG: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    CORS_ALLOWED_ORIGINS: list[str]
    R2_ACCOUNT_ID: str | None
    R2_ACCESS_KEY_ID: str | None
    R2_SECRET_ACCESS_KEY: str | None
    R2_BUCKET_NAME: str | None
    R2_REGION: str
    R2_PUBLIC_BASE_URL: str | None
    R2_PRESIGN_EXPIRES_SECONDS: int

    REDIS_URL: str
    REDIS_ENABLED: bool

    def __init__(self) -> None:
        import os

        self.APP_ENV = os.getenv("APP_ENV", "development").strip().lower()
        self.IS_PRODUCTION = self.APP_ENV in {"production", "prod"}

        self.DATABASE_URL = self._get_database_url(os.getenv("DATABASE_URL"))
        self.DB_ECHO = _as_bool(os.getenv("DB_ECHO"), False)
        self.AUTO_CREATE_TABLES = _as_bool(
            os.getenv("AUTO_CREATE_TABLES"),
            not self.IS_PRODUCTION,
        )
        self.JWT_SECRET_KEY = self._get_jwt_secret(os.getenv("JWT_SECRET_KEY"))
        self.JWT_ALG = os.getenv("JWT_ALG", "HS256")
        self.ACCESS_TOKEN_EXPIRE_MINUTES = int(
            os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
        )

        cors_raw = os.getenv(
            "CORS_ALLOWED_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        )
        self.CORS_ALLOWED_ORIGINS = [
            origin.strip() for origin in cors_raw.split(",") if origin.strip()
        ]

        self.R2_ACCOUNT_ID = _clean_str(os.getenv("R2_ACCOUNT_ID"))
        self.R2_ACCESS_KEY_ID = _clean_str(os.getenv("R2_ACCESS_KEY_ID"))
        self.R2_SECRET_ACCESS_KEY = _clean_str(os.getenv("R2_SECRET_ACCESS_KEY"))
        self.R2_BUCKET_NAME = _clean_str(os.getenv("R2_BUCKET_NAME"))
        self.R2_REGION = os.getenv("R2_REGION", "auto")
        self.R2_PUBLIC_BASE_URL = _clean_str(os.getenv("R2_PUBLIC_BASE_URL"))
        self.R2_PRESIGN_EXPIRES_SECONDS = int(
            os.getenv("R2_PRESIGN_EXPIRES_SECONDS", "600")
        )

        self.REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
        self.REDIS_ENABLED = _as_bool(os.getenv("REDIS_ENABLED"), True)

    def _get_database_url(self, configured_url: str | None) -> str:
        if configured_url:
            return configured_url
        if self.IS_PRODUCTION:
            raise RuntimeError("DATABASE_URL must be set when APP_ENV=production")
        return "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres"

    def _get_jwt_secret(self, configured_secret: str | None) -> str:
        if configured_secret:
            return configured_secret
        if self.IS_PRODUCTION:
            raise RuntimeError("JWT_SECRET_KEY must be set when APP_ENV=production")
        return "dev-only-insecure-jwt-secret"


settings = Settings()
