"""
CrimeScope — Time-Series Forecasting (Prophet)
Predicts daily crime counts for a city/category/district over 30 days.
Falls back to simple linear regression if Prophet is not installed.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class ForecastPoint:
    forecast_date: date
    predicted_count: int
    lower_bound: int
    upper_bound: int
    confidence: float


def build_time_series(incidents: list[dict[str, Any]]) -> list[dict]:
    """
    Aggregate daily incident counts from a list of incidents.
    Each incident must have 'occurred_at' (datetime or str).
    Returns list of {'ds': date_str, 'y': count}.
    """
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

    return [{"ds": d, "y": c} for d, c in sorted(daily.items())]


def forecast_prophet(
    incidents: list[dict[str, Any]],
    horizon_days: int = 30,
    city: str = "unknown",
) -> list[ForecastPoint]:
    """
    Use Facebook Prophet for time-series forecasting.
    Automatically handles weekly and yearly seasonality.
    """
    ts_data = build_time_series(incidents)

    if len(ts_data) < 14:
        logger.warning(f"Not enough data for Prophet forecast ({len(ts_data)} days)")
        return _linear_fallback(ts_data, horizon_days)

    try:
        import pandas as pd
        from prophet import Prophet

        df = pd.DataFrame(ts_data)
        df["ds"] = pd.to_datetime(df["ds"])
        df["y"] = df["y"].astype(float)

        model = Prophet(
            changepoint_prior_scale=0.05,
            seasonality_mode="additive",
            weekly_seasonality=True,
            yearly_seasonality=len(ts_data) > 180,  # Only if enough history
            daily_seasonality=False,
            interval_width=0.80,
        )
        model.fit(df, algorithm="LBFGS")

        future = model.make_future_dataframe(periods=horizon_days)
        forecast = model.predict(future)

        # Extract future rows only
        result_df = forecast[forecast["ds"] > df["ds"].max()].tail(horizon_days)

        points: list[ForecastPoint] = []
        for _, row in result_df.iterrows():
            pred = max(0, int(round(row["yhat"])))
            lo   = max(0, int(round(row["yhat_lower"])))
            hi   = max(0, int(round(row["yhat_upper"])))
            conf = min(0.95, max(0.5, 1.0 - abs(hi - lo) / (pred + 1) * 0.1))

            points.append(ForecastPoint(
                forecast_date=row["ds"].date(),
                predicted_count=pred,
                lower_bound=lo,
                upper_bound=hi,
                confidence=round(conf, 4),
            ))

        logger.info(f"Prophet forecast generated {len(points)} points for {city}")
        return points

    except ImportError:
        logger.warning("Prophet not installed — falling back to linear regression")
        return _linear_fallback(ts_data, horizon_days)
    except Exception as e:
        logger.error(f"Prophet forecast failed: {e}")
        return _linear_fallback(ts_data, horizon_days)


def _linear_fallback(ts_data: list[dict], horizon_days: int) -> list[ForecastPoint]:
    """
    Simple linear regression fallback when Prophet is unavailable.
    """
    if not ts_data:
        return []

    n = len(ts_data)
    x = np.arange(n, dtype=float)
    y = np.array([d["y"] for d in ts_data], dtype=float)

    if n >= 2:
        slope, intercept = np.polyfit(x, y, 1)
    else:
        slope, intercept = 0.0, float(y[0]) if len(y) else 0.0

    avg = float(y.mean()) if len(y) else 0.0
    std = float(y.std())  if len(y) else 1.0

    try:
        last_date = date.fromisoformat(ts_data[-1]["ds"])
    except Exception:
        last_date = date.today()

    points: list[ForecastPoint] = []
    for i in range(1, horizon_days + 1):
        pred = max(0, int(round(intercept + slope * (n + i))))
        margin = max(1, int(std * 1.5))
        points.append(ForecastPoint(
            forecast_date=last_date + timedelta(days=i),
            predicted_count=pred,
            lower_bound=max(0, pred - margin),
            upper_bound=pred + margin,
            confidence=0.65,
        ))

    return points
