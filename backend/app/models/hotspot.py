"""
CrimeScope — Hotspot Model
Table: hotspots — ML-generated crime cluster hotspots (DBSCAN output)
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Hotspot(Base):
    __tablename__ = "hotspots"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    city: Mapped[str | None] = mapped_column(String(100), index=True)
    cluster_id: Mapped[int | None] = mapped_column(Integer)

    # Cluster center
    center_lat: Mapped[float | None] = mapped_column(Numeric(9, 6))
    center_lng: Mapped[float | None] = mapped_column(Numeric(9, 6))
    radius_m: Mapped[float | None] = mapped_column(Numeric(8, 2))

    # Stats
    incident_count: Mapped[int | None] = mapped_column(Integer)
    risk_score: Mapped[float | None] = mapped_column(Numeric(5, 2))  # 0.0 – 10.0

    # Category breakdown e.g. {"ASSAULT": 12, "THEFT": 8}
    categories: Mapped[dict | None] = mapped_column(JSONB)

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<Hotspot city={self.city} cluster={self.cluster_id} score={self.risk_score}>"
