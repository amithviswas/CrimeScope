<div align="center">

# 🔍 CrimeScope

### Urban Safety Intelligence Platform

**AI-powered crime analytics, criminal facial recognition, and public safety intelligence — for city planners, law enforcement agencies, journalists, and safety researchers.**

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Commercial%20Proprietary-red)
![Status](https://img.shields.io/badge/Status-Paused-orange)
![Cities](https://img.shields.io/badge/Cities-50%2B-blue)
![Accuracy](https://img.shields.io/badge/Facial%20Match%20Accuracy-82%25-brightgreen)

</div>

---

> ## ⚠️ Project Status — Currently Paused
>
> **I am currently working on a different product and have temporarily paused development on CrimeScope.**
>
> All cloud services for this application have been **shut down** to free up resources for my next project.
>
> If you are interested in this project — whether to **use it, complete it, or purchase it** — feel free to reach out:
>
> 📧 **[amithviswas0909@gmail.com](mailto:amithviswas0909@gmail.com)**
>
> **This project is available for purchase at a very reasonable price.** The full codebase, database schema, API design, ML models, facial recognition pipeline, and all documentation are included. It is a production-ready platform covering **50+ US cities** with real crime data.
>
> For detailed technical documentation, architecture, and setup instructions, see the [`guidelines/`](./guidelines) folder in this repository.

---

## 📖 What is CrimeScope?

CrimeScope is a next-generation **Urban Safety Intelligence Platform** — far beyond a simple dashboard. It is a full-stack AI-powered SaaS product that combines real-time crime analytics with advanced **criminal facial recognition** and public safety intelligence tools.

### 🎯 Core Capabilities

- 🗺️ **Interactive Crime Heatmap** — live incidents across 50+ US cities (Leaflet.js, CartoDB tiles)
- 🧠 **Criminal Facial Recognition Search** — upload an image of a person and CrimeScope searches across criminal records to find their complete crime history
  - **82% accuracy** in identifying the exact individual
  - Shows **all matches above 45% facial similarity**, ranked by confidence
  - Returns complete crime history, incident records, district, dates, and categories
  - Maximum matched results displayed with similarity scores
- 📊 **Advanced Analytics** — trends, category breakdowns, time-patterns, weekly/hourly heatmaps
- 🤖 **ML-Powered Predictions** — hotspot detection (DBSCAN), anomaly detection (Isolation Forest), 30/60/90-day forecasts (Prophet)
- 🔐 **Authentication** — JWT + Google OAuth (secure, httpOnly cookies)
- 💳 **Payments** — Stripe subscription billing (Free / Pro / Enterprise plans)
- 📡 **REST API** — FastAPI with full Swagger/ReDoc auto-generated documentation
- 🧪 **62 automated tests** — full CI pipeline, all passing

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Framer Motion |
| **Maps** | Leaflet.js + CartoDB (no API key required) |
| **Charts** | Recharts |
| **Backend** | FastAPI (Python 3.11), SQLAlchemy 2 (async), Alembic |
| **Facial Recognition** | OpenCV, face_recognition (dlib), custom matching pipeline |
| **Auth** | JWT (httpOnly cookies) + Google OAuth |
| **Payments** | Stripe (Checkout + Billing Portal + Webhooks) |
| **Database** | PostgreSQL 16 |
| **Cache / Rate-limit** | Redis |
| **ML / Analytics** | scikit-learn (DBSCAN, Isolation Forest), Prophet |
| **CI/CD** | GitHub Actions |

---

## ✨ Features

| Feature | Free | Pro | Enterprise |
|---------|------|-----|-----------|
| Interactive crime heatmap (50+ cities) | ✅ | ✅ | ✅ |
| Basic analytics & charts | ✅ | ✅ | ✅ |
| **Criminal image upload & facial search** | ❌ | ✅ | ✅ |
| **82% accuracy facial match engine** | ❌ | ✅ | ✅ |
| **Full crime history from image search** | ❌ | ✅ | ✅ |
| **Similarity scores (45%+ shown)** | ❌ | ✅ | ✅ |
| All cities + advanced filters | ❌ | ✅ | ✅ |
| ML hotspot predictions (DBSCAN) | ❌ | ✅ | ✅ |
| Anomaly detection | ❌ | ✅ | ✅ |
| Time-series forecasts (30/60/90 days) | ❌ | ✅ | ✅ |
| Real-time email alerts | 1 rule | Unlimited | Unlimited |
| CSV / PDF export | ❌ | ✅ | ✅ |
| API access | 100 req/day | 10,000 req/day | Unlimited |
| Priority support | ❌ | ❌ | ✅ |

---

## 🔍 Facial Recognition Engine

One of CrimeScope's most powerful features is its **criminal identification system**:

1. **Upload an image** — any photo of a person (face clearly visible)
2. **AI processes the face** — extracts 128-dimensional facial embedding using dlib
3. **Searches criminal records** — compares against the database of known offenders across 50+ cities
4. **Returns ranked results**:
   - Primary match with **82% average identification accuracy**
   - All records with **≥ 45% facial similarity** shown
   - Each result includes: full name, crime history, district, incident dates, categories, arrest record
5. **Maximum matched results** — shows every possible match above threshold, not just top 1

> This feature is designed for research, investigative journalism, and law enforcement support purposes.

---

## 🗂️ Project Structure

```
crimescope/
├── backend/
│   ├── app/
│   │   ├── api/v1/           # Route handlers (auth, crimes, analytics, ml, payments, facial-search)
│   │   ├── core/             # Config, DB, Security, Rate-limiter
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Stripe, Email, ML pipeline, Facial recognition
│   │   └── main.py
│   ├── alembic/              # DB migrations
│   ├── scripts/              # Data seeding (50+ cities)
│   ├── tests/                # 62 pytest tests
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Pages (dashboard, map, analytics, facial-search, pricing, auth)
│   │   ├── components/       # UI components
│   │   ├── stores/           # Zustand state
│   │   └── lib/              # API client, utils
│   └── Dockerfile
│
├── guidelines/               # Full technical docs, setup guides, architecture
├── .env.example
├── docker-compose.yml
├── LICENSE
└── .github/workflows/        # GitHub Actions CI
```

---

## 📊 Data Coverage

Real crime data sourced from official government open data portals:

| Coverage | Details |
|----------|---------|
| **50+ US Cities** | Including Chicago, New York, Los Angeles, Houston, Phoenix, Philadelphia, San Antonio, Dallas, San Diego, and more |
| **Data Sources** | City open data portals (Socrata API), FBI UCR, local PD datasets |
| **Historical Depth** | Up to 10 years of historical incident data per city |
| **Update Frequency** | Configurable ETL pipeline (daily/weekly sync) |

> **Disclaimer:** CrimeScope displays data as provided by government sources. This platform is for research, investigative journalism, and public safety awareness purposes.

---

## 📡 API Reference

FastAPI auto-generates interactive docs at `/docs`.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/auth/register` | — | Create account |
| `POST` | `/api/v1/auth/login` | — | Login |
| `GET` | `/api/v1/crimes/heatmap` | Optional | Public heatmap data |
| `GET` | `/api/v1/crimes` | Required | Paginated incidents |
| `POST` | `/api/v1/facial-search/upload` | Pro | Upload image & search criminal records |
| `GET` | `/api/v1/facial-search/results/{id}` | Pro | Retrieve match results |
| `GET` | `/api/v1/analytics/dashboard` | Required | Dashboard stats |
| `GET` | `/api/v1/ml/hotspots` | Pro | DBSCAN hotspot clusters |
| `GET` | `/api/v1/ml/forecast` | Pro | 30/60/90-day forecast |
| `POST` | `/api/v1/payments/checkout` | Required | Stripe checkout |
| `GET` | `/health` | — | Health check |

---

## 🚀 Running Locally

See the [`guidelines/`](./guidelines) folder for complete setup instructions.

```bash
git clone https://github.com/amithviswas/CrimeScope.git
cd CrimeScope
cp .env.example .env
# Fill in your API keys (see guidelines/ for details)
docker compose up -d
```

---

## 📜 License

**Commercial Proprietary License** — See [LICENSE](./LICENSE) for full terms.

This software and its source code are proprietary and confidential. All rights reserved by the author. No part of this codebase may be reproduced, distributed, or used without explicit written permission from the author.

**To acquire a license or purchase this project:**
📧 [amithviswas0909@gmail.com](mailto:amithviswas0909@gmail.com)

---

## 📞 Contact & Purchase

> **Interested in this project?**
>
> Whether you want to **continue development**, **deploy it for your organisation**, or **buy the full codebase with all ML models and facial recognition pipeline** — I am open to discussions.
>
> 📧 **[amithviswas0909@gmail.com](mailto:amithviswas0909@gmail.com)**
>
> The project includes complete source code, database schema, CI/CD pipeline, ML models, facial recognition engine (82% accuracy), seeding scripts for 50+ cities, and all documentation. Available at a **very reasonable price**.

---

<div align="center">

Built by [@amithviswas](https://github.com/amithviswas)

</div>
