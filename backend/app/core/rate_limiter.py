"""
CrimeScope — Rate Limiter (slowapi)
Per-endpoint limits per auth-spec.md:
  - POST /auth/login       → 5/minute
  - POST /auth/register    → 3/minute
  - POST /auth/forgot-*    → 3/hour
  - GET  /crimes           → 100/minute
  - All other endpoints    → 200/minute
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


# Key function: identify by IP address
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute"],
    headers_enabled=True,  # adds X-RateLimit-* headers to responses
)


def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Custom 429 response with JSON body instead of plain text."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": f"Too many requests. Limit: {exc.limit}",
            "retry_after": getattr(exc, "retry_after", 60),
        },
        headers={
            "Retry-After": str(getattr(exc, "retry_after", 60)),
            "X-RateLimit-Limit": str(exc.limit),
        },
    )
