"""
CrimeScope — ML Service
Orchestrates hotspot, forecast, and anomaly pipelines.
Reads from DB, runs ML, writes results back to DB.
"""
from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ml.anomaly import detect_anomalies, Anomaly as AnomalyResult
from app.ml.forecast import forecast_prophet, ForecastPoint
from app.ml.hotspot import compute_hotspots, Hotspot as HotspotResult

logger = logging.getLogger(__name__)


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _fetch_incidents(
    db: AsyncSession,
    city: str,
    days: int = 90,
    category: str | None = None,
    district: str | None = None,
) -> list[dict[str, Any]]:
    """Fetch recent incidents for ML processing."""
    from app.models.crime import CrimeIncident
    from sqlalchemy import and_

    cutoff = datetime.now(UTC) - timedelta(days=days)
    conditions = [
        CrimeIncident.city == city,
        CrimeIncident.occurred_at >= cutoff,
    ]
    if category:
        conditions.append(CrimeIncident.category == category)
    if district:
        conditions.append(CrimeIncident.district == district)

    result = await db.execute(
        select(CrimeIncident)
        .where(and_(*conditions))
        .order_by(CrimeIncident.occurred_at)
    )
    incidents = result.scalars().all()

    return [
        {
            "latitude":    float(inc.latitude),
            "longitude":   float(inc.longitude),
            "category":    inc.category,
            "district":    inc.district or "Unknown",
            "occurred_at": inc.occurred_at,
        }
        for inc in incidents
    ]


# ── Hotspot pipeline ───────────────────────────────────────────────────────────

async def run_hotspot_detection(
    db: AsyncSession,
    city: str,
    eps_km: float = 0.3,
    min_samples: int = 10,
) -> list[dict[str, Any]]:
    """
    Run DBSCAN hotspot detection and upsert results into DB.
    Returns the list of hotspot dicts for immediate API response.
    """
    from app.models.hotspot import Hotspot

    incidents = await _fetch_incidents(db, city, days=30)
    if not incidents:
        logger.info(f"No incidents found for hotspot detection in {city}")
        return []

    results: list[HotspotResult] = compute_hotspots(incidents, eps_km=eps_km, min_samples=min_samples)

    # Clear old hotspots for this city
    await db.execute(delete(Hotspot).where(Hotspot.city == city))

    # Insert new results
    for r in results:
        db.add(Hotspot(
            city=city,
            cluster_id=r.cluster_id,
            center_lat=r.center_lat,
            center_lng=r.center_lng,
            radius_m=r.radius_m,
            incident_count=r.incident_count,
            risk_score=r.risk_score,
            categories=r.categories,
            generated_at=datetime.now(UTC),
        ))
    await db.commit()

    logger.info(f"Saved {len(results)} hotspots for {city}")
    return [
        {
            "cluster_id":     r.cluster_id,
            "center_lat":     r.center_lat,
            "center_lng":     r.center_lng,
            "radius_m":       r.radius_m,
            "incident_count": r.incident_count,
            "risk_score":     r.risk_score,
            "categories":     r.categories,
        }
        for r in results
    ]


# ── Forecast pipeline ──────────────────────────────────────────────────────────

async def run_forecast(
    db: AsyncSession,
    city: str,
    category: str | None = None,
    district: str | None = None,
    horizon_days: int = 30,
) -> list[dict[str, Any]]:
    """
    Run Prophet forecast and upsert results into DB.
    Returns forecast points as list of dicts.
    """
    from app.models.forecast import Forecast

    incidents = await _fetch_incidents(db, city, days=365, category=category, district=district)

    if len(incidents) < 14:
        logger.warning(f"Not enough data to forecast {city}/{category}/{district}")
        return []

    points: list[ForecastPoint] = forecast_prophet(incidents, horizon_days=horizon_days, city=city)

    # Clear old forecasts for this combination
    from sqlalchemy import and_
    from app.models.forecast import Forecast
    await db.execute(
        delete(Forecast).where(
            and_(
                Forecast.city == city,
                Forecast.category == (category or "ALL"),
                Forecast.district == (district or "ALL"),
            )
        )
    )

    for p in points:
        db.add(Forecast(
            city=city,
            category=category or "ALL",
            district=district or "ALL",
            forecast_date=p.forecast_date,
            predicted_count=p.predicted_count,
            lower_bound=p.lower_bound,
            upper_bound=p.upper_bound,
            confidence=p.confidence,
            model_version="prophet-1.0" if True else "linear-fallback",
            generated_at=datetime.now(UTC),
        ))
    await db.commit()

    logger.info(f"Saved {len(points)} forecast points for {city}/{category}/{district}")
    return [
        {
            "date":            p.forecast_date.isoformat(),
            "predicted_count": p.predicted_count,
            "lower_bound":     p.lower_bound,
            "upper_bound":     p.upper_bound,
            "confidence":      p.confidence,
        }
        for p in points
    ]


# ── Anomaly pipeline ───────────────────────────────────────────────────────────

async def run_anomaly_detection(
    db: AsyncSession,
    city: str,
    lookback_days: int = 90,
    recent_days: int = 7,
) -> list[dict[str, Any]]:
    """
    Run Isolation Forest anomaly detection and upsert results into DB.
    Returns detected anomalies as list of dicts.
    """
    from app.models.anomaly import Anomaly

    incidents = await _fetch_incidents(db, city, days=lookback_days)

    if not incidents:
        return []

    results: list[AnomalyResult] = detect_anomalies(
        incidents, city=city, lookback_days=lookback_days, recent_days=recent_days
    )

    # Clear unresolved anomalies older than 14 days
    stale_cutoff = datetime.now(UTC) - timedelta(days=14)
    await db.execute(
        delete(Anomaly).where(
            (Anomaly.city == city)
            & (Anomaly.detected_at < stale_cutoff)
            & (Anomaly.is_resolved == False)  # noqa: E712
        )
    )

    for r in results:
        db.add(Anomaly(
            city=r.city,
            district=r.district,
            category=r.category,
            detected_at=r.detected_at,
            severity=r.severity,
            actual_count=r.actual_count,
            expected_count=r.expected_count,
            deviation_pct=r.deviation_pct,
            description=r.description,
            is_resolved=False,
        ))
    await db.commit()

    logger.info(f"Saved {len(results)} anomalies for {city}")
    return [
        {
            "city":            r.city,
            "district":        r.district,
            "category":        r.category,
            "severity":        r.severity,
            "actual_count":    r.actual_count,
            "expected_count":  r.expected_count,
            "deviation_pct":   r.deviation_pct,
            "description":     r.description,
            "detected_at":     r.detected_at.isoformat(),
        }
        for r in results
    ]


# ── Full retraining run ────────────────────────────────────────────────────────

async def retrain_all(db: AsyncSession, cities: list[str] | None = None) -> dict[str, Any]:
    """Run the full ML pipeline for all cities. Called by Celery beat."""
    cities = cities or ["chicago", "nyc", "la"]
    summary: dict[str, Any] = {}

    for city in cities:
        logger.info(f"Starting ML pipeline for {city}")
        try:
            hotspots = await run_hotspot_detection(db, city)
            forecasts = await run_forecast(db, city)
            anomalies = await run_anomaly_detection(db, city)
            summary[city] = {
                "hotspots":  len(hotspots),
                "forecasts": len(forecasts),
                "anomalies": len(anomalies),
                "status":    "success",
            }
        except Exception as e:
            logger.error(f"ML pipeline failed for {city}: {e}")
            summary[city] = {"status": "error", "error": str(e)}

    return summary
