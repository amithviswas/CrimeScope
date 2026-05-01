# CrimeScope — Urban Safety Intelligence Platform

> AI-powered crime analytics for city planners, journalists, and public safety researchers.

[![CI](https://github.com/your-username/crimescope/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-username/crimescope/actions)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green.svg)](#)

---

## 🔍 What is CrimeScope?

CrimeScope ingests real-time crime incident data from government open data portals (Chicago, NYC, Los Angeles) and turns it into actionable intelligence through:

- **Interactive Crime Map** — Mapbox-powered heatmaps with category, date, and district filters
- **ML Hotspot Prediction** — DBSCAN clustering + Isolation Forest anomaly detection
- **Time-Series Forecasting** — Prophet-based 30/60/90-day crime forecasts
- **Real-Time Alerts** — Email notifications when crime rates exceed configurable thresholds
- **Analytics Dashboard** — Trend charts, top incident categories, district comparisons
- **CSV/PDF Export** — Download filtered data subsets (Pro plan)

**Data source disclaimer:** All data is sourced from public government records. CrimeScope does not guarantee accuracy. Not for law enforcement use.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| **Maps** | Mapbox GL JS |
| **Charts** | Recharts |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy 2, Alembic |
| **Auth** | JWT (httpOnly cookies) + Google OAuth (Authlib) |
| **Payments** | Stripe (Checkout + Billing Portal + Webhooks) |
| **Email** | Resend |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **ML** | scikit-learn (DBSCAN, IsolationForest), Prophet |
| **Deployment** | Railway (backend + DB + Redis), Vercel or Railway (frontend) |
| **CI** | GitHub Actions |

---

## 🗂️ Project Structure

```
CrimeScope/
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/v1/        # Route handlers (auth, crimes, payments, ml, alerts)
│   │   ├── core/          # Config, security, database session
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic (stripe, email, ml pipeline)
│   │   └── main.py        # FastAPI app factory
│   ├── alembic/           # Database migrations
│   ├── tests/             # pytest test suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── map/              # Crime map
│   │   │   ├── analytics/        # Charts & trends
│   │   │   ├── alerts/           # Alert rules
│   │   │   ├── pricing/          # Subscription plans
│   │   │   ├── privacy/          # Privacy Policy
│   │   │   ├── terms/            # Terms of Service
│   │   │   ├── help/             # Help & FAQ
│   │   │   └── (auth)/           # Login, Signup, Reset Password
│   │   ├── components/    # Reusable UI components
│   │   ├── stores/        # Zustand state management
│   │   └── lib/           # API client, utilities
│   ├── public/            # Static assets (og-image, icons, robots.txt)
│   ├── Dockerfile
│   └── next.config.js
│
├── .env.example           # All required environment variables
├── .env                   # Your local values (git-ignored)
├── docker-compose.yml     # Local development stack
└── .github/workflows/     # GitHub Actions CI
```

---

## 🚀 Local Setup (Docker Compose)

**Prerequisites:** Docker Desktop, Git

```bash
# 1. Clone the repository
git clone https://github.com/your-username/crimescope.git
cd crimescope

# 2. Copy and configure environment
cp .env.example .env
# Edit .env with your API keys (Stripe, Google OAuth, Resend, Mapbox)

# 3. Start all services (PostgreSQL + Redis + Backend + Frontend)
docker compose up -d

# 4. The app is running:
#    Frontend: http://localhost:3000
#    Backend API: http://localhost:8000
#    API Docs: http://localhost:8000/docs
```

> First startup runs Alembic migrations automatically. No manual setup needed.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | App secret (generate with `python -c "import secrets; print(secrets.token_hex(32))"`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_REDIRECT_URI` | Must match Google Console exactly (see below) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or Stripe dashboard |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | Sender address (`onboarding@resend.dev` for sandbox) |
| `NEXT_PUBLIC_API_URL` | Backend URL (frontend uses this) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google       ← local dev
   https://<your-frontend>.up.railway.app/api/auth/callback/google  ← Railway
   ```
4. Copy Client ID and Secret to `.env`

---

## 💳 Stripe Setup

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local backend
stripe listen --forward-to localhost:8000/api/v1/payments/webhook

# Copy the webhook signing secret shown in the output to STRIPE_WEBHOOK_SECRET
```

---

## 📧 Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Copy your API key to `RESEND_API_KEY`
3. Set `EMAIL_FROM=onboarding@resend.dev` (no domain verification needed in sandbox)
4. Set `EMAIL_TO_OVERRIDE=your@gmail.com` so test emails redirect to your inbox during dev

For production: verify your domain on Resend and update `EMAIL_FROM` to `noreply@yourdomain.com`.

---

## 🚂 Railway Deployment

1. Push your code to GitHub
2. Sign up at [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add 4 services: **PostgreSQL**, **Redis**, **Backend** (root: `backend`), **Frontend** (root: `frontend`)
4. Set environment variables in each service from `.env.example`
5. Update `GOOGLE_REDIRECT_URI`, `BACKEND_URL`, `FRONTEND_URL`, and `NEXT_PUBLIC_API_URL` with Railway subdomains
6. Add Railway frontend URL as a Stripe webhook endpoint (Stripe Dashboard → Developers → Webhooks)

Railway auto-deploys on every push to `main`. SSL/HTTPS is provided automatically.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest --tb=short -q

# Frontend build check
cd frontend
npm run build
```

CI runs automatically on every pull request via GitHub Actions.

---

## 📡 API Documentation

FastAPI generates interactive API docs automatically:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

Key endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Create account |
| `POST` | `/api/v1/auth/login` | Login (returns httpOnly JWT cookie) |
| `GET` | `/api/v1/auth/google` | Initiate Google OAuth |
| `GET` | `/api/v1/crimes` | Paginated crime incidents |
| `GET` | `/api/v1/crimes/stats` | Aggregated statistics |
| `GET` | `/api/v1/ml/hotspots` | ML-predicted crime hotspots |
| `GET` | `/api/v1/ml/forecast` | Time-series forecasts |
| `POST` | `/api/v1/payments/checkout` | Create Stripe checkout session |
| `POST` | `/api/v1/payments/webhook` | Stripe webhook receiver |
| `GET` | `/health` | Service health check |

---

## 🗃️ Database Schema (Key Tables)

```
users          — accounts, OAuth links, plan tier
subscriptions  — Stripe subscription state per user
crimes         — incident records (city, category, lat/lng, timestamp)
alerts         — user-defined alert rules
alert_events   — triggered alert history
ml_predictions — cached hotspot/forecast results
```

---

## 📜 License

Proprietary. All rights reserved. Not open-source.

---

## 🙏 Data Sources

- [Chicago Data Portal](https://data.cityofchicago.org/) — Crimes dataset
- [NYC OpenData](https://opendata.cityofnewyork.us/) — NYPD Complaint Data
- [LA GeoHub](https://geohub.lacity.org/) — Crime Data from 2020 to Present

All datasets are published under open government data licenses.
