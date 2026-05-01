"""
CrimeScope — Payments Router
Full Stripe integration: plans, checkout, billing portal, cancel, webhook.

Webhook events handled:
  customer.subscription.created   → upgrade user plan to pro
  customer.subscription.updated   → sync status / cancel_at_period_end
  customer.subscription.deleted   → downgrade to free
  invoice.payment_succeeded        → confirm active status
  invoice.payment_failed           → send warning email
  customer.subscription.trial_will_end → send renewal reminder
"""
import logging
from datetime import UTC, datetime

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.subscription import Subscription, PlanTier, SubscriptionStatus
from app.models.user import User, UserPlan
from app.services import stripe_service
from app.services.payment_emails import (
    send_payment_failed_email,
    send_payment_succeeded_email,
    send_pro_welcome_email,
    send_renewal_reminder_email,
    send_subscription_ended_email,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["Payments"])


# ── Request models ────────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    plan: str = "pro"
    billing_cycle: str = "monthly"  # "monthly" | "annual"


# ── GET /payments/plans ───────────────────────────────────────────────────────

@router.get("/plans")
async def list_plans() -> list[dict]:
    """Return all available pricing plans — no auth required."""
    return [
        {
            "id": "free",
            "name": "Free",
            "price_monthly": 0,
            "price_annual": 0,
            "features": [
                "Up to 1,000 incidents/month",
                "3 cities",
                "Basic analytics",
                "1 alert rule",
                "CSV export (100 rows)",
            ],
            "limits": {"alerts": 1, "export_rows": 100, "cities": 3},
        },
        {
            "id": "pro",
            "name": "Pro",
            "price_monthly": 29,
            "price_annual": 278,
            "annual_savings": 70,
            "stripe_price_monthly": stripe_service.PLAN_PRICE_IDS.get("pro", {}).get("monthly"),
            "stripe_price_annual": stripe_service.PLAN_PRICE_IDS.get("pro", {}).get("annual"),
            "features": [
                "Unlimited incidents",
                "All cities",
                "ML hotspot detection",
                "30-day forecasting",
                "Anomaly alerts",
                "Hourly/weekly patterns",
                "5 alert rules",
                "Export 50,000 rows",
                "API access",
            ],
            "limits": {"alerts": 5, "export_rows": 50_000, "cities": "all"},
            "popular": True,
        },
        {
            "id": "enterprise",
            "name": "Enterprise",
            "price_monthly": None,
            "price_annual": None,
            "contact_sales": True,
            "features": [
                "Everything in Pro",
                "Unlimited alert rules",
                "Custom data integrations",
                "SLA guarantee",
                "Dedicated support",
                "Custom model training",
                "SSO / SAML",
            ],
        },
    ]


# ── POST /payments/checkout ───────────────────────────────────────────────────

@router.post("/checkout")
async def create_checkout(
    payload: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Create a Stripe Checkout session and return the hosted checkout URL."""
    if user.plan != UserPlan.FREE:
        raise HTTPException(
            status_code=400,
            detail="You already have an active subscription. Use the billing portal to make changes.",
        )

    if payload.plan == "enterprise":
        raise HTTPException(status_code=400, detail="Contact sales for Enterprise plans.")

    try:
        checkout_url = stripe_service.create_checkout_session(
            user, payload.plan, payload.billing_cycle
        )
        return {"checkout_url": checkout_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.StripeError as e:
        logger.error(f"Stripe error during checkout for user {user.id}: {e}")
        raise HTTPException(status_code=502, detail="Payment service error. Please try again.")


# ── POST /payments/portal ─────────────────────────────────────────────────────

@router.post("/portal")
async def create_portal(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Return Stripe Customer Portal URL for self-service billing management."""
    try:
        portal_url = stripe_service.create_billing_portal_session(user)
        return {"portal_url": portal_url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except stripe.StripeError as e:
        logger.error(f"Stripe portal error for user {user.id}: {e}")
        raise HTTPException(status_code=502, detail="Payment service error.")


# ── GET /payments/subscription ────────────────────────────────────────────────

@router.get("/subscription")
async def get_subscription(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Return the current user's subscription status and billing info."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    sub = result.scalar_one_or_none()

    if not sub:
        return {
            "plan": "free",
            "status": "active",
            "current_period_end": None,
            "cancel_at_period_end": False,
        }

    return {
        "plan": sub.plan.value,
        "status": sub.status.value,
        "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
        "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
        "cancel_at_period_end": sub.cancel_at_period_end,
        "stripe_customer_id": sub.stripe_customer_id,
    }


# ── POST /payments/cancel ─────────────────────────────────────────────────────

@router.post("/cancel")
async def cancel_subscription(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    """Cancel subscription at period end — user retains access until then."""
    result = await db.execute(
        select(Subscription).where(Subscription.user_id == user.id)
    )
    sub = result.scalar_one_or_none()

    if not sub or not sub.stripe_subscription_id:
        raise HTTPException(status_code=400, detail="No active subscription found")
    if sub.cancel_at_period_end:
        raise HTTPException(status_code=400, detail="Subscription is already set to cancel")

    try:
        stripe_sub = stripe_service.cancel_subscription_at_period_end(sub.stripe_subscription_id)
        sub.cancel_at_period_end = True
        sub.status = SubscriptionStatus.ACTIVE  # Still active until period ends
        await db.commit()

        period_end = datetime.fromtimestamp(
            stripe_sub.current_period_end, tz=UTC
        ).strftime("%B %d, %Y")

        return {
            "message": f"Subscription will cancel on {period_end}. Access continues until then.",
            "cancel_date": period_end,
        }
    except stripe.StripeError as e:
        logger.error(f"Cancel error for user {user.id}: {e}")
        raise HTTPException(status_code=502, detail="Could not cancel subscription. Please try again.")


# ── POST /payments/webhook ────────────────────────────────────────────────────

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Stripe webhook endpoint — validates signature then dispatches to handlers.
    Must NOT require auth (Stripe calls this directly).
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe_service.construct_webhook_event(payload, sig_header)
    except stripe.SignatureVerificationError:
        logger.warning("Webhook signature verification failed")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    event_type = event["type"]
    event_data = event["data"]["object"]

    logger.info(f"Stripe webhook received: {event_type}")

    handlers = {
        "customer.subscription.created":      _handle_subscription_created,
        "customer.subscription.updated":      _handle_subscription_updated,
        "customer.subscription.deleted":      _handle_subscription_deleted,
        "invoice.payment_succeeded":           _handle_payment_succeeded,
        "invoice.payment_failed":              _handle_payment_failed,
        "customer.subscription.trial_will_end": _handle_trial_ending,
    }

    handler = handlers.get(event_type)
    if handler:
        try:
            await handler(event_data, db)
        except Exception as e:
            logger.exception(f"Webhook handler failed for {event_type}: {e}")
            # Return 200 anyway — Stripe will retry otherwise, causing duplicate events

    return {"status": "received", "event": event_type}


# ── DB helpers ────────────────────────────────────────────────────────────────

async def _get_user_by_stripe_customer(db: AsyncSession, customer_id: str) -> User | None:
    result = await db.execute(
        select(User)
        .join(Subscription, Subscription.user_id == User.id)
        .where(Subscription.stripe_customer_id == customer_id)
    )
    return result.scalar_one_or_none()


async def _get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    import uuid as _uuid
    try:
        result = await db.execute(select(User).where(User.id == _uuid.UUID(user_id)))
        return result.scalar_one_or_none()
    except Exception:
        return None


async def _update_subscription(db: AsyncSession, user_id, **kwargs) -> None:
    """Update subscription fields and sync user.plan if plan changes."""
    await db.execute(
        update(Subscription)
        .where(Subscription.user_id == user_id)
        .values(**{k: v for k, v in kwargs.items() if v is not None})
    )
    if "plan" in kwargs:
        plan_value = kwargs["plan"].value if hasattr(kwargs["plan"], "value") else kwargs["plan"]
        await db.execute(
            update(User)
            .where(User.id == user_id)
            .values(plan=UserPlan(plan_value))
        )
    await db.commit()


# ── Webhook handlers ──────────────────────────────────────────────────────────

async def _handle_subscription_created(sub: dict, db: AsyncSession) -> None:
    """New subscription: upgrade user to pro and send welcome email."""
    user_id = sub.get("metadata", {}).get("user_id")
    if not user_id:
        logger.warning("subscription.created: no user_id in metadata")
        return

    user = await _get_user_by_id(db, user_id)
    if not user:
        logger.warning(f"subscription.created: user {user_id} not found")
        return

    period_start = datetime.fromtimestamp(sub["current_period_start"], tz=UTC)
    period_end   = datetime.fromtimestamp(sub["current_period_end"],   tz=UTC)

    # Upsert subscription record
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    existing_sub = result.scalar_one_or_none()

    if existing_sub:
        existing_sub.stripe_subscription_id = sub["id"]
        existing_sub.stripe_customer_id = sub["customer"]
        existing_sub.plan = PlanTier.PRO
        existing_sub.status = SubscriptionStatus(sub["status"])
        existing_sub.current_period_start = period_start
        existing_sub.current_period_end = period_end
        existing_sub.cancel_at_period_end = sub.get("cancel_at_period_end", False)
    else:
        new_sub = Subscription(
            user_id=user.id,
            stripe_subscription_id=sub["id"],
            stripe_customer_id=sub["customer"],
            plan=PlanTier.PRO,
            status=SubscriptionStatus(sub["status"]),
            current_period_start=period_start,
            current_period_end=period_end,
        )
        db.add(new_sub)

    # Update user plan
    user.plan = UserPlan.PRO
    await db.commit()

    send_pro_welcome_email(user.email)
    logger.info(f"User {user.id} upgraded to Pro via subscription {sub['id']}")


async def _handle_subscription_updated(sub: dict, db: AsyncSession) -> None:
    """Subscription modified: sync status and cancel_at_period_end."""
    customer_id = sub.get("customer")
    if not customer_id:
        return

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_customer_id == customer_id)
    )
    db_sub = result.scalar_one_or_none()
    if not db_sub:
        return

    db_sub.status = SubscriptionStatus(sub.get("status", "active"))
    db_sub.cancel_at_period_end = sub.get("cancel_at_period_end", False)

    if sub.get("current_period_end"):
        db_sub.current_period_end = datetime.fromtimestamp(sub["current_period_end"], tz=UTC)

    await db.commit()
    logger.info(f"Subscription updated for customer {customer_id}: status={db_sub.status}")


async def _handle_subscription_deleted(sub: dict, db: AsyncSession) -> None:
    """Subscription fully ended: downgrade user to free plan."""
    user_id = sub.get("metadata", {}).get("user_id")
    customer_id = sub.get("customer")

    # Try to find user by either method
    user = None
    if user_id:
        user = await _get_user_by_id(db, user_id)
    if not user and customer_id:
        user = await _get_user_by_stripe_customer(db, customer_id)

    if not user:
        logger.warning("subscription.deleted: could not find associated user")
        return

    # Downgrade
    result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
    db_sub = result.scalar_one_or_none()
    if db_sub:
        db_sub.plan = PlanTier.FREE
        db_sub.status = SubscriptionStatus.CANCELED
        db_sub.stripe_subscription_id = None

    user.plan = UserPlan.FREE
    await db.commit()

    send_subscription_ended_email(user.email)
    logger.info(f"User {user.id} downgraded to Free — subscription deleted")


async def _handle_payment_succeeded(invoice: dict, db: AsyncSession) -> None:
    """Payment confirmed: ensure subscription is marked active."""
    customer_id = invoice.get("customer")
    if not customer_id:
        return

    result = await db.execute(
        select(Subscription).where(Subscription.stripe_customer_id == customer_id)
    )
    db_sub = result.scalar_one_or_none()

    if db_sub and db_sub.status != SubscriptionStatus.ACTIVE:
        db_sub.status = SubscriptionStatus.ACTIVE
        await db.commit()

    # Send receipt email
    user = await _get_user_by_stripe_customer(db, customer_id)
    if user:
        amount = invoice.get("amount_paid", 0)
        next_date_ts = invoice.get("lines", {}).get("data", [{}])[0].get("period", {}).get("end")
        next_date = (
            datetime.fromtimestamp(next_date_ts, tz=UTC).strftime("%B %d, %Y")
            if next_date_ts else "—"
        )
        send_payment_succeeded_email(user.email, amount, next_date)


async def _handle_payment_failed(invoice: dict, db: AsyncSession) -> None:
    """Payment failed: warn user and update status to past_due after retries."""
    customer_id = invoice.get("customer")
    if not customer_id:
        return

    user = await _get_user_by_stripe_customer(db, customer_id)
    attempt_count = invoice.get("attempt_count", 1)

    if user:
        send_payment_failed_email(user.email, attempt_count)

    # Mark past_due on DB after 2nd attempt
    if attempt_count >= 2:
        result = await db.execute(
            select(Subscription).where(Subscription.stripe_customer_id == customer_id)
        )
        db_sub = result.scalar_one_or_none()
        if db_sub:
            db_sub.status = SubscriptionStatus.PAST_DUE
            await db.commit()

    logger.warning(f"Payment failed for customer {customer_id} — attempt {attempt_count}")


async def _handle_trial_ending(sub: dict, db: AsyncSession) -> None:
    """7 days before trial/renewal: send reminder email."""
    customer_id = sub.get("customer")
    user = await _get_user_by_stripe_customer(db, customer_id) if customer_id else None

    if user:
        trial_end_ts = sub.get("trial_end")
        renewal_date = (
            datetime.fromtimestamp(trial_end_ts, tz=UTC).strftime("%B %d, %Y")
            if trial_end_ts else "—"
        )
        send_renewal_reminder_email(user.email, 2900, renewal_date)  # $29.00
        logger.info(f"Renewal reminder sent to {user.email}")
