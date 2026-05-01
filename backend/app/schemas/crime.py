"""
CrimeScope — Crime Incident Pydantic Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator


class CrimeIncidentBase(BaseModel):
    city: str
    category: str
    subcategory: str | None = None
    description: str | None = None
    latitude: float
    longitude: float
    location_name: str | None = None
    district: str | None = None
    neighborhood: str | None = None
    occurred_at: datetime
    reported_at: datetime | None = None
    resolved: bool = False
    source_api: str | None = None


class CrimeIncidentCreate(CrimeIncidentBase):
    external_id: str | None = None
    raw_data: dict | None = None

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not (-90 <= v <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not (-180 <= v <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v


class CrimeIncidentRead(CrimeIncidentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    external_id: str | None = None
    created_at: datetime


class CrimeIncidentGeoJSON(BaseModel):
    """GeoJSON Feature for Mapbox heatmap / cluster layers."""
    type: str = "Feature"
    geometry: dict
    properties: dict


class CrimeFilterParams(BaseModel):
    """Query parameters for GET /crimes endpoint."""
    city: str = "chicago"
    start_date: str | None = None
    end_date: str | None = None
    category: str | None = None
    district: str | None = None
    lat: float | None = None
    lng: float | None = None
    radius_m: int = 1000
    limit: int = 100
    offset: int = 0

    @field_validator("limit")
    @classmethod
    def cap_limit(cls, v: int) -> int:
        return min(v, 1000)


class CrimeSummaryStats(BaseModel):
    """Dashboard summary statistics."""
    period: str
    total_incidents: int
    change_pct: float
    top_category: str
    safest_district: str | None
    highest_district: str | None
    resolved_rate: float
    stats_by_category: list[dict]
