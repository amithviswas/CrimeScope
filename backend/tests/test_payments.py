"""
CrimeScope — Payments & Plan Gating Tests
Tests webhook handlers, plan gating, checkout validation.
"""
import json
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan


async def _make_user(db: AsyncSession, email: str, plan: UserPlan = UserPlan.FREE,
                     stripe_customer_id: str | None = None) -> User:
    user = User(
        email=email, full_name="Tester",
        hashed_password=hash_password("Secure#123"),
        is_verified=True, is_active=True, plan=plan,
    )
    db.add(user)
    await db.flush()
    sub = Subscription(
        user_id=user.id,
        plan=PlanTier(plan.value),
        status=SubscriptionStatus.ACTIVE,
        stripe_customer_id=stripe_customer_id,
    )
    db.add(sub)
    await db.commit()
    await db.refresh(user)
    return user


def _hdrs(user: User) -> dict:
    t = create_access_token({"sub": str(user.id), "email": user.email, "plan": user.plan.value})
    return {"Authorization": f"Bearer {t}"}


# ── GET /payments/plans ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_plans_no_auth(client: AsyncClient):
    """Plans endpoint is public — no auth required."""
    resp = await client.get("/api/v1/payments/plans")
    assert resp.status_code == 200
    plans = resp.json()
    assert len(plans) == 3
    plan_ids = [p["id"] for p in plans]
    assert "free" in plan_ids
    assert "pro" in plan_ids
    assert "enterprise" in plan_ids


@pytest.mark.asyncio
async def test_plan_pro_has_features(client: AsyncClient):
    """Pro plan includes ML features in feature list."""
    resp = await client.get("/api/v1/payments/plans")
    pro = next(p for p in resp.json() if p["id"] == "pro")
    feature_text = " ".join(pro["features"]).lower()
    assert "hotspot" in feature_text or "ml" in feature_text or "forecast" in feature_text


# ── GET /payments/subscription ────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_subscription_free_user(client: AsyncClient, db_session: AsyncSession):
    """Free user returns free plan subscription object."""
    user = await _make_user(db_session, "subget@example.com")
    resp = await client.get("/api/v1/payments/subscription", headers=_hdrs(user))
    assert resp.status_code == 200
    assert resp.json()["plan"] == "free"


# ── Plan gating ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_free_user_blocked_from_pro_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Free user gets 403 + upgrade_url on Pro endpoint."""
    user = await _make_user(db_session, "gate_free@example.com", plan=UserPlan.FREE)
    resp = await client.get("/api/v1/ml/hotspots?city=chicago", headers=_hdrs(user))
    assert resp.status_code == 403
    detail = resp.json()["detail"]
    assert detail["error"] == "plan_required"
    assert detail["required_plan"] == "pro"
    assert "/pricing" in detail["upgrade_url"]


@pytest.mark.asyncio
async def test_pro_user_can_access_pro_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Pro user gets 200 on Pro-only endpoint."""
    user = await _make_user(db_session, "gate_pro@example.com", plan=UserPlan.PRO)
    resp = await client.get("/api/v1/ml/hotspots?city=chicago", headers=_hdrs(user))
    # 200 OR empty list — but NOT 403
    assert resp.status_code != 403


@pytest.mark.asyncio
async def test_enterprise_user_can_access_pro_endpoint(client: AsyncClient, db_session: AsyncSession):
    """Enterprise user (higher rank) can access Pro endpoints."""
    user = await _make_user(db_session, "gate_ent@example.com", plan=UserPlan.ENTERPRISE)
    resp = await client.get("/api/v1/ml/hotspots?city=chicago", headers=_hdrs(user))
    assert resp.status_code != 403


# ── POST /payments/checkout ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_checkout_enterprise_rejected(client: AsyncClient, db_session: AsyncSession):
    """Enterprise plan checkout returns 400 — must contact sales."""
    user = await _make_user(db_session, "ent_checkout@example.com")
    resp = await client.post("/api/v1/payments/checkout",
                             json={"plan": "enterprise", "billing_cycle": "monthly"},
                             headers=_hdrs(user))
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_checkout_already_subscribed(client: AsyncClient, db_session: AsyncSession):
    """User already on Pro gets 400 when trying to subscribe again."""
    user = await _make_user(db_session, "already_sub@example.com", plan=UserPlan.PRO)
    resp = await client.post("/api/v1/payments/checkout",
                             json={"plan": "pro", "billing_cycle": "monthly"},
                             headers=_hdrs(user))
    assert resp.status_code == 400


# ── Webhook signature check ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_webhook_invalid_signature(client: AsyncClient):
    """Invalid Stripe signature returns 400."""
    resp = await client.post(
        "/api/v1/payments/webhook",
        content=b'{"type":"customer.subscription.created"}',
        headers={
            "Content-Type": "application/json",
            "stripe-signature": "invalid_signature",
        },
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_webhook_missing_signature(client: AsyncClient):
    """Missing stripe-signature header returns 400."""
    resp = await client.post(
        "/api/v1/payments/webhook",
        content=b'{"type":"test"}',
        headers={"Content-Type": "application/json"},
    )
    assert resp.status_code == 400
