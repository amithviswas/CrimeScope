"""
CrimeScope — Admin Router
/api/v1/admin — superuser-only endpoints for platform management.
"""
import logging
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import require_admin
from app.models.ingestion_log import IngestionLog
from app.models.subscription import Subscription
from app.models.user import User, UserPlan

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"])


# ── GET /admin/users ─────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    limit: int = Query(default=50, le=500),
    offset: int = Query(default=0, ge=0),
    plan: str | None = Query(default=None),
    search: str | None = Query(default=None, description="Search by email or name"),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin()),
) -> dict:
    """List all platform users with plan and subscription info."""
    q = select(User)
    if plan:
        q = q.where(User.plan == UserPlan(plan))
    if search:
        q = q.where(
            (User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%"))
        )

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(
        q.order_by(User.created_at.desc()).limit(limit).offset(offset)
    )
    users = result.scalars().all()

    return {
        "total": total,
        "data": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "plan": u.plan.value,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "is_superuser": u.is_superuser,
                "oauth_provider": u.oauth_provider,
                "last_login": u.last_login.isoformat() if u.last_login else None,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "meta": {"limit": limit, "offset": offset},
    }


# ── GET /admin/ingestion-logs ─────────────────────────────────────────────────

@router.get("/ingestion-logs")
async def list_ingestion_logs(
    city: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin()),
) -> dict:
    """View ETL ingestion history with status, counts, and error messages."""
    q = select(IngestionLog)
    if city:
        q = q.where(IngestionLog.city == city)
    if status:
        q = q.where(IngestionLog.status == status)

    count_result = await db.execute(select(func.count()).select_from(q.subquery()))
    total = count_result.scalar_one()

    result = await db.execute(q.order_by(IngestionLog.created_at.desc()).limit(limit))
    logs = result.scalars().all()

    return {
        "total": total,
        "data": [
            {
                "id": str(log.id),
                "source": log.source,
                "city": log.city,
                "status": log.status,
                "records_fetched": log.records_fetched,
                "records_inserted": log.records_inserted,
                "records_skipped": log.records_skipped,
                "error_msg": log.error_msg,
                "started_at": log.started_at.isoformat() if log.started_at else None,
                "completed_at": log.completed_at.isoformat() if log.completed_at else None,
                "duration_seconds": (
                    (log.completed_at - log.started_at).total_seconds()
                    if log.completed_at and log.started_at else None
                ),
            }
            for log in logs
        ],
    }


# ── POST /admin/ingest ────────────────────────────────────────────────────────

@router.post("/ingest")
async def trigger_ingestion(
    city: str = Query(default="chicago"),
    limit: int = Query(default=10_000, le=50_000),
    admin=Depends(require_admin()),
) -> dict:
    """Manually trigger a data ingestion job via Celery."""
    from app.tasks.etl_tasks import ingest_city_task

    task = ingest_city_task.delay(city, limit=limit)
    return {
        "task_id": task.id,
        "city": city,
        "limit": limit,
        "status": "queued",
        "message": f"Ingestion task queued for {city}. Check /admin/ingestion-logs for results.",
    }


# ── GET /admin/stats ──────────────────────────────────────────────────────────

@router.get("/stats")
async def platform_stats(
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_admin()),
) -> dict:
    """System-wide statistics for internal monitoring."""
    from app.models.crime import CrimeIncident
    from app.models.anomaly import Anomaly

    # User counts by plan
    plan_counts = await db.execute(
        select(User.plan, func.count().label("cnt"))
        .group_by(User.plan)
    )
    users_by_plan = {r.plan.value: r.cnt for r in plan_counts.fetchall()}

    # Total crime records
    crime_count = await db.execute(select(func.count()).select_from(CrimeIncident))
    total_crimes = crime_count.scalar_one()

    # Crime records by city
    city_counts = await db.execute(
        select(CrimeIncident.city, func.count().label("cnt"))
        .group_by(CrimeIncident.city)
        .order_by(func.count().desc())
    )
    crimes_by_city = {r.city: r.cnt for r in city_counts.fetchall()}

    # Last ingestion per city
    last_ingestions = await db.execute(
        select(IngestionLog.city, func.max(IngestionLog.completed_at).label("last_run"))
        .where(IngestionLog.status == "success")
        .group_by(IngestionLog.city)
    )
    ingestion_status = {
        r.city: r.last_run.isoformat() if r.last_run else None
        for r in last_ingestions.fetchall()
    }

    # Active anomalies
    anomaly_count = await db.execute(
        select(func.count()).where(Anomaly.is_resolved == False)  # noqa: E712
    )
    active_anomalies = anomaly_count.scalar_one()

    # Subscriptions
    sub_counts = await db.execute(
        select(Subscription.plan, func.count().label("cnt"))
        .group_by(Subscription.plan)
    )
    subscriptions = {r.plan.value: r.cnt for r in sub_counts.fetchall()}

    return {
        "generated_at": datetime.now(UTC).isoformat(),
        "users": {
            "total": sum(users_by_plan.values()),
            "by_plan": users_by_plan,
        },
        "crime_data": {
            "total_records": total_crimes,
            "by_city": crimes_by_city,
            "last_ingestion_per_city": ingestion_status,
        },
        "ml": {
            "active_anomalies": active_anomalies,
        },
        "revenue": {
            "subscriptions_by_plan": subscriptions,
            "pro_subscribers": subscriptions.get("pro", 0),
        },
    }
