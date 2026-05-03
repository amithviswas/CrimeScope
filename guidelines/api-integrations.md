# 🔌 api-integrations.md — External API Setup Guide

---

## 📋 All Required APIs

| Service | Purpose | Free Tier | Sign Up |
|---------|---------|-----------|---------|
| **Chicago Data Portal** | Crime data | Free, unlimited | data.cityofchicago.org |
| **NYC Open Data** | Crime data | Free, unlimited | data.cityofnewyork.us |
| **LA Open Data** | Crime data | Free, unlimited | data.lacity.org |
| **Mapbox** | Interactive maps | 50k loads/mo free | mapbox.com |
| **Stripe** | Payments | No monthly fee | stripe.com |
| **Google OAuth** | Social login | Free | console.cloud.google.com |
| **Resend** | Email delivery | 3k emails/mo free | resend.com |
| **PostHog** | Analytics | 1M events/mo free | posthog.com |
| **Sentry** | Error tracking | 5k errors/mo free | sentry.io |

---

## 🏙️ Crime Data APIs

### Chicago Data Portal (Primary)

**Base URL:** `https://data.cityofchicago.org/resource/`

**Dataset:** Crimes - 2001 to Present  
**Endpoint:** `https://data.cityofchicago.org/resource/ijzp-q8t2.json`

**Setup Steps:**
1. Go to `https://data.cityofchicago.org`
2. Click "Sign In" → create free account
3. Go to Developer Settings → Create App Token
4. Copy token → add to `.env` as `CHICAGO_API_TOKEN=xxx`

**Query Example:**
```python
import httpx

async def fetch_chicago_crimes(app_token: str, limit: int = 10000):
    url = "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
    params = {
        "$limit": limit,
        "$order": "date DESC",
        "$where": "date > '2024-01-01T00:00:00'",
        "$$app_token": app_token
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
```

**Response Fields:**
```json
{
  "id": "12345678",
  "case_number": "JF123456",
  "date": "2024-06-01T14:23:00.000",
  "primary_type": "THEFT",
  "description": "FROM MOTOR VEHICLE",
  "location_description": "STREET",
  "latitude": "41.878114",
  "longitude": "-87.629798",
  "community_area": "32",
  "district": "01",
  "ward": "42",
  "arrest": "false",
  "domestic": "false"
}
```

**Normalization Function:**
```python
def normalize_chicago(record: dict) -> dict:
    return {
        "external_id": f"chicago_{record['id']}",
        "city": "chicago",
        "category": record.get("primary_type", "UNKNOWN"),
        "subcategory": record.get("description"),
        "latitude": float(record.get("latitude", 0)),
        "longitude": float(record.get("longitude", 0)),
        "district": record.get("district"),
        "occurred_at": record.get("date"),
        "source_api": "chicago_data_portal",
        "raw_data": record
    }
```

---

### NYC Open Data

**Endpoint:** `https://data.cityofnewyork.us/resource/5uac-w243.json`  
(NYPD Complaint Data Current Year)

**Setup Steps:**
1. Go to `https://data.cityofnewyork.us`
2. Create account → Developer Settings → New API Key
3. Add to `.env` as `NYC_API_TOKEN=xxx`

**Query Example:**
```python
async def fetch_nyc_crimes(app_token: str, limit: int = 10000):
    url = "https://data.cityofnewyork.us/resource/5uac-w243.json"
    params = {
        "$limit": limit,
        "$order": "cmplnt_fr_dt DESC",
        "$$app_token": app_token
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
```

**Normalization Function:**
```python
def normalize_nyc(record: dict) -> dict:
    return {
        "external_id": f"nyc_{record.get('cmplnt_num')}",
        "city": "new_york",
        "category": record.get("ofns_desc", "UNKNOWN"),
        "subcategory": record.get("pd_desc"),
        "latitude": float(record.get("latitude", 0) or 0),
        "longitude": float(record.get("longitude", 0) or 0),
        "district": record.get("patrol_boro"),
        "neighborhood": record.get("boro_nm"),
        "occurred_at": record.get("cmplnt_fr_dt"),
        "source_api": "nyc_open_data",
        "raw_data": record
    }
```

---

### LA Open Data

**Endpoint:** `https://data.lacity.org/resource/2nrs-mtv8.json`  
(Crime Data from 2020 to Present)

**Setup Steps:**
1. Go to `https://data.lacity.org`
2. Create account → API Key
3. Add to `.env` as `LA_API_TOKEN=xxx`

**Normalization Function:**
```python
def normalize_la(record: dict) -> dict:
    return {
        "external_id": f"la_{record.get('dr_no')}",
        "city": "los_angeles",
        "category": record.get("crm_cd_desc", "UNKNOWN"),
        "latitude": float(record.get("lat", 0) or 0),
        "longitude": float(record.get("lon", 0) or 0),
        "district": record.get("area_name"),
        "occurred_at": record.get("date_occ"),
        "source_api": "la_open_data",
        "raw_data": record
    }
```

---

## 🗺️ Mapbox

**Purpose:** Interactive crime maps, heatmaps, cluster visualization

**Setup Steps:**
1. Go to `https://mapbox.com` → Create account
2. Account → Tokens → Create token (public scopes only)
3. Add to `.env` as `NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...`

**Map Style:** `mapbox://styles/mapbox/dark-v11`

**Implementation:**
```typescript
// src/components/map/CrimeMap.tsx
import Map, { Source, Layer } from 'react-map-gl';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function CrimeMap({ data }: { data: GeoJSON }) {
  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      initialViewState={{
        longitude: -87.6298,  // Chicago default
        latitude: 41.8781,
        zoom: 11
      }}
    >
      <Source id="crimes" type="geojson" data={data}>
        {/* Heatmap Layer */}
        <Layer
          id="heatmap"
          type="heatmap"
          paint={{
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 11, 1, 15, 3],
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(46,213,115,0)',
              0.3, '#ffa502',
              0.6, '#ff6b35',
              1, '#ff4757'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.8
          }}
        />
      </Source>
    </Map>
  );
}
```

**GeoJSON Format from Backend:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [-87.629, 41.878]
      },
      "properties": {
        "id": "uuid",
        "category": "THEFT",
        "occurred_at": "2024-06-01T14:23:00Z",
        "risk_score": 7.2
      }
    }
  ]
}
```

---

## 💳 Stripe

**Purpose:** Subscription billing — Free / Pro / Enterprise plans

**Setup Steps:**
1. Go to `https://stripe.com` → Create account
2. Dashboard → Developers → API Keys
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
4. Create Products in Stripe Dashboard:
   - Product: "CrimeScope Pro" → Price: $29/mo recurring
   - Product: "CrimeScope Pro Annual" → Price: $278/yr recurring
5. Copy Price IDs to `.env`:
   ```
   STRIPE_PRO_MONTHLY_PRICE_ID=price_xxx
   STRIPE_PRO_ANNUAL_PRICE_ID=price_xxx
   ```
6. Set up Webhook:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/v1/payments/webhook`
   - Events to listen: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`

**Backend Webhook Handler:**
```python
@router.post("/payments/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(400, "Invalid signature")
    
    if event["type"] == "customer.subscription.created":
        await handle_subscription_created(event["data"]["object"])
    elif event["type"] == "customer.subscription.deleted":
        await handle_subscription_canceled(event["data"]["object"])
    elif event["type"] == "invoice.payment_failed":
        await handle_payment_failed(event["data"]["object"])
    
    return {"status": "ok"}
```

---

## 🔐 Google OAuth

**Purpose:** "Sign in with Google" button

**Setup Steps:**
1. Go to `https://console.cloud.google.com`
2. Create new project → "CrimeScope"
3. APIs & Services → OAuth consent screen:
   - App name: CrimeScope
   - User support email: your email
   - Scopes: email, profile
4. Credentials → Create OAuth client ID:
   - Type: Web application
   - Authorized redirect URIs: `http://localhost:8000/api/v1/auth/google/callback`
   - Also add production URL
5. Copy credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxx
   ```

**Backend Implementation (FastAPI):**
```python
from authlib.integrations.starlette_client import OAuth

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/api/v1/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')
    # Find or create user → return JWT
```

---

## 📧 Resend (Email)

**Purpose:** Transactional emails (verify, reset password, alerts)

**Setup Steps:**
1. Go to `https://resend.com` → Create account
2. API Keys → Create API Key
3. Add to `.env`: `RESEND_API_KEY=re_xxx`
4. Add + verify your sending domain (or use `onboarding@resend.dev` for testing)

**Email Templates:**

```python
import resend

resend.api_key = settings.RESEND_API_KEY

# Email verification
def send_verification_email(to: str, token: str):
    resend.Emails.send({
        "from": "CrimeScope <noreply@crimescope.app>",
        "to": [to],
        "subject": "Verify your CrimeScope account",
        "html": f"""
        <h2>Welcome to CrimeScope</h2>
        <p>Click below to verify your email:</p>
        <a href="https://crimescope.app/verify-email?token={token}"
           style="background:#00d4ff;color:#0a0e1a;padding:12px 24px;
                  text-decoration:none;border-radius:8px;font-weight:600">
          Verify Email
        </a>
        <p>Link expires in 24 hours.</p>
        """
    })

# Anomaly alert email
def send_anomaly_alert(to: str, anomaly: dict):
    resend.Emails.send({
        "from": "CrimeScope Alerts <alerts@crimescope.app>",
        "to": [to],
        "subject": f"Alert: Unusual activity in {anomaly['district']}",
        "html": f"""
        <h2>⚠ Anomaly Detected</h2>
        <p><strong>Location:</strong> {anomaly['district']}, {anomaly['city']}</p>
        <p><strong>Category:</strong> {anomaly['category']}</p>
        <p><strong>Deviation:</strong> +{anomaly['deviation_pct']}% above expected</p>
        <a href="https://crimescope.app/map">View on Map →</a>
        """
    })
```

---

## 📊 PostHog (Analytics)

**Purpose:** Track user behavior — page views, feature usage, conversion

**Setup Steps:**
1. Go to `https://posthog.com` → Create account
2. Create project → Copy API key
3. Add to frontend `.env`:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
   ```

**Frontend Setup:**
```typescript
// src/app/providers.tsx
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capture_pageview: false  // manual control
})

// Track custom events:
posthog.capture('map_filter_applied', { city: 'chicago', category: 'THEFT' })
posthog.capture('upgrade_clicked', { from_plan: 'free', to_plan: 'pro' })
posthog.capture('report_exported', { format: 'csv', records: 1243 })
```

---

## 🐛 Sentry (Error Tracking)

**Setup Steps:**
1. Go to `https://sentry.io` → Create account
2. New Project → Next.js
3. Copy DSN → add to `.env`: `NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx`
4. Run: `npx @sentry/wizard@latest -i nextjs`

**Backend Sentry:**
```python
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,
    environment=settings.ENVIRONMENT
)
```
