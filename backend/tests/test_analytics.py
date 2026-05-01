"""
CrimeScope — Analytics Endpoint Tests
"""
import pytest
from datetime import UTC, datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.crime import CrimeIncident
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan


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


async def _seed(db: AsyncSession, city: str = "chicago", n: int = 5):
    for i in range(n):
        db.add(CrimeIncident(
            external_id=f"a_{city}_{i}",
            city=city, category="THEFT" if i % 3 == 0 else "ASSAULT",
            latitude=41.87 + i * 0.001, longitude=-87.62,
            district="LOOP" if i % 2 == 0 else "NORTH",
            occurred_at=datetime.now(UTC), source_api="test",
        ))
    await db.commit()


def _hdrs(user: User) -> dict:
    t = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    return {"Authorization": f"Bearer {t}"}


@pytest.mark.asyncio
async def test_dashboard_stats(client: AsyncClient, db_session: AsyncSession):
    """Dashboard endpoint returns expected keys."""
    user = await _make_user(db_session, "dash@example.com")
    await _seed(db_session, "chicago", 5)

    resp = await client.get("/api/v1/analytics/dashboard?city=chicago&period=30d", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert "total_incidents" in data
    assert "change_pct" in data
    assert "top_category" in data
    assert "stats_by_category" in data
    assert isinstance(data["stats_by_category"], list)


@pytest.mark.asyncio
async def test_category_breakdown(client: AsyncClient, db_session: AsyncSession):
    """Category breakdown returns list with pct fields."""
    user = await _make_user(db_session, "catbreak@example.com")
    await _seed(db_session, "chicago", 6)

    resp = await client.get("/api/v1/analytics/category-breakdown?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    total_pct = sum(d["pct"] for d in data)
    assert abs(total_pct - 100.0) < 0.5  # should sum to ~100%


@pytest.mark.asyncio
async def test_top_locations(client: AsyncClient, db_session: AsyncSession):
    """Top locations returns list."""
    user = await _make_user(db_session, "toploc@example.com")
    await _seed(db_session, "chicago", 5)

    resp = await client.get("/api/v1/analytics/top-locations?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_trends_free_user_blocked(client: AsyncClient, db_session: AsyncSession):
    """Free user cannot access trends (Pro+ only)."""
    user = await _make_user(db_session, "freetrend@example.com", plan=UserPlan.FREE)
    resp = await client.get("/api/v1/analytics/trends?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_trends_pro_user(client: AsyncClient, db_session: AsyncSession):
    """Pro user can access trends."""
    user = await _make_user(db_session, "protrend@example.com", plan=UserPlan.PRO)
    await _seed(db_session, "chicago", 3)

    resp = await client.get("/api/v1/analytics/trends?city=chicago&period=30d", headers=_hdrs(user))
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_hourly_pattern_pro(client: AsyncClient, db_session: AsyncSession):
    """Hourly pattern returns list with hour keys."""
    user = await _make_user(db_session, "hourly@example.com", plan=UserPlan.PRO)
    await _seed(db_session, "chicago", 5)

    resp = await client.get("/api/v1/analytics/hourly-pattern?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        assert "hour" in data[0]
        assert "count" in data[0]


@pytest.mark.asyncio
async def test_weekly_pattern_pro(client: AsyncClient, db_session: AsyncSession):
    """Weekly pattern returns list with day fields."""
    user = await _make_user(db_session, "weekly@example.com", plan=UserPlan.PRO)
    await _seed(db_session, "chicago", 5)

    resp = await client.get("/api/v1/analytics/weekly-pattern?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    if data:
        assert "day" in data[0]
        assert "day_name" in data[0]
