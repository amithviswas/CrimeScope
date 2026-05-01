"""
CrimeScope — Analytics Pydantic Schemas
"""
from datetime import date
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class DashboardStats(BaseModel):
    period: str
    total_incidents: int
    change_pct: float
    top_category: str
    safest_district: str | None
    highest_district: str | None
    resolved_rate: float
    stats_by_category: list[dict]


class TimePatternItem(BaseModel):
    hour: int | None = None
    day_of_week: int | None = None
    count: int


class DistrictRanking(BaseModel):
    district: str
    total: int
    change_pct: float | None
    top_category: str | None


class HotspotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    city: str | None
    cluster_id: int | None
    center_lat: float | None
    center_lng: float | None
    radius_m: float | None
    incident_count: int | None
    risk_score: float | None
    categories: dict | None


class ForecastPoint(BaseModel):
    date: date
    predicted: int
    lower: int
    upper: int


class ForecastRead(BaseModel):
    city: str
    category: str | None
    district: str | None
    forecast: list[ForecastPoint]


class AnomalyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    city: str | None
    district: str | None
    category: str | None
    severity: str | None
    actual_count: int | None
    expected_count: int | None
    deviation_pct: float | None
    description: str | None
    is_resolved: bool
