"""
CrimeScope — Payment Email Templates (via Resend)
Triggered by Stripe webhook events.
"""
import logging
from typing import Any

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


def _send(to: str, subject: str, html: str) -> bool:
    if not settings.resend_api_key:
        logger.warning(f"RESEND_API_KEY not set — skipping email to {to}")
        return False
    resend.api_key = settings.resend_api_key
    try:
        resend.Emails.send({
            "from": f"CrimeScope <billing@{settings.email_from_domain}>",
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return False


def send_pro_welcome_email(to: str) -> bool:
    return _send(
        to,
        "Welcome to CrimeScope Pro 🎉",
        f"""
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
          <h2 style="color:#00d4ff;font-size:28px">You're now on Pro 🚀</h2>
          <p style="color:#94a3b8;margin-bottom:24px">Your CrimeScope Pro subscription is now active. Here's what you just unlocked:</p>
          <ul style="color:#e2e8f0;padding-left:20px;line-height:2">
            <li>🗺️ ML Hotspot Detection — real-time crime cluster maps</li>
            <li>📈 30-Day Forecasting — Prophet time-series predictions</li>
            <li>⚠️ Anomaly Alerts — automatic spike detection</li>
            <li>📊 Time-series trends + hourly/weekly patterns</li>
            <li>📤 Export up to 50,000 records (CSV/JSON)</li>
            <li>🔔 Up to 5 custom alert rules</li>
          </ul>
          <a href="{settings.frontend_url}/dashboard"
             style="display:inline-block;background:#00d4ff;color:#0a0e1a;padding:14px 28px;
                    text-decoration:none;border-radius:8px;font-weight:700;margin-top:24px">
            Go to Dashboard →
          </a>
        </div>
        """,
    )


def send_payment_succeeded_email(to: str, amount: int, next_billing_date: str) -> bool:
    amount_str = f"${amount / 100:.2f}"
    return _send(
        to,
        "Payment confirmed — CrimeScope",
        f"""
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
          <h2 style="color:#2ed573">Payment Confirmed ✓</h2>
          <table style="width:100%;margin:24px 0;border-collapse:collapse">
            <tr><td style="color:#94a3b8;padding:8px 0">Amount</td>
                <td style="color:#e2e8f0;font-weight:700">{amount_str}</td></tr>
            <tr><td style="color:#94a3b8;padding:8px 0">Next billing date</td>
                <td style="color:#e2e8f0;font-weight:700">{next_billing_date}</td></tr>
          </table>
          <a href="{settings.frontend_url}/settings/billing"
             style="display:inline-block;background:#1e293b;color:#00d4ff;padding:12px 24px;
                    text-decoration:none;border-radius:8px;font-weight:600;border:1px solid #00d4ff22">
            Manage Billing →
          </a>
        </div>
        """,
    )


def send_payment_failed_email(to: str, attempt_count: int = 1) -> bool:
    return _send(
        to,
        "Action required: Payment failed — CrimeScope",
        f"""
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
          <div style="padding:4px 12px;border-radius:99px;background:#ff475722;border:1px solid #ff4757;
                      color:#ff4757;font-size:12px;font-weight:700;display:inline-block;margin-bottom:16px;text-transform:uppercase">
            Payment Failed (Attempt {attempt_count}/3)
          </div>
          <h2 style="color:#fff;margin-top:0">Your payment couldn't be processed</h2>
          <p style="color:#94a3b8">Please update your payment method to keep your Pro access.</p>
          <a href="{settings.frontend_url}/settings/billing"
             style="display:inline-block;background:#ff4757;color:#fff;padding:14px 28px;
                    text-decoration:none;border-radius:8px;font-weight:700;margin-top:16px">
            Update Payment Method →
          </a>
          <p style="color:#475569;font-size:13px;margin-top:24px">
            Stripe will automatically retry {3 - attempt_count} more time(s). 
            If all attempts fail, your account will be downgraded to the Free plan.
          </p>
        </div>
        """,
    )


def send_subscription_ended_email(to: str) -> bool:
    return _send(
        to,
        "Your CrimeScope Pro subscription has ended",
        f"""
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
          <h2 style="color:#fff">Your Pro subscription has ended</h2>
          <p style="color:#94a3b8;margin-bottom:24px">
            Your account has been downgraded to the Free plan. You'll no longer have access to 
            ML predictions, advanced analytics, and premium features.
          </p>
          <p style="color:#94a3b8;margin-bottom:32px">Your data is safe — resubscribe any time to restore full access.</p>
          <a href="{settings.frontend_url}/pricing"
             style="display:inline-block;background:#00d4ff;color:#0a0e1a;padding:14px 28px;
                    text-decoration:none;border-radius:8px;font-weight:700">
            Resubscribe to Pro →
          </a>
        </div>
        """,
    )


def send_renewal_reminder_email(to: str, amount: int, renewal_date: str) -> bool:
    amount_str = f"${amount / 100:.2f}"
    return _send(
        to,
        "Your CrimeScope Pro subscription renews soon",
        f"""
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
          <h2 style="color:#fff">Subscription Renewal Reminder</h2>
          <p style="color:#94a3b8">Your CrimeScope Pro subscription will renew on <strong style="color:#e2e8f0">{renewal_date}</strong> for <strong style="color:#00d4ff">{amount_str}</strong>.</p>
          <a href="{settings.frontend_url}/settings/billing"
             style="display:inline-block;background:#1e293b;color:#00d4ff;padding:12px 24px;
                    text-decoration:none;border-radius:8px;font-weight:600;border:1px solid #00d4ff22">
            Manage Billing →
          </a>
        </div>
        """,
    )
