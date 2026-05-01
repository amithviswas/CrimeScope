"""
CrimeScope — Forecast Model
Table: forecasts — Prophet time-series predictions
"""
import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    city: Mapped[str | None] = mapped_column(String(100), index=True)
    category: Mapped[str | None] = mapped_column(String(100), index=True)
    district: Mapped[str | None] = mapped_column(String(100))

    forecast_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    predicted_count: Mapped[int | None] = mapped_column(Integer)
    lower_bound: Mapped[int | None] = mapped_column(Integer)
    upper_bound: Mapped[int | None] = mapped_column(Integer)
    confidence: Mapped[float | None] = mapped_column(Numeric(5, 4))

    model_version: Mapped[str | None] = mapped_column(String(50))

    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<Forecast city={self.city} date={self.forecast_date} predicted={self.predicted_count}>"
