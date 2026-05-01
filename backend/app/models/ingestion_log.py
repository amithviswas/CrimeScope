"""
CrimeScope — IngestionLog Model
Table: data_ingestion_logs — ETL pipeline run history
"""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.core.database import Base


class IngestionLog(Base):
    __tablename__ = "data_ingestion_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    source: Mapped[str | None] = mapped_column(String(100))   # e.g. "chicago_data_portal"
    city: Mapped[str | None] = mapped_column(String(100), index=True)

    records_fetched: Mapped[int | None] = mapped_column(Integer)
    records_inserted: Mapped[int | None] = mapped_column(Integer)
    records_skipped: Mapped[int | None] = mapped_column(Integer)

    # 'success', 'partial', 'failed'
    status: Mapped[str | None] = mapped_column(String(50))
    error_msg: Mapped[str | None] = mapped_column(Text)

    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    def __repr__(self) -> str:
        return f"<IngestionLog source={self.source} city={self.city} status={self.status}>"
