"""CrimeScope schemas package."""
from app.schemas.common import ErrorResponse, MessageResponse, PaginatedResponse
from app.schemas.crime import (
    CrimeFilterParams,
    CrimeIncidentCreate,
    CrimeIncidentGeoJSON,
    CrimeIncidentRead,
    CrimeSummaryStats,
)
from app.schemas.user import (
    AlertCreate,
    AlertRead,
    AlertUpdate,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserRead,
    UserUpdate,
)
from app.schemas.analytics import (
    AnomalyRead,
    DashboardStats,
    DistrictRanking,
    ForecastRead,
    HotspotRead,
    TimePatternItem,
)

__all__ = [
    "PaginatedResponse", "ErrorResponse", "MessageResponse",
    "CrimeIncidentCreate", "CrimeIncidentRead", "CrimeIncidentGeoJSON",
    "CrimeFilterParams", "CrimeSummaryStats",
    "RegisterRequest", "LoginRequest", "TokenResponse",
    "ForgotPasswordRequest", "ResetPasswordRequest",
    "UserRead", "UserUpdate",
    "AlertCreate", "AlertRead", "AlertUpdate",
    "DashboardStats", "TimePatternItem", "DistrictRanking",
    "HotspotRead", "ForecastRead", "AnomalyRead",
]
