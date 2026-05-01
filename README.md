<div align="center">

# 🔍 CrimeScope

### Urban Safety Intelligence Platform

**AI-powered crime analytics for city planners, journalists, and public safety researchers.**

[![CI](https://github.com/amithviswas/crimescope/actions/workflows/deploy.yml/badge.svg)](https://github.com/amithviswas/crimescope/actions)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

[Live Demo](#) · [API Docs](http://localhost:8000/docs) · [Report Bug](mailto:vibecodeproject2026@gmail.com)

</div>

---

## 📸 Screenshots

> *(Add screenshots here after deployment)*

| Landing Page | Crime Map | Analytics Dashboard |
|---|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Map](docs/screenshots/map.png) | ![Analytics](docs/screenshots/analytics.png) |

---

## ✨ Features

| Feature | Free | Pro |
|---------|------|-----|
| Crime map (3 cities) | ✅ | ✅ |
| Basic analytics | ✅ | ✅ |
| All cities + filters | ❌ | ✅ |
| ML hotspot predictions | ❌ | ✅ |
| Anomaly detection | ❌ | ✅ |
| Time-series forecasts | ❌ | ✅ |
| Real-time email alerts | 1 rule | Unlimited |
| CSV/PDF export | ❌ | ✅ |
| API rate limit | 100/day | 10,000/day |

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| **Maps** | Mapbox GL JS |
| **Charts** | Recharts |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy 2 (async), Alembic |
| **Auth** | JWT (httpOnly cookies) + Google OAuth (Authlib) |
| **Payments** | Stripe (Checkout + Billing Portal + Webhooks) |
| **Email** | Resend |
| **Database** | PostgreSQL 16 |
| **Cache / Rate-limit** | Redis 7 |
| **ML** | scikit-learn (DBSCAN, Isolation Forest), Prophet |
| **Task Queue** | APScheduler (background ETL + retraining) |
| **Deployment** | Railway (backend + DB + Redis), Railway/Vercel (frontend) |
| **CI** | GitHub Actions |

---

## 🗂️ Project Structure

```
crimescope/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # Route handlers
│   │   │   ├── auth.py       # JWT + Google OAuth
│   │   │   ├── crimes.py     # Crime data endpoints
│   │   │   ├── analytics.py  # Stats & trends
│   │   │   ├── ml.py         # Hotspots, forecasts, anomalies
│   │   │   ├── payments.py   # Stripe webhooks & checkout
│   │   │   └── alerts.py     # Alert rules & events
│   │   ├── core/             # Config, DB, Security, Rate-limiter
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response
│   │   ├── services/         # Stripe, Email, ML pipeline
│   │   └── main.py           # App factory + middleware
│   ├── alembic/              # DB migrations
│   ├── tests/                # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── dashboard/            # Main dashboard
│   │   │   ├── map/                  # Interactive crime map
│   │   │   ├── analytics/            # Charts & trends
│   │   │   ├── alerts/               # Alert rules
│   │   │   ├── pricing/              # Subscription plans
│   │   │   ├── privacy/ terms/       # Legal pages
│   │   │   ├── help/ contact/        # Support pages
│   │   │   └── (auth)/               # Login, Signup, Reset
│   │   ├── components/
│   │   ├── stores/           # Zustand state
│   │   └── lib/              # API client, utils
│   ├── public/               # Icons, OG image, robots.txt
│   ├── Dockerfile
│   └── next.config.js
│
├── .env.example              # All required environment variables
├── docker-compose.yml        # Local development stack
├── .github/workflows/        # GitHub Actions CI
└── README.md
```

---

## 🚀 Local Setup (5 minutes)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Git

### Steps

```bash
# 1. Clone
git clone https://github.com/amithviswas/crimescope.git
cd crimescope

# 2. Configure environment
cp .env.example .env
# Open .env and add your API keys (see Environment Variables section below)

# 3. Start everything
docker compose up -d

# 4. Done! 🎉
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |

> First startup runs Alembic migrations automatically — no manual setup needed.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`. Minimum required to run locally:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SECRET_KEY` | App secret (any 32-char random string) | `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | PostgreSQL connection | Pre-filled for Docker Compose |
| `REDIS_URL` | Redis connection | Pre-filled for Docker Compose |
| `JWT_SECRET_KEY` | JWT signing key | Generate same as SECRET_KEY |
| `GOOGLE_CLIENT_ID` | Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Same as above |
| `STRIPE_SECRET_KEY` | Stripe (`sk_test_...`) | [Stripe Dashboard](https://dashboard.stripe.com/) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI secret | `stripe listen --forward-to localhost:8000/api/v1/payments/webhook` |
| `RESEND_API_KEY` | Email sending | [Resend](https://resend.com) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Map tiles | [Mapbox](https://account.mapbox.com/) |

See [`.env.example`](.env.example) for the complete list with descriptions.

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials**
2. Create **OAuth 2.0 Client ID** (Web application)
3. Add **Authorized Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://<your-railway-frontend>.up.railway.app/api/auth/callback/google
   ```
4. Copy **Client ID** and **Client Secret** to `.env`

---

## 💳 Stripe Setup (Local)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Terminal 1 — Forward webhooks to local backend
stripe listen --forward-to localhost:8000/api/v1/payments/webhook
# Copy the webhook signing secret → STRIPE_WEBHOOK_SECRET in .env

# Terminal 2 — Start the app
docker compose up -d
```

---

## 🚂 Railway Deployment

### Step 1 — Create Railway Account
1. Sign up at [railway.app](https://railway.app) with GitHub
2. **New Project → Deploy from GitHub repo → Select `crimescope`**

### Step 2 — Add 4 Services

| Service | How to add |
|---------|-----------|
| **PostgreSQL** | + New → Database → PostgreSQL |
| **Redis** | + New → Database → Redis |
| **Backend** | + New → GitHub Repo → Root dir: `backend` |
| **Frontend** | + New → GitHub Repo → Root dir: `frontend` |

### Step 3 — Set Environment Variables

In each service's **Variables** tab, add the values from your `.env`:

**Backend service** — all backend vars (`DATABASE_URL`, `REDIS_URL`, `SECRET_KEY`, `GOOGLE_*`, `STRIPE_*`, `RESEND_*`, etc.)

**Frontend service** — all `NEXT_PUBLIC_*` vars, plus:
```bash
NEXT_PUBLIC_API_URL=https://<your-backend>.up.railway.app
NEXT_PUBLIC_APP_URL=https://<your-frontend>.up.railway.app
NEXTAUTH_URL=https://<your-frontend>.up.railway.app
NEXTAUTH_SECRET=<generate-random-string>
```

> **Tip:** Railway shows `DATABASE_URL` and `REDIS_URL` automatically after adding the database services — just copy them to the backend variables.

### Step 4 — Generate Domains
- Backend service → Settings → **Generate Domain** → copy the URL
- Frontend service → Settings → **Generate Domain** → copy the URL

### Step 5 — Update Google Console & Stripe
After getting Railway URLs:
- Add the frontend Railway URL as an Authorized Redirect URI in Google Console
- Add a new Stripe Webhook endpoint pointing to `https://<backend>.up.railway.app/api/v1/payments/webhook`

### Step 6 — Deploy
Railway auto-deploys on every push to `main`. ✅

---

## 📡 API Reference

FastAPI auto-generates interactive docs at `/docs`.

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login → sets httpOnly cookie |
| `POST` | `/api/v1/auth/logout` | Clear session |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth |
| `POST` | `/api/v1/auth/forgot-password` | Send reset email |
| `POST` | `/api/v1/auth/reset-password` | Set new password |

### Crime Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/crimes` | Paginated incidents (filter by city, category, date) |
| `GET` | `/api/v1/crimes/stats` | Aggregated statistics |
| `GET` | `/api/v1/crimes/heatmap` | GeoJSON for map heatmap |

### ML / Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/ml/hotspots` | DBSCAN crime hotspot clusters |
| `GET` | `/api/v1/ml/forecast` | Prophet 30/60/90-day forecasts |
| `GET` | `/api/v1/ml/anomalies` | Isolation Forest anomaly detection |
| `GET` | `/api/v1/analytics/dashboard` | Dashboard summary stats |
| `GET` | `/api/v1/analytics/trends` | Time-series trend data |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/payments/checkout` | Create Stripe checkout session |
| `GET` | `/api/v1/payments/portal` | Stripe billing portal URL |
| `POST` | `/api/v1/payments/webhook` | Stripe event receiver |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | DB + Redis connectivity check |

---

## 🧪 Running Tests

```bash
# Backend tests
cd backend
pytest --tb=short -q

# Frontend build check
cd frontend
npm run build
```

CI runs automatically via GitHub Actions on every push to `main`.

---

## 📊 Data Sources

All crime data is sourced from official government open data portals:

| City | Source | Dataset |
|------|--------|---------|
| Chicago | [Chicago Data Portal](https://data.cityofchicago.org/) | Crimes — 2001 to Present |
| New York City | [NYC OpenData](https://opendata.cityofnewyork.us/) | NYPD Complaint Data Historic |
| Los Angeles | [LA GeoHub](https://geohub.lacity.org/) | Crime Data from 2020 to Present |

> **Disclaimer:** CrimeScope displays data as provided by government sources. Accuracy and completeness are not guaranteed. This platform is for research and awareness purposes only — **not for law enforcement use.**

---

## 📜 License

Proprietary — All rights reserved. Not open-source.

---

<div align="center">

Built with ❤️ by [@amithviswas](https://github.com/amithviswas)

</div>
