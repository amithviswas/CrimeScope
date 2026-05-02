"""
CrimeScope Backend — FastAPI Application Entry Point
Includes: CORS, rate limiting (slowapi), all v1 routers, OpenAPI metadata.
"""
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.api.v1 import admin, analytics, auth, crimes, ml, payments, users
from app.core.config import settings, get_cors_origins
from app.core.rate_limiter import limiter, rate_limit_exceeded_handler


# ── Sentry (error tracking) ────────────────────────────────────────────────────

if settings.sentry_dsn:
    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.1,
        environment=settings.environment,
    )


# ── Lifespan ───────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown hooks."""
    print(f"🚀 CrimeScope API [{settings.environment}] starting — v{settings.app_version}")
    yield
    print("🛑 CrimeScope API shutting down")


# ── FastAPI App ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CrimeScope API",
    version=settings.app_version,
    description=(
        "**CrimeScope** — Urban Safety Intelligence API.\n\n"
        "Real-time crime analytics powered by open government data and ML predictions.\n\n"
        "### Authentication\n"
        "All protected endpoints require a JWT in either:\n"
        "- `Authorization: Bearer <token>` header\n"
        "- `access_token` httpOnly cookie (set on login)\n\n"
        "### Plan Gating\n"
        "- `Free` — basic analytics, 1 alert rule\n"
        "- `Pro` — ML predictions, forecasts, anomaly alerts, advanced patterns\n"
        "- `Enterprise` — unlimited everything + custom integrations\n"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={"name": "CrimeScope Support", "email": "support@crimescope.app"},
    license_info={"name": "Proprietary"},
    lifespan=lifespan,
    openapi_tags=[
        {"name": "Authentication", "description": "Register, login, OAuth, JWT refresh"},
        {"name": "Crimes",         "description": "Crime incident data — filter, paginate, export"},
        {"name": "Analytics",      "description": "Dashboard stats, trends, patterns"},
        {"name": "ML Predictions", "description": "Hotspots, forecasts, anomalies (Pro+)"},
        {"name": "Users",          "description": "Profile + alert rules"},
        {"name": "Payments",       "description": "Stripe subscriptions and billing"},
        {"name": "Admin",          "description": "Superuser platform management"},
        {"name": "Health",         "description": "Health checks for Docker/load balancers"},
    ],
)

# ── Rate Limiter ───────────────────────────────────────────────────────────────

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# ── Middleware ─────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SessionMiddleware: required by Authlib for storing OAuth state/nonce between
# the /auth/google redirect and the /auth/google/callback endpoint.
from starlette.middleware.sessions import SessionMiddleware  # noqa: E402
_https_only = settings.environment == "production"
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key, same_site="lax", https_only=_https_only)


# ── Routers ────────────────────────────────────────────────────────────────────

API_V1 = "/api/v1"

app.include_router(auth.router,     prefix=API_V1)
app.include_router(crimes.router,   prefix=API_V1)
app.include_router(analytics.router, prefix=API_V1)
app.include_router(ml.router,       prefix=API_V1)
app.include_router(users.router,    prefix=API_V1)
app.include_router(payments.router, prefix=API_V1)
app.include_router(admin.router,    prefix=API_V1)


# ── Root & Health ──────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"], include_in_schema=False)
async def root():
    return {
        "product": "CrimeScope",
        "tagline": "Urban Safety Intelligence — Powered by Data",
        "version": settings.app_version,
        "environment": settings.environment,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for Docker, Railway, and load balancers."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "ok",
            "version": settings.app_version,
            "environment": settings.environment,
        },
    )
