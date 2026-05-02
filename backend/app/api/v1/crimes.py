"""
CrimeScope — Crimes Router
All /api/v1/crimes endpoints with full filtering, pagination, and GeoJSON.
"""
from datetime import date
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import csv
import io

from app.core.database import get_db
from app.core.security import require_plan, get_current_user
from app.models.crime import CrimeIncident
from app.models.user import User, UserPlan
from app.schemas.crime import CrimeIncidentRead, CrimeSummaryStats
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/crimes", tags=["Crimes"])


# ── Helper — base query builder ───────────────────────────────────────────────

def _build_crime_query(
    city: str,
    start_date: str | None,
    end_date: str | None,
    category: str | None,
    district: str | None,
):
    """Build filtered SQLAlchemy select query for crime_incidents."""
    filters = [CrimeIncident.city == city.lower()]

    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")
    if category:
        filters.append(CrimeIncident.category == category.upper())
    if district:
        filters.append(CrimeIncident.district == district)

    return select(CrimeIncident).where(and_(*filters))


# ── GET /crimes ───────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[CrimeIncidentRead])
async def list_crimes(
    request: Request,
    city: str = Query(default="chicago", description="City slug e.g. chicago"),
    start_date: str | None = Query(default=None, description="ISO date YYYY-MM-DD"),
    end_date: str | None = Query(default=None, description="ISO date YYYY-MM-DD"),
    category: str | None = Query(default=None, description="Crime category e.g. THEFT"),
    district: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List crime incidents with optional filtering and pagination."""
    base_q = _build_crime_query(city, start_date, end_date, category, district)

    # Total count
    count_result = await db.execute(select(func.count()).select_from(base_q.subquery()))
    total = count_result.scalar_one()

    # Paginated data
    result = await db.execute(
        base_q.order_by(CrimeIncident.occurred_at.desc()).limit(limit).offset(offset)
    )
    incidents = result.scalars().all()

    total_pages = (total + limit - 1) // limit
    page = (offset // limit) + 1

    return PaginatedResponse(
        total=total,
        data=[CrimeIncidentRead.model_validate(i) for i in incidents],
        meta={"page": page, "limit": limit, "total_pages": total_pages},
    )





# ── GET /crimes/stats/summary ─────────────────────────────────────────────────

@router.get("/stats/summary")
async def crime_summary(
    request: Request,
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Aggregate stats for the dashboard summary cards."""
    filters = [CrimeIncident.city == city.lower()]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")

    total_result = await db.execute(
        select(func.count()).where(and_(*filters))
    )
    total = total_result.scalar_one()

    # Resolved rate
    resolved_result = await db.execute(
        select(func.count()).where(and_(*filters, CrimeIncident.resolved == True))  # noqa: E712
    )
    resolved = resolved_result.scalar_one()
    resolved_rate = round(resolved / total, 4) if total > 0 else 0.0

    # Top category
    cat_result = await db.execute(
        select(CrimeIncident.category, func.count().label("cnt"))
        .where(and_(*filters))
        .group_by(CrimeIncident.category)
        .order_by(func.count().desc())
        .limit(5)
    )
    categories = cat_result.fetchall()
    top_category = categories[0][0] if categories else "N/A"
    stats_by_category = [
        {"category": c, "count": n, "pct": round(n / total * 100, 1) if total else 0}
        for c, n in categories
    ]

    # District rankings
    district_result = await db.execute(
        select(CrimeIncident.district, func.count().label("cnt"))
        .where(and_(*filters, CrimeIncident.district.isnot(None)))
        .group_by(CrimeIncident.district)
        .order_by(func.count().desc())
        .limit(1)
    )
    districts = district_result.fetchall()
    highest_district = districts[0][0] if districts else None

    district_result_asc = await db.execute(
        select(CrimeIncident.district, func.count().label("cnt"))
        .where(and_(*filters, CrimeIncident.district.isnot(None)))
        .group_by(CrimeIncident.district)
        .order_by(func.count().asc())
        .limit(1)
    )
    districts_asc = district_result_asc.fetchall()
    safest_district = districts_asc[0][0] if districts_asc else None

    return {
        "period": f"{start_date or 'all'} to {end_date or 'now'}",
        "total_incidents": total,
        "change_pct": 0.0,  # Requires prior-period comparison — Phase 3 full impl
        "top_category": top_category,
        "safest_district": safest_district,
        "highest_district": highest_district,
        "resolved_rate": resolved_rate,
        "stats_by_category": stats_by_category,
    }


# ── GET /crimes/stats/by-category ────────────────────────────────────────────

@router.get("/stats/by-category")
async def crimes_by_category(
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Category breakdown (pie chart data)."""
    filters = [CrimeIncident.city == city.lower()]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")

    result = await db.execute(
        select(CrimeIncident.category, func.count().label("count"))
        .where(and_(*filters))
        .group_by(CrimeIncident.category)
        .order_by(func.count().desc())
    )
    rows = result.fetchall()
    total = sum(r.count for r in rows)
    return [
        {"category": r.category, "count": r.count, "pct": round(r.count / total * 100, 1) if total else 0}
        for r in rows
    ]


# ── GET /crimes/stats/by-district ────────────────────────────────────────────

@router.get("/stats/by-district")
async def crimes_by_district(
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[dict]:
    """Per-district incident counts."""
    filters = [
        CrimeIncident.city == city.lower(),
        CrimeIncident.district.isnot(None),
    ]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")

    result = await db.execute(
        select(CrimeIncident.district, func.count().label("count"))
        .where(and_(*filters))
        .group_by(CrimeIncident.district)
        .order_by(func.count().desc())
    )
    return [{"district": r.district, "count": r.count} for r in result.fetchall()]


# ── GET /crimes/stats/by-time (Pro+) ─────────────────────────────────────────

@router.get("/stats/by-time")
async def crimes_by_time(
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    granularity: str = Query(default="day", description="day | week | month"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> list[dict]:
    """Time-series incident counts — Pro+ only."""
    filters = [CrimeIncident.city == city.lower()]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")

    # Truncate date by granularity
    trunc = func.date_trunc(granularity, CrimeIncident.occurred_at)
    result = await db.execute(
        select(trunc.label("period"), func.count().label("count"))
        .where(and_(*filters))
        .group_by(trunc)
        .order_by(trunc)
    )
    return [{"period": str(r.period), "count": r.count} for r in result.fetchall()]


# ── GET /crimes/heatmap ───────────────────────────────────────────────────────

@router.get("/heatmap")
async def crime_heatmap(
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    category: str | None = Query(default=None),
    limit: int = Query(default=5000, le=10000),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """GeoJSON FeatureCollection for Mapbox heatmap/cluster layers."""
    filters = [
        CrimeIncident.city == city.lower(),
        CrimeIncident.latitude.isnot(None),
        CrimeIncident.longitude.isnot(None),
    ]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")
    if category:
        filters.append(CrimeIncident.category == category.upper())

    result = await db.execute(
        select(
            CrimeIncident.id,
            CrimeIncident.latitude,
            CrimeIncident.longitude,
            CrimeIncident.category,
            CrimeIncident.occurred_at,
            CrimeIncident.district,
        )
        .where(and_(*filters))
        .order_by(CrimeIncident.occurred_at.desc())
        .limit(limit)
    )
    rows = result.fetchall()

    features = [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [float(r.longitude), float(r.latitude)],
            },
            "properties": {
                "id": str(r.id),
                "category": r.category,
                "district": r.district,
                "occurred_at": r.occurred_at.isoformat() if r.occurred_at else None,
            },
        }
        for r in rows
    ]

    return {"type": "FeatureCollection", "features": features, "total": len(features)}


# ── GET /crimes/export (Pro+) ─────────────────────────────────────────────────

@router.get("/export")
async def export_crimes(
    city: str = Query(default="chicago"),
    start_date: str | None = Query(default=None),
    end_date: str | None = Query(default=None),
    category: str | None = Query(default=None),
    format: str = Query(default="csv", description="csv | json"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
):
    """Export incidents as CSV or JSON — Pro+ only."""
    filters = [CrimeIncident.city == city.lower()]
    if start_date:
        filters.append(CrimeIncident.occurred_at >= f"{start_date} 00:00:00")
    if end_date:
        filters.append(CrimeIncident.occurred_at <= f"{end_date} 23:59:59")
    if category:
        filters.append(CrimeIncident.category == category.upper())

    result = await db.execute(
        select(CrimeIncident).where(and_(*filters)).limit(50_000)
    )
    incidents = result.scalars().all()

    if format == "json":
        import json
        data = [CrimeIncidentRead.model_validate(i).model_dump(mode="json") for i in incidents]
        return StreamingResponse(
            io.BytesIO(json.dumps(data).encode()),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=crimescope_{city}_export.json"},
        )

    output = io.StringIO()
    fieldnames = ["id", "city", "category", "subcategory", "latitude", "longitude",
                  "district", "neighborhood", "occurred_at", "resolved", "source_api"]
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()
    for i in incidents:
        writer.writerow({
            "id": str(i.id),
            "city": i.city,
            "category": i.category,
            "subcategory": i.subcategory or "",
            "latitude": float(i.latitude),
            "longitude": float(i.longitude),
            "district": i.district or "",
            "neighborhood": i.neighborhood or "",
            "occurred_at": i.occurred_at.isoformat() if i.occurred_at else "",
            "resolved": i.resolved,
            "source_api": i.source_api or "",
        })

    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=crimescope_{city}_export.csv"},
    )


# ── GET /crimes/{id} — MUST be LAST so /heatmap /stats/* /export match first ──

@router.get("/{incident_id}", response_model=CrimeIncidentRead)
async def get_crime(
    incident_id: str,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single crime incident by UUID. Named sub-paths take priority over this wildcard."""
    import uuid as _uuid
    try:
        uid = _uuid.UUID(incident_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Incident not found")
    result = await db.execute(
        select(CrimeIncident).where(CrimeIncident.id == uid)
    )
    incident = result.scalar_one_or_none()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return CrimeIncidentRead.model_validate(incident)
