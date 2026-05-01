"""
CrimeScope — User Model (aligned to backend-spec.md)
Table: users
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.core.database import Base
import enum


class UserPlan(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Identity
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name: Mapped[str | None] = mapped_column(String(255))
    hashed_password: Mapped[str | None] = mapped_column(String(255))  # None for OAuth-only users

    # Status
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)

    # OAuth
    oauth_provider: Mapped[str | None] = mapped_column(String(50))   # 'google' or null
    oauth_id: Mapped[str | None] = mapped_column(String(255), unique=True)

    # Plan (denormalized from subscription for fast gating)
    plan: Mapped[UserPlan] = mapped_column(
        Enum(UserPlan, values_callable=lambda x: [e.value for e in x]),
        default=UserPlan.FREE,
    )

    # Verification / Reset tokens (stored hashed)
    verification_token: Mapped[str | None] = mapped_column(String(255))
    reset_token: Mapped[str | None] = mapped_column(String(255))
    reset_token_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Audit
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    subscription: Mapped["Subscription"] = relationship(  # noqa: F821
        "Subscription", back_populates="user", uselist=False, lazy="selectin"
    )
    alerts: Mapped[list["Alert"]] = relationship(  # noqa: F821
        "Alert", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User email={self.email} plan={self.plan}>"
