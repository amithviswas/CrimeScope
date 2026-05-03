# 🧠 CrimeScope.md — Master AI Build Prompt

> **HOW TO USE THIS FILE:**
> Say to your AI agent: *"Go to the CrimeScope.md file in the project and follow the prompt thoroughly, step-by-step, to build out the software. Also look at the brand-guidelines.md file to ensure all brand guidelines are correctly applied throughout every component you build."*

---

## 🎯 Project Overview

**Product Name:** CrimeScope  
**Tagline:** *Urban Safety Intelligence — Powered by Data*  
**Type:** Full-Stack SaaS Web Application  
**Domain:** Public Safety Analytics  

CrimeScope is a production-grade, AI-powered crime and public safety analytics platform. It ingests real government open data, processes it through a Python data pipeline, stores it in PostgreSQL, runs ML models for hotspot prediction and anomaly detection, and presents everything through a stunning, interactive dashboard.

This is NOT a toy project. Build it like a funded startup would.

---

## 📁 Project File Map

Read ALL of these files before writing a single line of code:

| File | Purpose |
|------|---------|
| `CrimeScope.md` | ← You are here. Master build instructions |
| `brand-guidelines.md` | Visual identity, colors, fonts, tone |
| `tech-stack.md` | Every library, version, and why |
| `backend-spec.md` | API routes, database schema, ML pipeline |
| `frontend-spec.md` | All pages, components, interactions |
| `api-integrations.md` | External APIs, keys, setup steps |
| `auth-spec.md` | Auth flow, OAuth, security rules |
| `payment-spec.md` | Stripe integration, plans, webhooks |
| `deployment-spec.md` | Docker, cloud deploy, environment vars |
| `launch-checklist.md` | Pre-launch SaaS checklist — must pass all |

---

## 🏗️ Build Order — Follow This Exactly

### PHASE 1 — Project Scaffold (Day 1–2)
1. Read `tech-stack.md` fully
2. Read `brand-guidelines.md` fully  
3. Scaffold backend: FastAPI + PostgreSQL + Alembic
4. Scaffold frontend: Next.js 14 + Tailwind + shadcn/ui
5. Set up Docker Compose (backend + frontend + postgres + redis)
6. Confirm both servers run locally — screenshot as proof

### PHASE 2 — Database & Data Pipeline (Day 3–7)
1. Read `backend-spec.md` — implement all DB schemas
2. Run Alembic migrations
3. Implement data ingestion scripts (see `api-integrations.md`)
4. Seed database with 10,000+ real crime records
5. Verify data in pgAdmin or psql

### PHASE 3 — Backend API (Day 8–14)
1. Implement all REST endpoints from `backend-spec.md`
2. Add JWT auth middleware
3. Add rate limiting (slowapi)
4. Write pytest tests for every endpoint
5. Generate OpenAPI docs at `/docs`

### PHASE 4 — ML Pipeline (Day 15–21)
1. Implement hotspot clustering (DBSCAN)
2. Implement time-series forecasting (Prophet)
3. Implement anomaly detection (Isolation Forest)
4. Expose predictions via `/api/v1/ml/` endpoints
5. Schedule auto-retraining with APScheduler

### PHASE 5 — Frontend Dashboard (Day 22–35)
1. Read `frontend-spec.md` and `brand-guidelines.md` together
2. Build all pages listed in `frontend-spec.md`
3. Apply brand guidelines to EVERY component — no exceptions
4. Implement all map, chart, and filter interactions
5. Make fully responsive (mobile + tablet + desktop)

### PHASE 6 — Auth + Payments (Day 36–42)
1. Read `auth-spec.md` — implement full auth flow
2. Read `payment-spec.md` — implement Stripe
3. Test all subscription lifecycle events
4. Test OAuth (Google)

### PHASE 7 — Polish + Launch (Day 43–56)
1. Run full `launch-checklist.md` — every item must pass
2. Deploy to cloud (see `deployment-spec.md`)
3. Configure domain + SSL
4. Submit to Google Search Console
5. Write README with screenshots

---

## 🚫 Hard Rules — Never Violate

- Never use placeholder/lorem ipsum in final build
- Never skip error handling — every API call has try/catch
- Never commit secrets — use `.env` files only
- Never use Arial, Roboto, or Inter fonts (see brand-guidelines.md)
- Never build a feature without a corresponding test
- Every page must have proper meta tags (SEO)
- Every form must have validation (frontend + backend)
- Mobile-first CSS always

---

## ✅ Definition of Done

The project is complete when:
- [ ] All 10 pages render without errors
- [ ] ML predictions load in < 2 seconds
- [ ] Auth flow works end-to-end (signup → verify → login → reset)
- [ ] Payment flow works (subscribe → upgrade → cancel)
- [ ] All launch-checklist.md items checked
- [ ] Deployed live with real domain
- [ ] README has screenshots and live demo link
- [ ] Resume bullet points written (see bottom of this file)

---

## 📄 Resume Bullets (Copy After Completion)

```
• Built CrimeScope — end-to-end SaaS crime analytics platform with 
  real-time data ingestion, PostgreSQL, ML hotspot prediction (DBSCAN + Prophet),
  and interactive map dashboard. Deployed on Railway with Docker.

• Engineered Python data pipeline ingesting 100K+ public crime records 
  from city open data APIs; automated ETL with Apache Airflow.

• Implemented full SaaS auth system (JWT + Google OAuth) and Stripe 
  subscription billing with webhook lifecycle management.

• Built responsive Next.js 14 frontend with Mapbox GL, Recharts, 
  and Framer Motion — serving real-time ML predictions via FastAPI.
```
