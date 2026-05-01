"""
CrimeScope — Analytics Router
All /api/v1/analytics endpoints: dashboard, trends, compare, top-locations, patterns.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select, and_, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_plan
from app.models.crime import CrimeIncident
from app.models.user import User, UserPlan

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ── GET /analytics/dashboard ─────────────────────────────────────────────────

@router.get("/dashboard")
async def dashboard_stats(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d", description="7d | 30d | 90d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """
    Main dashboard aggregate stats.
    Returns total incidents, change %, top category, district rankings.
    """
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)

    current = await db.execute(
        select(func.count()).where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
    )
    total = current.scalar_one()

    prior = await db.execute(
        select(func.count()).where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days * 2} days'"),
            CrimeIncident.occurred_at < text(f"NOW() - INTERVAL '{days} days'"),
        )
    )
    prior_total = prior.scalar_one()

    change_pct = round(((total - prior_total) / prior_total * 100), 2) if prior_total > 0 else 0.0

    resolved = await db.execute(
        select(func.count()).where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
            CrimeIncident.resolved == True,  # noqa: E712
        )
    )
    resolved_count = resolved.scalar_one()

    cats = await db.execute(
        select(CrimeIncident.category, func.count().label("cnt"))
        .where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
        .group_by(CrimeIncident.category)
        .order_by(func.count().desc())
        .limit(5)
    )
    cat_rows = cats.fetchall()
    top_category = cat_rows[0][0] if cat_rows else "N/A"
    stats_by_category = [
        {"category": c, "count": n, "pct": round(n / total * 100, 1) if total else 0}
        for c, n in cat_rows
    ]

    district_q = await db.execute(
        select(CrimeIncident.district, func.count().label("cnt"))
        .where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.district.isnot(None),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
        .group_by(CrimeIncident.district)
        .order_by(func.count().desc())
    )
    district_rows = district_q.fetchall()
    highest = district_rows[0][0] if district_rows else None
    safest = district_rows[-1][0] if district_rows else None

    return {
        "period": period,
        "city": city,
        "total_incidents": total,
        "change_pct": change_pct,
        "top_category": top_category,
        "safest_district": safest,
        "highest_district": highest,
        "resolved_rate": round(resolved_count / total, 4) if total else 0.0,
        "stats_by_category": stats_by_category,
    }


# ── GET /analytics/trends (Pro+) ────────────────────────────────────────────

@router.get("/trends")
async def trends(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d"),
    category: str | None = Query(default=None),
    granularity: str = Query(default="day", description="day | week | month"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> list[dict]:
    """Time-series trend data — Pro+ only."""
    days = {"7d": 7, "30d": 30, "90d": 90, "365d": 365}.get(period, 30)

    filters = [
        CrimeIncident.city == city.lower(),
        CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
    ]
    if category:
        filters.append(CrimeIncident.category == category.upper())

    trunc = func.date_trunc(granularity, CrimeIncident.occurred_at)
    result = await db.execute(
        select(trunc.label("period"), func.count().label("count"))
        .where(and_(*filters))
        .group_by(trunc)
        .order_by(trunc)
    )
    return [{"period": str(r.period), "count": r.count} for r in result.fetchall()]


# ── GET /analytics/compare (Pro+) ────────────────────────────────────────────

@router.get("/compare")
async def compare_periods(
    city: str = Query(default="chicago"),
    period_a_start: str = Query(..., description="YYYY-MM-DD"),
    period_a_end: str = Query(..., description="YYYY-MM-DD"),
    period_b_start: str = Query(..., description="YYYY-MM-DD"),
    period_b_end: str = Query(..., description="YYYY-MM-DD"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> dict:
    """Compare two time periods side by side — Pro+ only."""
    async def _count(start: str, end: str) -> int:
        r = await db.execute(
            select(func.count()).where(
                CrimeIncident.city == city.lower(),
                CrimeIncident.occurred_at >= f"{start} 00:00:00",
                CrimeIncident.occurred_at <= f"{end} 23:59:59",
            )
        )
        return r.scalar_one()

    a_total = await _count(period_a_start, period_a_end)
    b_total = await _count(period_b_start, period_b_end)
    change = round((a_total - b_total) / b_total * 100, 2) if b_total else 0.0

    return {
        "city": city,
        "period_a": {"start": period_a_start, "end": period_a_end, "total": a_total},
        "period_b": {"start": period_b_start, "end": period_b_end, "total": b_total},
        "change_pct": change,
        "trend": "up" if change > 0 else "down" if change < 0 else "flat",
    }


# ── GET /analytics/top-locations ─────────────────────────────────────────────

@router.get("/top-locations")
async def top_locations(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d"),
    limit: int = Query(default=10, le=50),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Top crime locations by incident count."""
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)

    result = await db.execute(
        select(
            CrimeIncident.location_name,
            CrimeIncident.district,
            func.count().label("count"),
            func.avg(CrimeIncident.latitude).label("lat"),
            func.avg(CrimeIncident.longitude).label("lng"),
        )
        .where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.location_name.isnot(None),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
        .group_by(CrimeIncident.location_name, CrimeIncident.district)
        .order_by(func.count().desc())
        .limit(limit)
    )
    return [
        {
            "location": r.location_name,
            "district": r.district,
            "count": r.count,
            "lat": float(r.lat) if r.lat else None,
            "lng": float(r.lng) if r.lng else None,
        }
        for r in result.fetchall()
    ]


# ── GET /analytics/category-breakdown ────────────────────────────────────────

@router.get("/category-breakdown")
async def category_breakdown(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Category breakdown for pie chart."""
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)

    result = await db.execute(
        select(CrimeIncident.category, func.count().label("count"))
        .where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
        .group_by(CrimeIncident.category)
        .order_by(func.count().desc())
    )
    rows = result.fetchall()
    total = sum(r.count for r in rows)
    return [
        {"category": r.category, "count": r.count, "pct": round(r.count / total * 100, 1) if total else 0}
        for r in rows
    ]


# ── GET /analytics/hourly-pattern (Pro+) ─────────────────────────────────────

@router.get("/hourly-pattern")
async def hourly_pattern(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d"),
    category: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> list[dict]:
    """Crime count by hour of day — Pro+ only."""
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)
    filters = [
        CrimeIncident.city == city.lower(),
        CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
    ]
    if category:
        filters.append(CrimeIncident.category == category.upper())

    hour = func.extract("hour", CrimeIncident.occurred_at).label("hour")
    result = await db.execute(
        select(hour, func.count().label("count"))
        .where(and_(*filters))
        .group_by(hour)
        .order_by(hour)
    )
    return [{"hour": int(r.hour), "count": r.count} for r in result.fetchall()]


# ── GET /analytics/weekly-pattern (Pro+) ─────────────────────────────────────

@router.get("/weekly-pattern")
async def weekly_pattern(
    city: str = Query(default="chicago"),
    period: str = Query(default="30d"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> list[dict]:
    """Crime count by day of week — Pro+ only (0=Sunday, 6=Saturday)."""
    days = {"7d": 7, "30d": 30, "90d": 90}.get(period, 30)

    dow = func.extract("dow", CrimeIncident.occurred_at).label("dow")
    result = await db.execute(
        select(dow, func.count().label("count"))
        .where(
            CrimeIncident.city == city.lower(),
            CrimeIncident.occurred_at >= text(f"NOW() - INTERVAL '{days} days'"),
        )
        .group_by(dow)
        .order_by(dow)
    )
    day_names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return [
        {"day": int(r.dow), "day_name": day_names[int(r.dow)], "count": r.count}
        for r in result.fetchall()
    ]
