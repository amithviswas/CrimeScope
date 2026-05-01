"""
CrimeScope — ML Router
/api/v1/ml — hotspots, forecasts, anomalies, risk scores (Pro+).
Phase 4 will implement real ML computation; Phase 2 returns DB results.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user, require_plan
from app.models.anomaly import Anomaly
from app.models.forecast import Forecast
from app.models.hotspot import Hotspot
from app.models.user import User, UserPlan
from app.schemas.analytics import AnomalyRead, ForecastRead, HotspotRead

router = APIRouter(prefix="/ml", tags=["ML Predictions"])


# ── GET /ml/hotspots (Pro+) ──────────────────────────────────────────────────

@router.get("/hotspots")
async def get_hotspots(
    city: str = Query(default="chicago"),
    limit: int = Query(default=20, le=100),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> dict:
    """Return latest ML-generated hotspots for a city."""
    result = await db.execute(
        select(Hotspot)
        .where(Hotspot.city == city.lower())
        .order_by(desc(Hotspot.generated_at), desc(Hotspot.risk_score))
        .limit(limit)
    )
    hotspots = result.scalars().all()

    return {
        "city": city,
        "generated_at": hotspots[0].generated_at.isoformat() if hotspots else None,
        "hotspots": [
            {
                "cluster_id": h.cluster_id,
                "center": {"lat": float(h.center_lat or 0), "lng": float(h.center_lng or 0)},
                "radius_m": float(h.radius_m or 0),
                "incident_count": h.incident_count,
                "risk_score": float(h.risk_score or 0),
                "categories": h.categories or {},
            }
            for h in hotspots
        ],
    }


# ── GET /ml/forecast (Pro+) ──────────────────────────────────────────────────

@router.get("/forecast")
async def get_forecast(
    city: str = Query(default="chicago"),
    category: str | None = Query(default=None),
    district: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> dict:
    """Return 30-day forecast for a city/category/district combination."""
    filters = [Forecast.city == city.lower()]
    if category:
        filters.append(Forecast.category == category.upper())
    if district:
        filters.append(Forecast.district == district)

    from sqlalchemy import and_
    result = await db.execute(
        select(Forecast)
        .where(and_(*filters))
        .order_by(Forecast.forecast_date)
        .limit(30)
    )
    forecasts = result.scalars().all()

    return {
        "city": city,
        "category": category,
        "district": district,
        "forecast": [
            {
                "date": f.forecast_date.isoformat(),
                "predicted": f.predicted_count,
                "lower": f.lower_bound,
                "upper": f.upper_bound,
                "confidence": float(f.confidence or 0),
            }
            for f in forecasts
        ],
    }


# ── GET /ml/anomalies (Pro+) ─────────────────────────────────────────────────

@router.get("/anomalies")
async def get_anomalies(
    city: str = Query(default="chicago"),
    unresolved_only: bool = Query(default=True),
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> list[dict]:
    """Return latest ML-detected anomalies."""
    filters = [Anomaly.city == city.lower()]
    if unresolved_only:
        filters.append(Anomaly.is_resolved == False)  # noqa: E712

    from sqlalchemy import and_
    result = await db.execute(
        select(Anomaly)
        .where(and_(*filters))
        .order_by(desc(Anomaly.detected_at))
        .limit(limit)
    )
    anomalies = result.scalars().all()
    return [AnomalyRead.model_validate(a).model_dump() for a in anomalies]


# ── GET /ml/risk-score/{district} (Pro+) ─────────────────────────────────────

@router.get("/risk-score/{district}")
async def district_risk_score(
    district: str,
    city: str = Query(default="chicago"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> dict:
    """Return composite risk score (0-10) for a district based on latest hotspot data."""
    result = await db.execute(
        select(Hotspot)
        .where(Hotspot.city == city.lower())
        .order_by(desc(Hotspot.generated_at))
        .limit(50)
    )
    hotspots = result.scalars().all()

    # Find highest risk score near this district (Phase 4 will do spatial lookup)
    if not hotspots:
        return {"district": district, "city": city, "risk_score": 0.0, "level": "unknown"}

    max_score = max((float(h.risk_score or 0) for h in hotspots), default=0.0)
    level = (
        "critical" if max_score >= 8 else
        "high"     if max_score >= 6 else
        "medium"   if max_score >= 4 else
        "low"
    )
    return {"district": district, "city": city, "risk_score": max_score, "level": level}


# ── GET /ml/model-status (Pro+) ──────────────────────────────────────────────

@router.get("/model-status")
async def model_status(
    city: str = Query(default="chicago"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_plan(UserPlan.PRO)),
) -> dict:
    """Return last training timestamps from the DB for each ML model."""
    from sqlalchemy import func

    # Hotspot last run
    hs_result = await db.execute(
        select(func.max(Hotspot.generated_at)).where(Hotspot.city == city.lower())
    )
    hotspot_last = hs_result.scalar()
    hotspot_count_result = await db.execute(
        select(func.count(Hotspot.id)).where(Hotspot.city == city.lower())
    )
    hotspot_count = hotspot_count_result.scalar() or 0

    # Forecast last run
    fc_result = await db.execute(
        select(func.max(Forecast.generated_at)).where(Forecast.city == city.lower())
    )
    forecast_last = fc_result.scalar()
    fc_count_result = await db.execute(
        select(func.count(Forecast.id)).where(Forecast.city == city.lower())
    )
    forecast_count = fc_count_result.scalar() or 0

    # Anomaly last run
    an_result = await db.execute(
        select(func.max(Anomaly.detected_at)).where(Anomaly.city == city.lower())
    )
    anomaly_last = an_result.scalar()
    an_count_result = await db.execute(
        select(func.count(Anomaly.id)).where(Anomaly.city == city.lower())
    )
    anomaly_count = an_count_result.scalar() or 0

    def _status(last_trained, count) -> str:
        if count == 0 or last_trained is None:
            return "not_trained"
        return "ready"

    return {
        "city": city,
        "hotspot_model": {
            "status":       _status(hotspot_last, hotspot_count),
            "last_trained": hotspot_last.isoformat() if hotspot_last else None,
            "clusters":     hotspot_count,
            "algorithm":    "DBSCAN (haversine, sklearn)",
        },
        "forecast_model": {
            "status":       _status(forecast_last, forecast_count),
            "last_trained": forecast_last.isoformat() if forecast_last else None,
            "points":       forecast_count,
            "algorithm":    "Prophet (Meta) + linear fallback",
        },
        "anomaly_model": {
            "status":       _status(anomaly_last, anomaly_count),
            "last_trained": anomaly_last.isoformat() if anomaly_last else None,
            "detections":   anomaly_count,
            "algorithm":    "Isolation Forest + Z-score (sklearn)",
        },
        "schedule":   "Daily at 03:00 UTC via Celery beat",
        "retrain_endpoint": "/api/v1/ml/run",
    }


# ── POST /ml/run (Admin) — inline ML run, no Celery needed ───────────────────

@router.post("/run")
async def run_ml_pipeline(
    city: str = Query(default="chicago"),
    pipeline: str = Query(default="all", description="all | hotspots | forecast | anomalies"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """
    Directly execute the ML pipeline inline (no Celery worker needed).
    Useful for testing and manual runs. Admin-only.
    Runs DBSCAN hotspot clustering, Prophet forecasting, and Isolation Forest anomaly detection.
    """
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    from app.services.ml_service import (
        run_hotspot_detection,
        run_forecast,
        run_anomaly_detection,
    )

    result: dict = {"city": city, "pipeline": pipeline}

    try:
        if pipeline in ("all", "hotspots"):
            hotspots = await run_hotspot_detection(db, city)
            result["hotspots"] = {"count": len(hotspots), "status": "ok"}

        if pipeline in ("all", "forecast"):
            forecasts = await run_forecast(db, city)
            result["forecast"] = {"count": len(forecasts), "status": "ok"}

        if pipeline in ("all", "anomalies"):
            anomalies = await run_anomaly_detection(db, city)
            result["anomalies"] = {"count": len(anomalies), "status": "ok"}

        result["status"] = "complete"
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML pipeline error: {e}")

    return result


# ── POST /ml/retrain (Admin) — queues Celery task ─────────────────────────────

@router.post("/retrain")
async def trigger_retrain(
    city: str = Query(default="chicago"),
    user: User = Depends(get_current_user),
) -> dict:
    """Admin-only: queue ML retrain via Celery worker (async)."""
    if not user.is_superuser:
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        from app.tasks.etl_tasks import retrain_ml_models_task
        task = retrain_ml_models_task.delay(city)
        return {"task_id": task.id, "city": city, "status": "queued",
                "note": "Use /ml/run for immediate synchronous execution"}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Celery unavailable: {e}. Use /ml/run instead.")
