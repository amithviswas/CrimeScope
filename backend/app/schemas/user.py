"""
CrimeScope — User Pydantic Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator
import re


# ── Validators ──────────────────────────────────────────────────────────────

def validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("Password must be at least 8 characters")
    if not re.search(r"[A-Z]", v):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[0-9]", v):
        raise ValueError("Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
        raise ValueError("Password must contain at least one special character")
    return v


# ── Auth Schemas ─────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return validate_password_strength(v)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserRead"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return validate_password_strength(v)


# ── User Read/Update ─────────────────────────────────────────────────────────

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    full_name: str | None
    is_active: bool
    is_verified: bool
    plan: str
    oauth_provider: str | None
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


# ── Alert Schemas ─────────────────────────────────────────────────────────────

class AlertCreate(BaseModel):
    name: str
    city: str | None = None
    district: str | None = None
    categories: list[str] | None = None
    threshold: int | None = None
    window_days: int = 7
    notify_email: bool = True


class AlertRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    city: str | None
    district: str | None
    categories: list[str] | None
    threshold: int | None
    window_days: int
    is_active: bool
    notify_email: bool
    created_at: datetime


class AlertUpdate(BaseModel):
    name: str | None = None
    is_active: bool | None = None
    threshold: int | None = None
    categories: list[str] | None = None
