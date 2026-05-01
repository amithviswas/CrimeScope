"""
CrimeScope — Crime Incident Model (updated for backend-spec.md)
Table: crime_incidents
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class CrimeIncident(Base):
    """
    Core crime incident record.
    Ingested from city open data APIs (Chicago Data Portal, NYC OpenData, LA Open Data).
    """
    __tablename__ = "crime_incidents"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Source tracking
    external_id: Mapped[str | None] = mapped_column(
        String(255), unique=True, index=True, nullable=True
    )
    city: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    source_api: Mapped[str | None] = mapped_column(String(100))  # e.g. "chicago_data_portal"

    # Crime details
    category: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subcategory: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)

    # Location — required, must have lat/lng
    latitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    longitude: Mapped[float] = mapped_column(Numeric(9, 6), nullable=False)
    location_name: Mapped[str | None] = mapped_column(String(255))
    district: Mapped[str | None] = mapped_column(String(100), index=True)
    neighborhood: Mapped[str | None] = mapped_column(String(100))

    # Temporal
    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    reported_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Status
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)

    # Raw source record (for re-processing)
    raw_data: Mapped[dict | None] = mapped_column(JSONB)

    # Audit
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_crime_incidents_city_occurred", "city", "occurred_at"),
        Index("ix_crime_incidents_city_district", "city", "district"),
        Index("ix_crime_incidents_lat_lng", "latitude", "longitude"),
    )

    def __repr__(self) -> str:
        return f"<CrimeIncident id={self.id} city={self.city} category={self.category}>"
