# ⚙️ tech-stack.md — CrimeScope Full Technology Stack

---

## 🗂️ Quick Reference

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14.x | React framework, SSR/SSG |
| **Frontend UI** | Tailwind CSS | 3.4.x | Utility-first styling |
| **Frontend Components** | shadcn/ui | latest | Accessible components |
| **Maps** | Mapbox GL JS | 3.x | Interactive crime maps |
| **Charts** | Recharts | 2.x | Dashboard charts |
| **Animation** | Framer Motion | 11.x | Page + component animations |
| **State** | Zustand | 4.x | Global state management |
| **API Client** | TanStack Query | 5.x | Server state, caching |
| **Forms** | React Hook Form + Zod | latest | Validation |
| **Backend** | FastAPI | 0.110.x | REST API |
| **Language** | Python | 3.11+ | Backend runtime |
| **Database** | PostgreSQL | 16.x | Primary data store |
| **ORM** | SQLAlchemy | 2.x | DB models |
| **Migrations** | Alembic | 1.13.x | Schema versioning |
| **Cache** | Redis | 7.x | API caching, rate limiting |
| **ML** | scikit-learn | 1.4.x | DBSCAN, Isolation Forest |
| **Forecasting** | Prophet | 1.1.x | Time-series prediction |
| **Task Queue** | Celery + Redis | 5.x | Background ML jobs |
| **Scheduler** | APScheduler | 3.x | Cron-style ETL |
| **Auth** | FastAPI-Users | 13.x | User management |
| **JWT** | python-jose | 3.x | Token handling |
| **Payments** | Stripe | latest SDK | Subscriptions |
| **Email** | Resend | latest | Transactional email |
| **Containerization** | Docker + Compose | latest | Dev + prod parity |
| **Deployment** | Railway | — | Cloud hosting |
| **CDN / Storage** | Cloudflare R2 | — | File storage |
| **Monitoring** | Sentry | — | Error tracking |
| **Analytics** | PostHog | — | User behavior |
| **Testing BE** | pytest | 8.x | Unit + integration tests |
| **Testing FE** | Playwright | 1.x | E2E tests |
| **Linting BE** | Ruff | latest | Python linter |
| **Linting FE** | ESLint + Prettier | — | JS linter |

---

## 🐍 Backend — Python Dependencies

### `requirements.txt`
```txt
# Core
fastapi==0.110.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9

# Database
sqlalchemy==2.0.30
alembic==1.13.1
asyncpg==0.29.0
psycopg2-binary==2.9.9

# Auth
fastapi-users[sqlalchemy]==13.0.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4

# Cache / Queue
redis==5.0.4
celery==5.3.6
apscheduler==3.10.4

# ML / Data
scikit-learn==1.4.2
prophet==1.1.5
pandas==2.2.2
numpy==1.26.4
geopandas==0.14.4
shapely==2.0.4

# HTTP / APIs
httpx==0.27.0
aiohttp==3.9.5

# Payments
stripe==9.6.0

# Email
resend==0.7.2

# Utils
python-dotenv==1.0.1
slowapi==0.1.9
pydantic==2.7.1
pydantic-settings==2.2.1

# Dev / Test
pytest==8.2.0
pytest-asyncio==0.23.6
httpx==0.27.0
ruff==0.4.4
```

---

## ⚡ Frontend — Node Dependencies

### `package.json`
```json
{
  "dependencies": {
    "next": "14.2.3",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "tailwindcss": "3.4.3",
    "@tanstack/react-query": "5.40.0",
    "zustand": "4.5.2",
    "react-hook-form": "7.51.5",
    "zod": "3.23.8",
    "framer-motion": "11.2.10",
    "recharts": "2.12.7",
    "mapbox-gl": "3.4.0",
    "react-map-gl": "7.1.7",
    "@radix-ui/react-dialog": "1.0.5",
    "@radix-ui/react-dropdown-menu": "2.0.6",
    "@radix-ui/react-select": "2.0.0",
    "@radix-ui/react-tabs": "1.0.4",
    "@radix-ui/react-tooltip": "1.0.7",
    "class-variance-authority": "0.7.0",
    "clsx": "2.1.1",
    "date-fns": "3.6.0",
    "lucide-react": "0.383.0",
    "axios": "1.7.2",
    "@stripe/stripe-js": "3.4.1",
    "@stripe/react-stripe-js": "2.7.1"
  },
  "devDependencies": {
    "typescript": "5.4.5",
    "@types/react": "18.3.3",
    "@types/node": "20.14.2",
    "eslint": "8.57.0",
    "prettier": "3.3.2",
    "@playwright/test": "1.44.1"
  }
}
```

---

## 🐳 Docker Compose Structure

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, redis]
    env_file: .env

  celery_worker:
    build: ./backend
    command: celery -A app.worker worker
    depends_on: [postgres, redis]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: [backend]
```

---

## 📁 Project Folder Structure

```
crimescope/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── crimes.py
│   │   │   │   ├── analytics.py
│   │   │   │   ├── ml.py
│   │   │   │   ├── users.py
│   │   │   │   └── payments.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   └── database.py
│   │   ├── models/
│   │   │   ├── crime.py
│   │   │   ├── user.py
│   │   │   └── subscription.py
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── data_ingestion.py
│   │   │   ├── ml_service.py
│   │   │   └── stripe_service.py
│   │   ├── ml/
│   │   │   ├── hotspot.py
│   │   │   ├── forecast.py
│   │   │   └── anomaly.py
│   │   ├── tasks/
│   │   │   └── etl_tasks.py
│   │   └── main.py
│   ├── alembic/
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   └── reset-password/
│   │   │   ├── dashboard/
│   │   │   ├── map/
│   │   │   ├── analytics/
│   │   │   ├── alerts/
│   │   │   ├── reports/
│   │   │   ├── settings/
│   │   │   └── pricing/
│   │   ├── components/
│   │   │   ├── ui/          ← shadcn components
│   │   │   ├── map/
│   │   │   ├── charts/
│   │   │   ├── dashboard/
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   ├── stores/          ← Zustand stores
│   │   └── types/
│   ├── public/
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```
