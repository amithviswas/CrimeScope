"""
CrimeScope — Admin Endpoint Tests
"""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan


async def _make_user(db: AsyncSession, email: str,
                     is_superuser: bool = False,
                     plan: UserPlan = UserPlan.FREE) -> User:
    user = User(
        email=email, full_name="Test",
        hashed_password=hash_password("Secure#123"),
        is_verified=True, is_active=True,
        is_superuser=is_superuser, plan=plan,
    )
    db.add(user)
    await db.flush()
    db.add(Subscription(user_id=user.id, plan=PlanTier.FREE, status=SubscriptionStatus.ACTIVE))
    await db.commit()
    await db.refresh(user)
    return user


def _hdrs(user: User) -> dict:
    t = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    return {"Authorization": f"Bearer {t}"}


@pytest.mark.asyncio
async def test_admin_users_requires_superuser(client: AsyncClient, db_session: AsyncSession):
    """Non-superuser gets 403 on admin endpoints."""
    user = await _make_user(db_session, "notadmin@example.com")
    resp = await client.get("/api/v1/admin/users", headers=_hdrs(user))
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_admin_users_unauthenticated(client: AsyncClient):
    """No auth returns 401 on admin endpoints."""
    resp = await client.get("/api/v1/admin/users")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_admin_users_superuser_access(client: AsyncClient, db_session: AsyncSession):
    """Superuser gets 200 and user list."""
    admin = await _make_user(db_session, "admin@example.com", is_superuser=True)
    resp = await client.get("/api/v1/admin/users", headers=_hdrs(admin))
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "data" in data
    assert isinstance(data["data"], list)


@pytest.mark.asyncio
async def test_admin_stats_superuser(client: AsyncClient, db_session: AsyncSession):
    """Superuser gets platform stats."""
    admin = await _make_user(db_session, "admin2@example.com", is_superuser=True)
    resp = await client.get("/api/v1/admin/stats", headers=_hdrs(admin))
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert "crime_data" in data
    assert "revenue" in data


@pytest.mark.asyncio
async def test_admin_ingestion_logs(client: AsyncClient, db_session: AsyncSession):
    """Superuser can view ingestion logs."""
    admin = await _make_user(db_session, "admin3@example.com", is_superuser=True)
    resp = await client.get("/api/v1/admin/ingestion-logs", headers=_hdrs(admin))
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert isinstance(data["data"], list)


@pytest.mark.asyncio
async def test_admin_users_search(client: AsyncClient, db_session: AsyncSession):
    """Search by email works."""
    admin = await _make_user(db_session, "admin4@example.com", is_superuser=True)
    await _make_user(db_session, "findme@example.com")

    resp = await client.get("/api/v1/admin/users?search=findme", headers=_hdrs(admin))
    assert resp.status_code == 200
    emails = [u["email"] for u in resp.json()["data"]]
    assert "findme@example.com" in emails
