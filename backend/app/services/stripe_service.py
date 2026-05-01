"""
CrimeScope — Stripe Service
Checkout session, billing portal, subscription cancellation.
All Stripe API calls are synchronous (Stripe SDK doesn't support asyncio natively).
"""
from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import stripe

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Init ──────────────────────────────────────────────────────────────────────

def _init_stripe() -> None:
    if settings.stripe_secret_key:
        stripe.api_key = settings.stripe_secret_key
    else:
        logger.warning("STRIPE_SECRET_KEY not set — Stripe calls will fail")


_init_stripe()


# ── Price ID mapping ──────────────────────────────────────────────────────────

PLAN_PRICE_IDS: dict[str, dict[str, str]] = {
    "pro": {
        "monthly": settings.stripe_pro_monthly_price_id,
        "annual":  settings.stripe_pro_annual_price_id,
    }
}


def get_price_id(plan: str, billing_cycle: str) -> str:
    """Return Stripe Price ID for a plan + billing cycle. Raises ValueError if not found."""
    price_id = PLAN_PRICE_IDS.get(plan, {}).get(billing_cycle, "")
    if not price_id:
        raise ValueError(f"No price ID configured for plan={plan} billing={billing_cycle}")
    return price_id


# ── Customer helpers ──────────────────────────────────────────────────────────

def get_or_create_stripe_customer(user: Any) -> str:
    """
    Get existing Stripe customer or create a new one.
    Returns stripe_customer_id string.
    """
    if user.subscription and user.subscription.stripe_customer_id:
        return user.subscription.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        name=user.full_name or user.email,
        metadata={"user_id": str(user.id), "plan": user.plan.value},
    )
    logger.info(f"Created Stripe customer {customer.id} for user {user.id}")
    return customer.id


# ── Checkout session ──────────────────────────────────────────────────────────

def create_checkout_session(user: Any, plan: str, billing_cycle: str) -> str:
    """
    Create a Stripe Checkout Session and return the hosted URL.
    user must have user.subscription loaded (selectin).
    """
    price_id = get_price_id(plan, billing_cycle)
    customer_id = get_or_create_stripe_customer(user)

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.frontend_url}/dashboard?upgraded=true",
        cancel_url=f"{settings.frontend_url}/pricing?canceled=true",
        subscription_data={
            "metadata": {"user_id": str(user.id)},
        },
        allow_promotion_codes=True,
        billing_address_collection="auto",
    )
    logger.info(f"Created checkout session {session.id} for user {user.id} plan={plan}")
    return session.url


# ── Billing portal ────────────────────────────────────────────────────────────

def create_billing_portal_session(user: Any) -> str:
    """
    Create a Stripe Customer Portal session.
    Returns the portal URL for the user to manage billing.
    """
    if not user.subscription or not user.subscription.stripe_customer_id:
        raise ValueError("No Stripe customer ID found for this user")

    session = stripe.billing_portal.Session.create(
        customer=user.subscription.stripe_customer_id,
        return_url=f"{settings.frontend_url}/settings/billing",
    )
    return session.url


# ── Cancel subscription ───────────────────────────────────────────────────────

def cancel_subscription_at_period_end(subscription_id: str) -> stripe.Subscription:
    """Cancel subscription gracefully at end of billing period (not immediately)."""
    sub = stripe.Subscription.modify(
        subscription_id,
        cancel_at_period_end=True,
    )
    logger.info(f"Subscription {subscription_id} set to cancel at period end")
    return sub


# ── Construct webhook event ───────────────────────────────────────────────────

def construct_webhook_event(payload: bytes, sig_header: str) -> stripe.Event:
    """Validate Stripe webhook signature and construct the Event object."""
    return stripe.Webhook.construct_event(
        payload,
        sig_header,
        settings.stripe_webhook_secret,
    )


# ── Fetch subscription ────────────────────────────────────────────────────────

def retrieve_subscription(subscription_id: str) -> stripe.Subscription:
    return stripe.Subscription.retrieve(subscription_id)
