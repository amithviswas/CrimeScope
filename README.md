<div align="center">

# 🔍 CrimeScope

### Urban Safety Intelligence Platform

**AI-powered crime analytics for city planners, journalists, and public safety researchers.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)
![Status](https://img.shields.io/badge/Status-Paused-orange)

</div>

---

> ## ⚠️ Project Status — Currently Paused
>
> **I am currently working on a different product and have temporarily paused development on CrimeScope.**
>
> Most cloud services for this application (backend hosting, database, etc.) have been **shut down** to free up resources.
>
> If you are interested in this project — whether to **use it, complete it, or purchase it** — feel free to reach out:
>
> 📧 **[amithviswas0909@gmail.com](mailto:amithviswas0909@gmail.com)**
>
> **This project is available for purchase at a very reasonable price.** The full codebase, database schema, API design, and all documentation are included. It is a production-ready platform with real crime data from 3 US cities (Chicago, New York, Los Angeles).
>
> For detailed technical documentation, architecture, and setup instructions, see the [`guidelines/`](./guidelines) folder in this repository.

---

## 📖 What is CrimeScope?

CrimeScope is an **Urban Safety Intelligence Platform** — a full-stack web application that visualises and analyses real crime data from major US cities using machine learning.

Built as a complete SaaS product with:
- 🗺️ **Interactive heatmap** showing real crime incidents (Leaflet.js, CartoDB tiles)
- 📊 **Analytics dashboard** with trends, category breakdowns, and time-patterns
- 🤖 **ML-powered features** — hotspot detection (DBSCAN), anomaly detection (Isolation Forest), 30/60/90-day forecasts (Prophet)
- 🔐 **Authentication** — JWT + Google OAuth
- 💳 **Payments** — Stripe subscription (Free / Pro plans)
- 📡 **REST API** — FastAPI with full Swagger docs
- 🧪 **62 automated tests** — all passing in CI

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Framer Motion |
| **Maps** | Leaflet.js + CartoDB (free, no API key needed) |
| **Charts** | Recharts |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy 2 (async), Alembic |
| **Auth** | JWT (httpOnly cookies) + Google OAuth |
| **Payments** | Stripe (Checkout + Billing Portal + Webhooks) |
| **Database** | PostgreSQL 16 (Neon serverless) |
| **Cache / Rate-limit** | Redis (Upstash serverless) |
| **ML** | scikit-learn (DBSCAN, Isolation Forest), Prophet |
| **CI/CD** | GitHub Actions |

---

## 🗂️ Project Structure

```
crimescope/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/           # Route handlers (auth, crimes, analytics, ml, payments)
│   │   ├── core/             # Config, DB, Security, Rate-limiter
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Stripe, Email, ML pipeline
│   │   └── main.py           # App factory + middleware
│   ├── alembic/              # DB migrations
│   ├── scripts/              # Data seeding scripts (Chicago, NYC, LA)
│   ├── tests/                # 62 pytest tests
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                 # Next.js 14 application
│   ├── src/
│   │   ├── app/              # Pages (dashboard, map, analytics, pricing, auth)
│   │   ├── components/       # UI components including LeafletMap
│   │   ├── stores/           # Zustand state
│   │   └── lib/              # API client, utils
│   ├── Dockerfile
│   └── next.config.js
│
├── guidelines/               # Full technical documentation & setup guides
├── .env.example              # All required environment variables
├── docker-compose.yml        # Local development stack
└── .github/workflows/        # GitHub Actions CI
```

---

## ✨ Features

| Feature | Free | Pro |
|---------|------|-----|
| Interactive crime heatmap (3 cities) | ✅ | ✅ |
| Basic analytics & charts | ✅ | ✅ |
| All cities + advanced filters | ❌ | ✅ |
| ML hotspot predictions (DBSCAN) | ❌ | ✅ |
| Anomaly detection | ❌ | ✅ |
| Time-series forecasts (30/60/90 days) | ❌ | ✅ |
| Real-time email alerts | 1 rule | Unlimited |
| CSV export | ❌ | ✅ |
| API rate limit | 100/day | 10,000/day |

---

## 📡 API Reference

The backend exposes a full REST API with auto-generated Swagger docs at `/docs`.

### Core Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Create account |
| `POST` | `/api/v1/auth/login` | — | Login → sets httpOnly cookie |
| `GET` | `/api/v1/auth/google` | — | Google OAuth flow |
| `GET` | `/api/v1/crimes/heatmap` | Optional | GeoJSON heatmap data (public) |
| `GET` | `/api/v1/crimes` | Required | Paginated crime incidents |
| `GET` | `/api/v1/analytics/dashboard` | Required | Dashboard summary stats |
| `GET` | `/api/v1/ml/hotspots` | Pro | DBSCAN cluster hotspots |
| `GET` | `/api/v1/ml/forecast` | Pro | Prophet 30/60/90-day forecast |
| `POST` | `/api/v1/payments/checkout` | Required | Stripe checkout session |
| `GET` | `/health` | — | Health check |

---

## 📊 Data Sources

All crime data is sourced from official government open data portals (free, public):

| City | Source | Dataset |
|------|--------|---------|
| Chicago | [Chicago Data Portal](https://data.cityofchicago.org/) | Crimes — 2001 to Present |
| New York City | [NYC OpenData](https://opendata.cityofnewyork.us/) | NYPD Complaint Data |
| Los Angeles | [LA Open Data](https://data.lacity.org/) | Crime Data from 2020 to Present |

> **Disclaimer:** CrimeScope displays data as provided by government sources. This platform is for research and awareness purposes only.

---

## 🚀 Running Locally

See the [`guidelines/`](./guidelines) folder for full setup instructions including environment variables, Docker Compose setup, and deployment guides.

```bash
git clone https://github.com/amithviswas/CrimeScope.git
cd CrimeScope
cp .env.example .env
# Fill in your API keys (see guidelines/ for details)
docker compose up -d
```

---

## 📞 Contact & Purchase

> **Interested in this project?**
>
> Whether you want to **continue development**, **deploy it for your organisation**, or **buy the full codebase** — I'm open to discussions.
>
> 📧 **[amithviswas0909@gmail.com](mailto:amithviswas0909@gmail.com)**
>
> The project includes the complete source code, database schema, CI/CD pipeline, ML models, and all documentation. Available at a **very reasonable price**.

---

<div align="center">

Built by [@amithviswas](https://github.com/amithviswas)

</div>
