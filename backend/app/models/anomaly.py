"""
CrimeScope — Anomaly Model
Table: anomalies — Isolation Forest detected anomalies
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Anomaly(Base):
    __tablename__ = "anomalies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    city: Mapped[str | None] = mapped_column(String(100), index=True)
    district: Mapped[str | None] = mapped_column(String(100))
    category: Mapped[str | None] = mapped_column(String(100))

    detected_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

    # Severity: 'low', 'medium', 'high', 'critical'
    severity: Mapped[str | None] = mapped_column(String(20))

    actual_count: Mapped[int | None] = mapped_column(Integer)
    expected_count: Mapped[int | None] = mapped_column(Integer)
    deviation_pct: Mapped[float | None] = mapped_column(Numeric(8, 2))

    description: Mapped[str | None] = mapped_column(Text)

    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    def __repr__(self) -> str:
        return f"<Anomaly city={self.city} district={self.district} severity={self.severity}>"
