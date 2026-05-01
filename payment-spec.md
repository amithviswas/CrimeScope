# 💳 payment-spec.md — CrimeScope Stripe Integration

---

## 📦 Plans & Pricing

| Plan | Monthly | Annual | Stripe Price ID (env var) |
|------|---------|--------|--------------------------|
| Free | $0 | $0 | — |
| Pro | $29/mo | $278/yr | `STRIPE_PRO_MONTHLY_PRICE_ID` / `STRIPE_PRO_ANNUAL_PRICE_ID` |
| Enterprise | Custom | Custom | Contact sales |

Annual = 20% discount ($29 × 12 = $348 → $278)

---

## 🔄 Subscription Lifecycle

```
NEW SUBSCRIBER:
User clicks "Start Pro" → POST /payments/checkout
→ Stripe Checkout Session created → redirect to Stripe hosted page
→ User pays → Stripe sends webhook: customer.subscription.created
→ Backend updates user.plan = "pro" in DB
→ Redirect to /dashboard?upgraded=true

UPGRADE (Free → Pro):
Same as new subscriber flow

DOWNGRADE / CANCEL:
User goes to Settings → Billing → "Cancel Subscription"
→ POST /payments/cancel
→ Stripe cancels at period end (not immediately)
→ Webhook: customer.subscription.updated (cancel_at_period_end = true)
→ User keeps Pro until period ends, then downgraded to Free

PAYMENT FAILURE:
Invoice payment fails → Stripe retries (3x over 7 days)
→ Webhook: invoice.payment_failed each time
→ Backend sends warning email via Resend
→ After final failure: customer.subscription.deleted
→ User downgraded to Free, warning email sent

BILLING PORTAL:
User clicks "Manage Billing" → POST /payments/portal
→ Returns Stripe Customer Portal URL → redirect
→ User can: update card, view invoices, cancel themselves
```

---

## 🔧 Backend Implementation

### Create Checkout Session
```python
# app/services/stripe_service.py
import stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

async def create_checkout_session(
    user: User,
    price_id: str,
    billing_cycle: str
) -> str:
    # Get or create Stripe customer
    if not user.subscription.stripe_customer_id:
        customer = stripe.Customer.create(
            email=user.email,
            name=user.full_name,
            metadata={"user_id": str(user.id)}
        )
        customer_id = customer.id
        # Save to DB
        await save_stripe_customer_id(user.id, customer_id)
    else:
        customer_id = user.subscription.stripe_customer_id

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{settings.FRONTEND_URL}/dashboard?upgraded=true",
        cancel_url=f"{settings.FRONTEND_URL}/pricing?canceled=true",
        subscription_data={
            "metadata": {"user_id": str(user.id)}
        },
        allow_promotion_codes=True,
    )
    return session.url
```

### Create Billing Portal Session
```python
async def create_portal_session(user: User) -> str:
    session = stripe.billing_portal.Session.create(
        customer=user.subscription.stripe_customer_id,
        return_url=f"{settings.FRONTEND_URL}/settings/billing"
    )
    return session.url
```

### Cancel Subscription
```python
async def cancel_subscription(user: User):
    sub = stripe.Subscription.modify(
        user.subscription.stripe_subscription_id,
        cancel_at_period_end=True  # Cancel gracefully at end of period
    )
    # Update DB: status = "canceling", cancels_at = sub.cancel_at
    await update_subscription_status(user.id, "canceling", sub.cancel_at)
```

---

## 🪝 Webhook Handlers — ALL Events

```python
# app/api/v1/payments.py

@router.post("/payments/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    except ValueError:
        raise HTTPException(400, "Invalid payload")

    handler = WEBHOOK_HANDLERS.get(event["type"])
    if handler:
        await handler(event["data"]["object"], db)

    return {"status": "received"}


# Map event types to handlers
WEBHOOK_HANDLERS = {
    "customer.subscription.created":   handle_subscription_created,
    "customer.subscription.updated":   handle_subscription_updated,
    "customer.subscription.deleted":   handle_subscription_deleted,
    "invoice.payment_succeeded":       handle_payment_succeeded,
    "invoice.payment_failed":          handle_payment_failed,
    "customer.subscription.trial_will_end": handle_trial_ending,
}


async def handle_subscription_created(sub: dict, db: AsyncSession):
    user_id = sub["metadata"]["user_id"]
    await update_user_subscription(db, user_id, {
        "stripe_subscription_id": sub["id"],
        "plan": "pro",
        "status": sub["status"],
        "current_period_start": sub["current_period_start"],
        "current_period_end": sub["current_period_end"],
    })
    # Send welcome to Pro email
    user = await get_user(db, user_id)
    send_pro_welcome_email(user.email)


async def handle_subscription_updated(sub: dict, db: AsyncSession):
    user_id = sub["metadata"]["user_id"]
    await update_user_subscription(db, user_id, {
        "status": sub["status"],
        "current_period_end": sub["current_period_end"],
        "cancel_at_period_end": sub["cancel_at_period_end"],
    })


async def handle_subscription_deleted(sub: dict, db: AsyncSession):
    """Subscription fully ended — downgrade to free"""
    user_id = sub["metadata"]["user_id"]
    await update_user_subscription(db, user_id, {
        "plan": "free",
        "status": "canceled",
        "stripe_subscription_id": None,
    })
    user = await get_user(db, user_id)
    send_subscription_ended_email(user.email)


async def handle_payment_succeeded(invoice: dict, db: AsyncSession):
    """Payment confirmed — ensure plan is active"""
    customer_id = invoice["customer"]
    user = await get_user_by_stripe_customer(db, customer_id)
    if user and user.subscription.status != "active":
        await update_subscription_status(db, user.id, "active")


async def handle_payment_failed(invoice: dict, db: AsyncSession):
    """Payment failed — warn user"""
    customer_id = invoice["customer"]
    user = await get_user_by_stripe_customer(db, customer_id)
    if user:
        attempt_count = invoice.get("attempt_count", 1)
        send_payment_failed_email(user.email, attempt_count=attempt_count)
```

---

## 🖥️ Frontend Implementation

### Pricing Page CTA
```typescript
// src/app/pricing/page.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

export function PricingCard({ plan, priceId, billing }: Props) {
  const { user } = useAuth()
  const router = useRouter()

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/signup?redirect=/pricing')
      return
    }

    try {
      const res = await api.post('/payments/checkout', {
        plan,
        billing_cycle: billing   // 'monthly' | 'annual'
      })
      window.location.href = res.data.checkout_url
    } catch (err) {
      toast.error('Failed to start checkout. Please try again.')
    }
  }

  return (
    <div className="pricing-card">
      {/* ... plan details ... */}
      <button onClick={handleUpgrade} className="btn-primary">
        {user?.plan === plan ? 'Current Plan' : 'Get Started'}
      </button>
    </div>
  )
}
```

### Billing Settings Page
```typescript
// src/app/settings/billing/page.tsx
export function BillingPage() {
  const { user } = useAuth()
  const [canceling, setCanceling] = useState(false)

  const handleManageBilling = async () => {
    const res = await api.post('/payments/portal')
    window.location.href = res.data.portal_url
  }

  const handleCancel = async () => {
    if (!confirm('Cancel at end of billing period?')) return
    setCanceling(true)
    await api.post('/payments/cancel')
    toast.success('Subscription will cancel at period end')
    setCanceling(false)
  }

  return (
    <div>
      <h2>Billing & Subscription</h2>
      
      {/* Current Plan */}
      <div className="card">
        <span className="plan-badge">{user?.plan.toUpperCase()}</span>
        <p>Renews: {formatDate(user?.subscription?.current_period_end)}</p>
        <button onClick={handleManageBilling}>Manage Billing →</button>
      </div>

      {/* Danger Zone */}
      {user?.plan !== 'free' && (
        <div className="card card--danger">
          <h3>Cancel Subscription</h3>
          <p>Access continues until end of billing period.</p>
          <button
            onClick={handleCancel}
            disabled={canceling}
            className="btn-danger"
          >
            {canceling ? 'Canceling...' : 'Cancel Subscription'}
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## 🧪 Payment Test Cases

Use Stripe test card numbers:

| Card | Number | Result |
|------|--------|--------|
| Visa (success) | `4242 4242 4242 4242` | Payment succeeds |
| Declined | `4000 0000 0000 0002` | Card declined |
| 3D Secure | `4000 0025 0000 3155` | Requires auth |
| Insufficient funds | `4000 0000 0000 9995` | Fails |

CVV: any 3 digits | Expiry: any future date | ZIP: any 5 digits

**Test Scenarios (all must pass):**
```
✓ Subscribe → webhook fires → plan updated to pro in DB
✓ Billing portal opens and returns correctly
✓ Cancel → user stays pro until period end → downgrades to free
✓ Payment failure → warning email sent
✓ 3D Secure card → checkout completes after auth
✓ Duplicate webhook → idempotent (no double-updates)
✓ Invalid webhook signature → 400 rejected
✓ Free user accessing Pro endpoint → 403 + upgrade prompt
✓ Pro user after cancellation → access until period_end date
```

---

## 📧 Payment Emails (via Resend)

| Trigger | Subject | Content |
|---------|---------|---------|
| Subscription created | "Welcome to CrimeScope Pro 🎉" | Features unlocked, get started link |
| Payment succeeded | "Payment confirmed — CrimeScope" | Receipt, next billing date |
| Payment failed | "Action required: Payment failed" | Update card link, retry date |
| Subscription canceled | "Your Pro subscription has ended" | Downgrade info, resubscribe link |
| 7 days before renewal | "Your Pro subscription renews soon" | Amount, date, manage billing link |
