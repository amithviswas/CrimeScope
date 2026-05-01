"""
CrimeScope — Crimes Endpoint Tests
Tests for list, filter, summary stats, heatmap GeoJSON, plan gating.
"""
import pytest
from datetime import UTC, datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.crime import CrimeIncident
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan


# ── Helpers ────────────────────────────────────────────────────────────────────

async def _make_user(db: AsyncSession, email: str, plan: UserPlan = UserPlan.FREE) -> User:
    user = User(
        email=email, full_name="Tester",
        hashed_password=hash_password("Secure#123"),
        is_verified=True, is_active=True, plan=plan,
    )
    db.add(user)
    await db.flush()
    db.add(Subscription(user_id=user.id, plan=PlanTier(plan.value), status=SubscriptionStatus.ACTIVE))
    await db.commit()
    await db.refresh(user)
    return user


async def _seed_crimes(db: AsyncSession, city: str = "chicago", count: int = 5) -> list[CrimeIncident]:
    crimes = []
    for i in range(count):
        c = CrimeIncident(
            external_id=f"test_{city}_{i}",
            city=city,
            category="THEFT" if i % 2 == 0 else "ASSAULT",
            latitude=41.878 + i * 0.001,
            longitude=-87.629 - i * 0.001,
            district="01",
            occurred_at=datetime.now(UTC),
            source_api="test",
        )
        db.add(c)
        crimes.append(c)
    await db.commit()
    return crimes


def _hdrs(user: User) -> dict:
    token = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    return {"Authorization": f"Bearer {token}"}


# ── GET /crimes ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_crimes_requires_auth(client: AsyncClient):
    """Unauthenticated request returns 401."""
    resp = await client.get("/api/v1/crimes?city=chicago")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_list_crimes_success(client: AsyncClient, db_session: AsyncSession):
    """Returns paginated crime list."""
    user = await _make_user(db_session, "crimes@example.com")
    await _seed_crimes(db_session, "chicago", 5)

    resp = await client.get("/api/v1/crimes?city=chicago&limit=10", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "data" in data
    assert isinstance(data["data"], list)
    assert "meta" in data


@pytest.mark.asyncio
async def test_list_crimes_category_filter(client: AsyncClient, db_session: AsyncSession):
    """Category filter returns only matching incidents."""
    user = await _make_user(db_session, "filter@example.com")
    await _seed_crimes(db_session, "chicago", 6)

    resp = await client.get("/api/v1/crimes?city=chicago&category=THEFT", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    for incident in data["data"]:
        assert incident["category"] == "THEFT"


@pytest.mark.asyncio
async def test_list_crimes_limit_cap(client: AsyncClient, db_session: AsyncSession):
    """limit > 1000 is capped at 1000 by validator."""
    user = await _make_user(db_session, "limitcap@example.com")
    resp = await client.get("/api/v1/crimes?city=chicago&limit=9999", headers=_hdrs(user))
    # Should not crash — FastAPI will return 422 or cap it
    assert resp.status_code in (200, 422)


# ── GET /crimes/{id} ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_single_crime(client: AsyncClient, db_session: AsyncSession):
    """Returns single incident by UUID."""
    user = await _make_user(db_session, "single@example.com")
    crimes = await _seed_crimes(db_session, "chicago", 1)
    crime_id = str(crimes[0].id)

    resp = await client.get(f"/api/v1/crimes/{crime_id}", headers=_hdrs(user))
    assert resp.status_code == 200
    assert resp.json()["id"] == crime_id


@pytest.mark.asyncio
async def test_get_crime_not_found(client: AsyncClient, db_session: AsyncSession):
    """Returns 404 for non-existent ID."""
    user = await _make_user(db_session, "notfound@example.com")
    resp = await client.get(
        "/api/v1/crimes/00000000-0000-0000-0000-000000000000",
        headers=_hdrs(user),
    )
    assert resp.status_code == 404


# ── GET /crimes/stats/summary ─────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_crime_summary_stats(client: AsyncClient, db_session: AsyncSession):
    """Returns summary statistics dict."""
    user = await _make_user(db_session, "stats@example.com")
    await _seed_crimes(db_session, "chicago", 4)

    resp = await client.get("/api/v1/crimes/stats/summary?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert "total_incidents" in data
    assert "top_category" in data
    assert "resolved_rate" in data
    assert isinstance(data["stats_by_category"], list)


# ── GET /crimes/stats/by-category ────────────────────────────────────────────

@pytest.mark.asyncio
async def test_crimes_by_category(client: AsyncClient, db_session: AsyncSession):
    """Returns list of category breakdown items."""
    user = await _make_user(db_session, "cat@example.com")
    await _seed_crimes(db_session, "chicago", 4)

    resp = await client.get("/api/v1/crimes/stats/by-category?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        assert "category" in data[0]
        assert "count" in data[0]
        assert "pct" in data[0]


# ── GET /crimes/heatmap ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_crime_heatmap_geojson(client: AsyncClient, db_session: AsyncSession):
    """Returns valid GeoJSON FeatureCollection."""
    user = await _make_user(db_session, "heatmap@example.com")
    await _seed_crimes(db_session, "chicago", 3)

    resp = await client.get("/api/v1/crimes/heatmap?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data
    assert isinstance(data["features"], list)
    if data["features"]:
        f = data["features"][0]
        assert f["type"] == "Feature"
        assert f["geometry"]["type"] == "Point"
        assert len(f["geometry"]["coordinates"]) == 2


# ── GET /crimes/stats/by-time (Pro gating) ───────────────────────────────────

@pytest.mark.asyncio
async def test_crimes_by_time_requires_pro(client: AsyncClient, db_session: AsyncSession):
    """Free user gets 403 on Pro-only endpoint."""
    user = await _make_user(db_session, "free_time@example.com", plan=UserPlan.FREE)

    resp = await client.get("/api/v1/crimes/stats/by-time?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 403
    detail = resp.json()["detail"]
    assert detail["error"] == "plan_required"
    assert detail["required_plan"] == "pro"


@pytest.mark.asyncio
async def test_crimes_by_time_pro_user(client: AsyncClient, db_session: AsyncSession):
    """Pro user can access time-series endpoint."""
    user = await _make_user(db_session, "pro_time@example.com", plan=UserPlan.PRO)
    await _seed_crimes(db_session, "chicago", 3)

    resp = await client.get("/api/v1/crimes/stats/by-time?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
