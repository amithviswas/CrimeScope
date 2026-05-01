"""
CrimeScope — Anomaly Detection (Isolation Forest)
Identifies unusual crime spikes using statistical outlier detection.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Anomaly:
    city: str
    district: str
    category: str
    detected_at: datetime
    severity: str            # "low" | "medium" | "high" | "critical"
    actual_count: int
    expected_count: int
    deviation_pct: float
    description: str
    is_resolved: bool = False


def detect_anomalies(
    incidents: list[dict[str, Any]],
    city: str = "unknown",
    lookback_days: int = 90,
    recent_days: int = 7,
    contamination: float = 0.05,
) -> list[Anomaly]:
    """
    Detect unusual spikes using Isolation Forest + Z-score confirmation.

    Strategy:
    1. Build daily counts per (district, category) combination
    2. Train Isolation Forest on the historical window
    3. Flag recent days as anomalous if the model scores them as outliers
    4. Confirm with Z-score > 2.0 (avoids false positives)

    Returns:
        List of Anomaly objects sorted by deviation_pct descending
    """
    if not incidents:
        return []

    try:
        from sklearn.ensemble import IsolationForest
    except ImportError:
        logger.error("scikit-learn not installed — cannot run anomaly detection")
        return _statistical_fallback(incidents, city, recent_days)

    # ── Build daily counts per (district, category) ──────────────────────────
    daily: dict[tuple[str, str, str], dict[str, int]] = {}
    # key: (district, category, day_iso)

    cutoff = datetime.now(UTC) - timedelta(days=lookback_days)

    for inc in incidents:
        oc = inc.get("occurred_at")
        if isinstance(oc, str):
            try:
                oc = datetime.fromisoformat(oc.replace("Z", "+00:00"))
            except Exception:
                continue
        if not isinstance(oc, datetime) or oc < cutoff:
            continue

        district = str(inc.get("district") or "Unknown")
        category = str(inc.get("category") or "UNKNOWN")
        day = oc.date().isoformat()

        key = (district, category)
        if key not in daily:
            daily[key] = {}
        daily[key][day] = daily[key].get(day, 0) + 1

    if not daily:
        return []

    recent_cutoff = datetime.now(UTC) - timedelta(days=recent_days)
    anomalies: list[Anomaly] = []

    for (district, category), day_counts in daily.items():
        counts = list(day_counts.values())
        if len(counts) < 7:
            continue

        X = np.array(counts).reshape(-1, 1)

        try:
            iso = IsolationForest(
                contamination=contamination,
                random_state=42,
                n_estimators=100,
            )
            iso.fit(X[:-recent_days] if len(X) > recent_days else X)
            scores = iso.decision_function(X)
            preds  = iso.predict(X)
        except Exception as e:
            logger.warning(f"IsolationForest failed for {district}/{category}: {e}")
            continue

        # Z-score
        historical = X[:-recent_days].flatten() if len(X) > recent_days else X.flatten()
        mean = historical.mean()
        std  = historical.std() if historical.std() > 0 else 1.0

        # Check recent days
        recent_days_data = sorted(day_counts.items())[-recent_days:]
        for i, (day_str, actual) in enumerate(recent_days_data):
            idx = len(counts) - recent_days + i
            if idx < 0 or idx >= len(preds):
                continue

            z_score = (actual - mean) / std
            is_outlier = preds[idx] == -1 and z_score > 2.0

            if is_outlier:
                expected = max(1, int(round(mean)))
                deviation_pct = round((actual - expected) / expected * 100, 1)

                if deviation_pct < 30:
                    continue  # Only significant spikes

                if deviation_pct >= 100:
                    severity = "critical"
                elif deviation_pct >= 67:
                    severity = "high"
                elif deviation_pct >= 40:
                    severity = "medium"
                else:
                    severity = "low"

                anomalies.append(Anomaly(
                    city=city,
                    district=district,
                    category=category,
                    detected_at=datetime.now(UTC),
                    severity=severity,
                    actual_count=actual,
                    expected_count=expected,
                    deviation_pct=deviation_pct,
                    description=(
                        f"Unusual spike in {category} incidents in {district}. "
                        f"{actual} incidents detected vs. expected {expected} "
                        f"({deviation_pct:+.1f}% above historical average)."
                    ),
                ))

    anomalies.sort(key=lambda a: a.deviation_pct, reverse=True)
    logger.info(f"Detected {len(anomalies)} anomalies for {city}")
    return anomalies


def _statistical_fallback(
    incidents: list[dict[str, Any]],
    city: str,
    recent_days: int,
) -> list[Anomaly]:
    """Z-score only fallback when sklearn is unavailable."""
    daily: dict[str, int] = {}
    for inc in incidents:
        oc = inc.get("occurred_at")
        if isinstance(oc, datetime):
            day = oc.date().isoformat()
        elif isinstance(oc, str):
            day = oc[:10]
        else:
            continue
        daily[day] = daily.get(day, 0) + 1

    if len(daily) < 7:
        return []

    sorted_days = sorted(daily.items())
    counts = [c for _, c in sorted_days]
    hist = counts[:-recent_days]
    mean = np.mean(hist)
    std = np.std(hist) if np.std(hist) > 0 else 1.0

    anomalies: list[Anomaly] = []
    for day_str, count in sorted_days[-recent_days:]:
        z = (count - mean) / std
        if z > 2.0:
            expected = max(1, int(round(mean)))
            dev = round((count - expected) / expected * 100, 1)
            severity = "critical" if dev >= 100 else "high" if dev >= 67 else "medium" if dev >= 40 else "low"
            anomalies.append(Anomaly(
                city=city, district="All", category="ALL",
                detected_at=datetime.now(UTC), severity=severity,
                actual_count=count, expected_count=expected,
                deviation_pct=dev,
                description=f"Statistical anomaly detected citywide. {dev:+.1f}% above average.",
            ))

    return anomalies
