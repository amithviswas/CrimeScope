"""
CrimeScope — Security: JWT, Password, Auth Dependencies, Plan Gating.

Design:
- Tokens stored in httpOnly cookies OR Bearer header (checked in order)
- Logout blacklists token JTI in Redis (TTL = remaining token lifetime)
- require_plan() is a factory returning a FastAPI Depends-compatible callable
- All dependencies use get_db so the session is properly managed
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any, Callable

from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

# ── Password hashing ──────────────────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return _pwd_context.verify(plain, hashed)


# ── JWT helpers ───────────────────────────────────────────────────────────────

def _make_token(data: dict[str, Any], expire_delta: timedelta) -> str:
    payload = {
        **data,
        "iat": datetime.now(UTC),
        "exp": datetime.now(UTC) + expire_delta,
        "jti": str(uuid.uuid4()),  # unique ID for blacklisting
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(data: dict[str, Any]) -> str:
    return _make_token(
        {**data, "type": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(data: dict[str, Any]) -> str:
    return _make_token(
        {**data, "type": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_token(token: str) -> dict[str, Any] | None:
    """Decode and validate a JWT. Returns payload dict or None if invalid/expired."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None


# ── Redis blacklist (logout) ──────────────────────────────────────────────────

async def blacklist_token(jti: str, expires_in_seconds: int) -> None:
    """Add a token JTI to the Redis blacklist for the remainder of its lifetime."""
    try:
        import redis.asyncio as aioredis
        r = await aioredis.from_url(settings.redis_url, decode_responses=True)
        await r.setex(f"blacklist:{jti}", expires_in_seconds, "1")
        await r.aclose()
    except Exception:
        pass  # Redis unavailable — token will expire naturally


async def is_token_blacklisted(jti: str) -> bool:
    """Return True if the token JTI has been blacklisted (logout)."""
    try:
        import redis.asyncio as aioredis
        r = await aioredis.from_url(settings.redis_url, decode_responses=True)
        result = await r.exists(f"blacklist:{jti}")
        await r.aclose()
        return result > 0
    except Exception:
        return False  # Fail open if Redis is unavailable


# ── Token extraction ──────────────────────────────────────────────────────────

def _extract_token(request: Request) -> str | None:
    """Extract JWT from Authorization: Bearer header first, then cookie."""
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth.split(" ", 1)[1]
    return request.cookies.get("access_token")


# ── Core user resolver (used by deps below) ───────────────────────────────────

async def _resolve_user(request: Request, db: AsyncSession):
    """
    Internal: resolve the current user from a request.
    Raises HTTPException on any failure.
    """
    from app.models.user import User

    token = _extract_token(request)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check blacklist (logout)
    jti = payload.get("jti", "")
    if jti and await is_token_blacklisted(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked — please log in again",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token")

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or disabled")

    return user


# ── Public FastAPI dependencies ───────────────────────────────────────────────

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency — returns the authenticated User or raises 401."""
    return await _resolve_user(request, db)


async def get_current_user_optional(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """FastAPI dependency — returns User or None (no error on unauthenticated)."""
    try:
        return await _resolve_user(request, db)
    except HTTPException:
        return None


# ── Plan hierarchy ────────────────────────────────────────────────────────────

from app.models.user import UserPlan  # noqa: E402 — after model import

PLAN_RANK: dict[str, int] = {
    UserPlan.FREE.value:       0,
    UserPlan.PRO.value:        1,
    UserPlan.ENTERPRISE.value: 2,
    UserPlan.ADMIN.value:      3,
}


def require_plan(minimum_plan: UserPlan) -> Callable:
    """
    FastAPI dependency factory — raises 403 if user's plan is below minimum.

    Usage:
        @router.get("/endpoint")
        async def endpoint(user: User = Depends(require_plan(UserPlan.PRO))):
            ...
    """
    min_rank = PLAN_RANK[minimum_plan.value]

    async def _dep(
        request: Request,
        db: AsyncSession = Depends(get_db),
    ):
        user = await _resolve_user(request, db)
        user_rank = PLAN_RANK.get(user.plan.value, 0)

        if user_rank < min_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "plan_required",
                    "required_plan": minimum_plan.value,
                    "current_plan": user.plan.value,
                    "upgrade_url": "/pricing",
                    "message": f"This feature requires the {minimum_plan.value.title()} plan or higher.",
                },
            )
        return user

    return _dep


def require_admin() -> Callable:
    """FastAPI dependency — raises 403 if user is not superuser."""
    async def _dep(
        request: Request,
        db: AsyncSession = Depends(get_db),
    ):
        user = await _resolve_user(request, db)
        if not user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )
        return user

    return _dep
