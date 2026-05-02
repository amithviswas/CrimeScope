"""
CrimeScope — Auth Router  (Phase 6: Google OAuth fully implemented)
POST /auth/register, /auth/login, /auth/logout, /auth/refresh,
     /auth/forgot-password, /auth/reset-password
GET  /auth/verify/{token}, /auth/google, /auth/google/callback, /auth/me
PATCH /auth/me
"""
import secrets
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rate_limiter import limiter
from app.core.security import (
    blacklist_token,
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.core.config import settings
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan
from app.schemas.user import (
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserRead,
    UserUpdate,
)
from app.services.email_service import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ── Cookie helpers ────────────────────────────────────────────────────────────

# Use secure cookies in production (HTTPS required)
_SECURE = settings.environment == "production"
COOKIE_OPTS = dict(httponly=True, samesite="lax", secure=_SECURE)


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    response.set_cookie("access_token", access_token, max_age=3600, **COOKIE_OPTS)
    response.set_cookie(
        "refresh_token", refresh_token,
        max_age=60 * 60 * 24 * 30,
        path="/api/v1/auth/refresh",
        **COOKIE_OPTS,
    )


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(request: Request, payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Create new user account and send verification email."""
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    verification_token = secrets.token_urlsafe(32)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        verification_token=verification_token,
        plan=UserPlan.FREE,
    )
    db.add(user)
    await db.flush()

    subscription = Subscription(
        user_id=user.id,
        plan=PlanTier.FREE,
        status=SubscriptionStatus.ACTIVE,
    )
    db.add(subscription)
    await db.commit()

    send_verification_email(user.email, verification_token)

    return {
        "message": "Account created. Please check your email to verify your account.",
        "user_id": str(user.id),
    }


# ── Email Verification ────────────────────────────────────────────────────────

@router.get("/verify/{token}")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    """Activate account via email verification token."""
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user.is_verified = True
    user.verification_token = None
    await db.commit()
    # Redirect to frontend verification success page
    return RedirectResponse(url=f"{settings.frontend_url}/verify?status=success")


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
async def login(request: Request, payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT tokens."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before signing in")

    user.last_login = datetime.now(UTC)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    _set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=3600,
        user=UserRead.model_validate(user),
    )


# ── Logout ────────────────────────────────────────────────────────────────────

@router.post("/logout")
async def logout(request: Request, response: Response):
    """Clear auth cookies and blacklist the access token in Redis."""
    token = request.cookies.get("access_token") or (
        request.headers.get("Authorization", "").replace("Bearer ", "")
    )
    if token:
        payload = decode_token(token)
        if payload and payload.get("jti"):
            exp = payload.get("exp", 0)
            remaining = max(0, int(exp - datetime.now(UTC).timestamp()))
            await blacklist_token(payload["jti"], remaining)

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token", path="/api/v1/auth/refresh")
    return {"message": "Logged out successfully"}


# ── Refresh ───────────────────────────────────────────────────────────────────

@router.post("/refresh")
async def refresh_token(request: Request, db: AsyncSession = Depends(get_db)):
    """Issue a new access token using the refresh token cookie."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token provided")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == uuid.UUID(payload["sub"])))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or disabled")

    new_access = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    return {"access_token": new_access, "token_type": "bearer", "expires_in": 3600}


# ── Forgot Password ───────────────────────────────────────────────────────────

@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(request: Request, payload: ForgotPasswordRequest, response: Response, db: AsyncSession = Depends(get_db)):
    """Send password reset email (always returns 200 to prevent user enumeration)."""
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()

    if user and user.is_active:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(UTC) + timedelta(minutes=15)
        await db.commit()
        send_password_reset_email(user.email, reset_token)

    return {"message": "If that email is registered, a reset link has been sent."}


# ── Reset Password ────────────────────────────────────────────────────────────

@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Reset password using token from email."""
    result = await db.execute(select(User).where(User.reset_token == payload.token))
    user = result.scalar_one_or_none()

    if not user or not user.reset_token_expires:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.reset_token_expires < datetime.now(UTC):
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()
    return {"message": "Password reset successfully. Please sign in."}


# ── Current User ──────────────────────────────────────────────────────────────

@router.get("/me", response_model=UserRead)
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    """Get the currently authenticated user (from cookie or Bearer token)."""
    from app.core.security import get_current_user
    user = await get_current_user(request, db)
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead)
async def update_me(
    payload: UserUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile."""
    from app.core.security import get_current_user
    user = await get_current_user(request, db)

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        existing = await db.execute(select(User).where(User.email == payload.email))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = payload.email
        user.is_verified = False

    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)


# ── Google OAuth ──────────────────────────────────────────────────────────────

def _get_oauth_client():
    """Lazy-import and configure Authlib Google OAuth client."""
    from authlib.integrations.starlette_client import OAuth
    oauth = OAuth()
    oauth.register(
        name="google",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"},
    )
    return oauth


@router.get("/google")
async def google_login(request: Request):
    """Redirect to Google OAuth consent screen."""
    if not settings.google_client_id or not settings.google_client_secret:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        )
    oauth = _get_oauth_client()
    # Google must redirect to the BACKEND callback endpoint.
    # This URI must be registered in Google Cloud Console Authorized Redirect URIs.
    # Set GOOGLE_REDIRECT_URI in env to override (default: backend /auth/google/callback)
    redirect_uri = (
        settings.google_redirect_uri
        or f"{settings.backend_url}/api/v1/auth/google/callback"
    )
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth callback — find or create user, set tokens, redirect to dashboard."""
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    oauth = _get_oauth_client()
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Google OAuth failed: {exc}")

    user_info = token.get("userinfo") or {}
    google_id  = user_info.get("sub")
    email      = user_info.get("email")
    full_name  = user_info.get("name")

    if not email:
        raise HTTPException(status_code=400, detail="Could not retrieve email from Google")

    # Find existing user by oauth_id or email
    result = await db.execute(
        select(User).where(User.oauth_provider == "google", User.oauth_id == google_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        # Try by email (user may have registered with password before)
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if user:
            # Link Google to existing account
            user.oauth_provider = "google"
            user.oauth_id = google_id
            user.is_verified = True
        else:
            # Create new OAuth user (no password, already verified by Google)
            user = User(
                email=email,
                full_name=full_name,
                oauth_provider="google",
                oauth_id=google_id,
                is_verified=True,
                plan=UserPlan.FREE,
            )
            db.add(user)
            await db.flush()
            sub = Subscription(
                user_id=user.id,
                plan=PlanTier.FREE,
                status=SubscriptionStatus.ACTIVE,
            )
            db.add(sub)

    await db.commit()

    access_token  = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # ── Cross-domain OAuth fix ────────────────────────────────────────────────
    # Backend (onrender.com) and frontend (vercel.app) are on different domains.
    # Cookies set here would be scoped to onrender.com and invisible to vercel.app.
    # Solution: pass tokens as URL params → frontend /auth/callback reads & stores them.
    from urllib.parse import urlencode
    params = urlencode({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": 3600,
    })
    return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?{params}")
