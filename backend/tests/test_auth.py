"""
CrimeScope — Auth Endpoint Tests (Phase 6)

Run: docker compose exec backend pytest tests/test_auth.py -v
"""
import pytest
from httpx import AsyncClient

from app.core.security import create_access_token
from app.models.user import User, UserPlan
from app.core.database import AsyncSessionLocal


# ── Fixtures ──────────────────────────────────────────────────────────────────

TEST_EMAIL    = "testuser_auth@crimescope.test"
TEST_PASSWORD = "SecurePass#123"
TEST_NAME     = "Test User"


@pytest.fixture(scope="function")
async def client():
    from app.main import app
    async with AsyncClient(app=app, base_url="http://test") as c:
        yield c


@pytest.fixture(scope="function")
async def verified_user(client: AsyncClient):
    """Create and verify a test user, return the User ORM object."""
    await client.post("/api/v1/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASSWORD, "full_name": TEST_NAME,
    })
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == TEST_EMAIL))
        user = result.scalar_one_or_none()
        assert user, "User not created"
        user.is_verified = True
        await db.commit()
        await db.refresh(user)
        return user


# ── Register ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    res = await client.post("/api/v1/auth/register", json={
        "email": "register_new@crimescope.test", "password": TEST_PASSWORD, "full_name": "New User",
    })
    assert res.status_code == 201


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, verified_user):
    res = await client.post("/api/v1/auth/register", json={
        "email": TEST_EMAIL, "password": TEST_PASSWORD, "full_name": TEST_NAME,
    })
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    res = await client.post("/api/v1/auth/register", json={
        "email": "weak@crimescope.test", "password": "abc", "full_name": "Weak",
    })
    assert res.status_code == 422


# ── Login ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, verified_user):
    res = await client.post("/api/v1/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, verified_user):
    res = await client.post("/api/v1/auth/login", json={"email": TEST_EMAIL, "password": "WrongPass#999"})
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_unverified_user(client: AsyncClient):
    email = "unverified@crimescope.test"
    await client.post("/api/v1/auth/register", json={"email": email, "password": TEST_PASSWORD, "full_name": "Unverified"})
    res = await client.post("/api/v1/auth/login", json={"email": email, "password": TEST_PASSWORD})
    assert res.status_code == 403


# ── /auth/me ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, verified_user):
    token = create_access_token({"sub": str(verified_user.id), "email": TEST_EMAIL, "plan": "free"})
    res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == TEST_EMAIL


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


# ── Logout ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_logout_blacklists_token(client: AsyncClient, verified_user):
    token = create_access_token({"sub": str(verified_user.id), "email": TEST_EMAIL, "plan": "free"})
    headers = {"Authorization": f"Bearer {token}"}
    await client.post("/api/v1/auth/logout", headers=headers)
    res = await client.get("/api/v1/auth/me", headers=headers)
    assert res.status_code == 401


# ── Forgot / Reset Password ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_forgot_password_sends_email(client: AsyncClient, verified_user):
    res = await client.post("/api/v1/auth/forgot-password", json={"email": TEST_EMAIL})
    assert res.status_code == 200
    res2 = await client.post("/api/v1/auth/forgot-password", json={"email": "nonexistent@fake.test"})
    assert res2.status_code == 200  # always 200 — no user enumeration


@pytest.mark.asyncio
async def test_reset_password_expired_token(client: AsyncClient):
    res = await client.post("/api/v1/auth/reset-password", json={
        "token": "invalidtoken123", "new_password": "NewSecure#999",
    })
    assert res.status_code == 400


# ── Plan Gating ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_plan_gating_free_user(client: AsyncClient, verified_user):
    token = create_access_token({"sub": str(verified_user.id), "email": TEST_EMAIL, "plan": "free"})
    res = await client.get("/api/v1/ml/hotspots", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_plan_gating_pro_user(client: AsyncClient, verified_user):
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        result = await db.execute(select(User).where(User.email == TEST_EMAIL))
        u = result.scalar_one_or_none()
        if u:
            u.plan = UserPlan.PRO
            await db.commit()

    token = create_access_token({"sub": str(verified_user.id), "email": TEST_EMAIL, "plan": "pro"})
    res = await client.get("/api/v1/ml/hotspots", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
