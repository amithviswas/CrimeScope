"""
CrimeScope — Application Configuration
Loads all environment variables via Pydantic Settings.
"""
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────────
    app_name: str = "CrimeScope API"
    version: str = "0.1.0"
    app_version: str = "0.1.0"  # alias used in main.py
    environment: Literal["development", "staging", "production"] = "development"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:8000"]
    # Extra CORS origins added via env (comma-separated)
    extra_cors_origins: str = ""
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"

    # ── Database ─────────────────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://crimescope:crimescope@localhost:5432/crimescope"
    db_pool_size: int = 20
    db_max_overflow: int = 10

    # ── Redis ────────────────────────────────────────────────────────────
    redis_url: str = "redis://localhost:6379/0"

    # ── Security ─────────────────────────────────────────────────────────
    secret_key: str = "CHANGE_ME_IN_PRODUCTION"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30

    # ── City Data APIs ───────────────────────────────────────────────────
    chicago_api_token: str = ""
    nyc_api_token: str = ""
    la_api_token: str = ""

    # ── Google OAuth ─────────────────────────────────────────────────────────
    google_client_id: str = ""
    google_client_secret: str = ""
    # Override the OAuth callback URI (must match Google Cloud Console exactly)
    # Default: {FRONTEND_URL}/api/auth/callback/google
    google_redirect_uri: str = ""

    # ── Stripe ───────────────────────────────────────────────────────────
    stripe_secret_key: str = ""
    stripe_publishable_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_pro_monthly_price_id: str = ""
    stripe_pro_annual_price_id: str = ""

    # ── Email (Resend) ───────────────────────────────────────────────────
    resend_api_key: str = ""
    # Sender address — use onboarding@resend.dev (no domain verification needed)
    # or your own verified domain address in production
    email_from: str = "onboarding@resend.dev"
    email_from_name: str = "CrimeScope"
    # In Resend sandbox mode, emails only reach your own verified address.
    # Set EMAIL_TO_OVERRIDE to your Resend-verified email during dev.
    # Leave blank in production (emails go to real recipients).
    email_to_override: str = ""
    # Keep for backward compat — ignored when email_from is set directly
    email_from_domain: str = ""

    # ── Monitoring ───────────────────────────────────────────────────────
    sentry_dsn: str = ""

    # ── Mapbox ───────────────────────────────────────────────────────────
    mapbox_token: str = ""

    @field_validator("database_url")
    @classmethod
    def ensure_asyncpg(cls, v: str) -> str:
        """Ensure asyncpg driver is used."""
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    @field_validator("debug", mode="before")
    @classmethod
    def auto_disable_debug_in_production(cls, v: bool, info) -> bool:
        """Always force debug=False when environment=production."""
        env = (info.data or {}).get("environment", "development")
        if env == "production":
            return False
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()


def get_cors_origins() -> list[str]:
    """Build full CORS origins list combining default + FRONTEND_URL + extra."""
    origins = set(settings.cors_origins)
    # Always add the configured frontend URL
    if settings.frontend_url:
        origins.add(settings.frontend_url)
    if settings.backend_url:
        origins.add(settings.backend_url)
    # Any extra origins (comma-separated env var)
    if settings.extra_cors_origins:
        for o in settings.extra_cors_origins.split(","):
            o = o.strip()
            if o:
                origins.add(o)
    return list(origins)
