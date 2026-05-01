"""
CrimeScope — Common Pydantic Schemas
Shared base types used across all routers.
"""
from datetime import datetime
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response envelope."""
    total: int
    data: list[T]
    meta: dict


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str


class MessageResponse(BaseModel):
    message: str


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    upgrade_url: str | None = None
