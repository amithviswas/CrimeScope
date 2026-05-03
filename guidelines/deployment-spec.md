# 🚀 deployment-spec.md — CrimeScope Cloud Deployment

---

## 🏗️ Infrastructure Overview

```
crimescope.app (Cloudflare DNS + Proxy)
    │
    ├── frontend.crimescope.app → Railway (Next.js)
    ├── api.crimescope.app     → Railway (FastAPI)
    ├── DB                     → Railway (PostgreSQL 16)
    ├── Cache                  → Railway (Redis 7)
    └── Files                  → Cloudflare R2 (exports, reports)
```

**Why Railway:** Free hobby tier, Dockerfile deploy, built-in PostgreSQL + Redis, easy env vars, auto-deploy from GitHub.

---

## 📋 Pre-Deployment Checklist

- [ ] All tests passing (`pytest` + `playwright`)
- [ ] `.env.example` updated with all new vars
- [ ] No hardcoded secrets anywhere in code
- [ ] `DEBUG=False` for production
- [ ] `ALLOWED_HOSTS` set correctly
- [ ] Database migrations ready
- [ ] Stripe webhook URL updated to production
- [ ] Google OAuth redirect URIs include production URL
- [ ] Sentry DSN configured for production project
- [ ] Resend domain verified

---

## 🌿 Environment Variables

### `.env.example` (commit this, not `.env`)
```bash
# ═══════════════════════════════════════
# APP
# ═══════════════════════════════════════
APP_NAME=CrimeScope
ENVIRONMENT=production          # development | production
DEBUG=False
SECRET_KEY=                     # python -c "import secrets; print(secrets.token_hex(32))"
BACKEND_URL=https://api.crimescope.app
FRONTEND_URL=https://crimescope.app

# ═══════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/crimescope
REDIS_URL=redis://host:6379/0

# ═══════════════════════════════════════
# AUTH
# ═══════════════════════════════════════
JWT_SECRET_KEY=                 # separate from APP SECRET_KEY
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ═══════════════════════════════════════
# CRIME DATA APIs
# ═══════════════════════════════════════
CHICAGO_API_TOKEN=
NYC_API_TOKEN=
LA_API_TOKEN=

# ═══════════════════════════════════════
# PAYMENTS
# ═══════════════════════════════════════
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...

# ═══════════════════════════════════════
# EMAIL
# ═══════════════════════════════════════
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@crimescope.app
ALERTS_EMAIL=alerts@crimescope.app

# ═══════════════════════════════════════
# MONITORING
# ═══════════════════════════════════════
SENTRY_DSN=

# ═══════════════════════════════════════
# FRONTEND (prefix NEXT_PUBLIC_ for client-side)
# ═══════════════════════════════════════
NEXT_PUBLIC_API_URL=https://api.crimescope.app
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 🐳 Dockerfiles

### Backend Dockerfile
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (for psycopg2, geopandas)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libgeos-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run migrations then start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
```

### Frontend Dockerfile
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

### `next.config.js` (required for standalone output)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
}
module.exports = nextConfig
```

---

## 🚂 Railway Deployment Steps

### Step 1 — Create Railway Account
1. Go to `https://railway.app` → Sign up with GitHub
2. New Project → Deploy from GitHub repo

### Step 2 — Add Services
In Railway dashboard, add 4 services:

**Service 1: PostgreSQL**
- Click "+ New" → Database → PostgreSQL
- Copy `DATABASE_URL` from Variables tab

**Service 2: Redis**
- Click "+ New" → Database → Redis
- Copy `REDIS_URL` from Variables tab

**Service 3: Backend**
- Click "+ New" → GitHub Repo → select your repo
- Set Root Directory: `backend`
- Railway auto-detects Dockerfile
- Add all backend env vars from `.env`

**Service 4: Frontend**
- Click "+ New" → GitHub Repo → same repo
- Set Root Directory: `frontend`
- Railway auto-detects Dockerfile
- Add all frontend env vars

### Step 3 — Custom Domains
- Backend service → Settings → Domains → "api.crimescope.app"
- Frontend service → Settings → Domains → "crimescope.app"
- In Cloudflare: add CNAME records pointing to Railway URLs

### Step 4 — Auto-Deploy
Railway auto-deploys on every push to `main` branch. Done.

---

## 🔒 SSL / HTTPS

Railway provides SSL automatically for custom domains.
Cloudflare provides additional SSL + DDoS protection.

Cloudflare SSL Mode: **Full (Strict)**

---

## 📊 Database Migrations in Production

```bash
# Railway CLI — run migrations manually if needed
railway run --service backend alembic upgrade head

# Or set in Dockerfile CMD (already done above):
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app ..."]
```

---

## 🔁 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Test & Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: crimescope_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest --tb=short
        env:
          DATABASE_URL: postgresql+asyncpg://postgres:test@localhost/crimescope_test
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: test-secret-key
          JWT_SECRET_KEY: test-jwt-key

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: cd frontend && npx playwright install --with-deps
      - run: cd frontend && npx playwright test

  # Railway deploys automatically on push to main
  # No manual deploy step needed
```

---

## 📈 Post-Deploy Verification

After every deploy, verify these endpoints:

```bash
# Health check
curl https://api.crimescope.app/health
# Expected: {"status":"ok","db":"connected","redis":"connected"}

# Auth working
curl -X POST https://api.crimescope.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test#1234"}'

# Crimes API
curl https://api.crimescope.app/api/v1/crimes?city=chicago \
  -H "Authorization: Bearer <token>"

# Check OpenAPI docs accessible
curl https://api.crimescope.app/docs
```

---

## 🔥 Health Check Endpoint

```python
# app/api/health.py
@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    # Test DB connection
    try:
        await db.execute("SELECT 1")
        db_status = "connected"
    except Exception:
        db_status = "error"

    # Test Redis connection
    try:
        await redis.ping()
        redis_status = "connected"
    except Exception:
        redis_status = "error"

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "db": db_status,
        "redis": redis_status,
        "version": settings.APP_VERSION
    }
```
