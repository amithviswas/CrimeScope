"""
CrimeScope — Email Service (Resend)
Handles transactional emails: verification, password reset, anomaly alerts.

Sender: uses onboarding@resend.dev by default — works without domain verification.
Set EMAIL_FROM in .env to override with a verified address in production.
"""
import logging
from typing import Any

import resend

from app.core.config import settings

logger = logging.getLogger(__name__)


def _from_address() -> str:
    """Return the configured sender address (name + email)."""
    return f"{settings.email_from_name} <{settings.email_from}>"


def _to(recipient: str) -> list[str]:
    """
    Resolve the actual To address.

    In Resend sandbox mode (onboarding@resend.dev sender), emails can only
    be delivered to your own Resend-verified address.  Set EMAIL_TO_OVERRIDE
    in .env to your Gmail / Resend-verified email during local development.
    Leave blank in production so real recipients receive their emails.
    """
    override = settings.email_to_override
    if override:
        return [override]
    return [recipient]


def _get_client() -> None:
    """Configure Resend with API key."""
    if settings.resend_api_key:
        resend.api_key = settings.resend_api_key


_get_client()


def send_verification_email(to: str, token: str) -> bool:
    """Send email verification link to new user."""
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping verification email")
        return False

    # Points to the backend endpoint which validates the token and
    # then redirects to the frontend /verify?status=success page
    verify_url = f"{settings.backend_url}/api/v1/auth/verify/{token}"

    try:
        resend.Emails.send({
            "from": _from_address(),
            "to": _to(to),
            "subject": "Verify your CrimeScope account",
            "html": f"""
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
              <h2 style="color:#00d4ff;font-size:24px;margin-bottom:8px">Welcome to CrimeScope</h2>
              <p style="color:#94a3b8;margin-bottom:32px">Click the button below to verify your email address and activate your account.</p>
              <a href="{verify_url}"
                 style="display:inline-block;background:#00d4ff;color:#0a0e1a;padding:14px 28px;
                        text-decoration:none;border-radius:8px;font-weight:700;font-size:15px">
                Verify Email →
              </a>
              <p style="color:#475569;font-size:13px;margin-top:32px">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
            </div>
            """,
        })
        logger.info(f"Verification email sent to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send verification email to {to}: {e}")
        return False


def send_password_reset_email(to: str, token: str) -> bool:
    """Send password reset link."""
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping reset email")
        return False

    reset_url = f"{settings.frontend_url}/reset-password?token={token}"

    try:
        resend.Emails.send({
            "from": _from_address(),
            "to": _to(to),
            "subject": "Reset your CrimeScope password",
            "html": f"""
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
              <h2 style="color:#00d4ff">Password Reset</h2>
              <p style="color:#94a3b8;margin-bottom:32px">Click below to reset your password. This link expires in 15 minutes.</p>
              <a href="{reset_url}"
                 style="display:inline-block;background:#ff4757;color:#fff;padding:14px 28px;
                        text-decoration:none;border-radius:8px;font-weight:700">
                Reset Password →
              </a>
              <p style="color:#475569;font-size:13px;margin-top:32px">If you didn't request this, your account is safe — ignore this email.</p>
            </div>
            """,
        })
        logger.info(f"Password reset email sent to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send reset email: {e}")
        return False


def send_anomaly_alert_email(to: str, anomaly: dict[str, Any]) -> bool:
    """Send anomaly detection alert to user."""
    if not settings.resend_api_key:
        return False

    severity_colors = {
        "critical": "#ff4757",
        "high": "#ff6b35",
        "medium": "#ffa502",
        "low": "#ffdd57",
    }
    color = severity_colors.get(anomaly.get("severity", "medium"), "#ffa502")
    map_url = f"{settings.frontend_url}/map"

    try:
        resend.Emails.send({
            "from": _from_address(),
            "to": _to(to),
            "subject": f"⚠ Alert: Unusual activity in {anomaly.get('district', 'Unknown')}",
            "html": f"""
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
              <div style="display:inline-block;padding:4px 12px;border-radius:99px;background:{color}22;border:1px solid {color};color:{color};font-size:12px;font-weight:700;margin-bottom:16px;text-transform:uppercase">
                {anomaly.get('severity', 'medium')} severity
              </div>
              <h2 style="color:#fff;margin-top:0">Anomaly Detected</h2>
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
                <tr><td style="color:#94a3b8;padding:8px 0">Location</td>
                    <td style="color:#e2e8f0;font-weight:600">{anomaly.get('district', '—')}, {anomaly.get('city', '—')}</td></tr>
                <tr><td style="color:#94a3b8;padding:8px 0">Category</td>
                    <td style="color:#e2e8f0;font-weight:600">{anomaly.get('category', '—')}</td></tr>
                <tr><td style="color:#94a3b8;padding:8px 0">Deviation</td>
                    <td style="color:{color};font-weight:700">+{anomaly.get('deviation_pct', 0):.1f}% above expected</td></tr>
              </table>
              <a href="{map_url}"
                 style="display:inline-block;background:#00d4ff;color:#0a0e1a;padding:12px 24px;
                        text-decoration:none;border-radius:8px;font-weight:700">
                View on Map →
              </a>
            </div>
            """,
        })
        return True
    except Exception as e:
        logger.error(f"Failed to send anomaly alert: {e}")
        return False


def send_payment_failed_email(to: str, attempt_count: int) -> bool:
    """Notify user about a failed payment."""
    if not settings.resend_api_key:
        return False

    billing_url = f"{settings.frontend_url}/settings/billing"

    try:
        resend.Emails.send({
            "from": _from_address(),
            "to": _to(to),
            "subject": "Action required: CrimeScope payment failed",
            "html": f"""
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
              <h2 style="color:#ff4757">Payment Failed</h2>
              <p style="color:#94a3b8;margin-bottom:16px">
                We couldn't process your CrimeScope Pro payment (attempt {attempt_count}).
                Please update your billing information to keep your subscription active.
              </p>
              <a href="{billing_url}"
                 style="display:inline-block;background:#ff4757;color:#fff;padding:14px 28px;
                        text-decoration:none;border-radius:8px;font-weight:700">
                Update Billing →
              </a>
              <p style="color:#475569;font-size:13px;margin-top:32px">
                Your Pro access will remain active during the grace period.
              </p>
            </div>
            """,
        })
        return True
    except Exception as e:
        logger.error(f"Failed to send payment failed email: {e}")
        return False


def send_renewal_reminder_email(to: str, amount_cents: int, renewal_date: str) -> bool:
    """Send subscription renewal reminder."""
    if not settings.resend_api_key:
        return False

    billing_url = f"{settings.frontend_url}/settings/billing"
    amount = amount_cents / 100

    try:
        resend.Emails.send({
            "from": _from_address(),
            "to": _to(to),
            "subject": "Your CrimeScope Pro subscription renews soon",
            "html": f"""
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:40px 24px;background:#0a0e1a;color:#e2e8f0">
              <h2 style="color:#00d4ff">Renewal Reminder</h2>
              <p style="color:#94a3b8;margin-bottom:16px">
                Your CrimeScope Pro subscription will renew on <strong style="color:#e2e8f0">{renewal_date}</strong>
                for <strong style="color:#e2e8f0">${amount:.2f}</strong>.
              </p>
              <a href="{billing_url}"
                 style="display:inline-block;background:#00d4ff;color:#0a0e1a;padding:12px 24px;
                        text-decoration:none;border-radius:8px;font-weight:700">
                Manage Billing →
              </a>
            </div>
            """,
        })
        return True
    except Exception as e:
        logger.error(f"Failed to send renewal reminder: {e}")
        return False
