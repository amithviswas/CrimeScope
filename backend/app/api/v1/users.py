"""
CrimeScope — Users Router
/api/v1/users — user profile + alerts CRUD.
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.alert import Alert
from app.models.user import User
from app.schemas.user import AlertCreate, AlertRead, AlertUpdate

router = APIRouter(prefix="/users", tags=["Users"])


# ── GET /users/alerts ─────────────────────────────────────────────────────────

@router.get("/alerts", response_model=list[AlertRead])
async def list_alerts(
    request: Request,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all alerts for the current user."""
    result = await db.execute(
        select(Alert)
        .where(Alert.user_id == user.id)
        .order_by(Alert.created_at.desc())
    )
    return [AlertRead.model_validate(a) for a in result.scalars().all()]


# ── POST /users/alerts ────────────────────────────────────────────────────────

@router.post("/alerts", response_model=AlertRead, status_code=201)
async def create_alert(
    payload: AlertCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new alert rule for the current user."""
    # Enforce plan limits (Pro: 5 alerts max; Free: 1)
    result = await db.execute(select(Alert).where(Alert.user_id == user.id, Alert.is_active == True))  # noqa
    current_count = len(result.scalars().all())

    limits = {"free": 1, "pro": 5, "enterprise": 999, "admin": 999}
    max_alerts = limits.get(user.plan.value, 1)
    if current_count >= max_alerts:
        raise HTTPException(
            status_code=403,
            detail=f"Alert limit reached ({max_alerts}) for {user.plan.value} plan. Upgrade to add more.",
        )

    alert = Alert(user_id=user.id, **payload.model_dump())
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    return AlertRead.model_validate(alert)


# ── PATCH /users/alerts/{id} ──────────────────────────────────────────────────

@router.patch("/alerts/{alert_id}", response_model=AlertRead)
async def update_alert(
    alert_id: UUID,
    payload: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update an existing alert."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(alert, field, value)

    await db.commit()
    await db.refresh(alert)
    return AlertRead.model_validate(alert)


# ── DELETE /users/alerts/{id} ─────────────────────────────────────────────────

@router.delete("/alerts/{alert_id}", status_code=204)
async def delete_alert(
    alert_id: UUID,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete an alert rule."""
    result = await db.execute(
        select(Alert).where(Alert.id == alert_id, Alert.user_id == user.id)
    )
    alert = result.scalar_one_or_none()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    await db.delete(alert)
    await db.commit()


# ── GET /users/alerts/triggered ───────────────────────────────────────────────

@router.get("/alerts/triggered")
async def triggered_alerts(
    user: User = Depends(get_current_user),
) -> list:
    """Recently triggered alerts. Phase 3 will wire anomaly → alert matching."""
    return []  # Phase 3 implementation
