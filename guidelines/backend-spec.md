# 🔧 backend-spec.md — CrimeScope Backend Specification

---

## 🗄️ Database Schema

### Table: `users`
```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255),
    full_name   VARCHAR(255),
    is_active   BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    oauth_provider VARCHAR(50),     -- 'google' or null
    oauth_id    VARCHAR(255),
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);
```

### Table: `subscriptions`
```sql
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id  VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    plan            VARCHAR(50) NOT NULL,  -- 'free', 'pro', 'enterprise'
    status          VARCHAR(50) NOT NULL,  -- 'active', 'canceled', 'past_due'
    current_period_start TIMESTAMP,
    current_period_end   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### Table: `crime_incidents`
```sql
CREATE TABLE crime_incidents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id     VARCHAR(255) UNIQUE,   -- source system ID
    city            VARCHAR(100) NOT NULL,
    category        VARCHAR(100) NOT NULL,  -- ASSAULT, THEFT, etc.
    subcategory     VARCHAR(100),
    description     TEXT,
    latitude        DECIMAL(9, 6) NOT NULL,
    longitude       DECIMAL(9, 6) NOT NULL,
    location_name   VARCHAR(255),
    district        VARCHAR(100),
    neighborhood    VARCHAR(100),
    occurred_at     TIMESTAMP NOT NULL,
    reported_at     TIMESTAMP,
    resolved        BOOLEAN DEFAULT FALSE,
    source_api      VARCHAR(100),           -- which city API
    raw_data        JSONB,                  -- original record
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crimes_location ON crime_incidents USING gist(
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);
CREATE INDEX idx_crimes_occurred ON crime_incidents(occurred_at);
CREATE INDEX idx_crimes_category ON crime_incidents(category);
CREATE INDEX idx_crimes_city ON crime_incidents(city);
```

### Table: `hotspots`
```sql
CREATE TABLE hotspots (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city        VARCHAR(100),
    cluster_id  INTEGER,
    center_lat  DECIMAL(9, 6),
    center_lng  DECIMAL(9, 6),
    radius_m    DECIMAL(8, 2),
    incident_count INTEGER,
    risk_score  DECIMAL(5, 2),           -- 0.0 to 10.0
    categories  JSONB,                   -- {ASSAULT: 12, THEFT: 8}
    generated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `forecasts`
```sql
CREATE TABLE forecasts (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(100),
    category        VARCHAR(100),
    district        VARCHAR(100),
    forecast_date   DATE NOT NULL,
    predicted_count INTEGER,
    lower_bound     INTEGER,
    upper_bound     INTEGER,
    confidence      DECIMAL(5, 4),
    model_version   VARCHAR(50),
    generated_at    TIMESTAMP DEFAULT NOW()
);
```

### Table: `anomalies`
```sql
CREATE TABLE anomalies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city            VARCHAR(100),
    district        VARCHAR(100),
    category        VARCHAR(100),
    detected_at     TIMESTAMP DEFAULT NOW(),
    severity        VARCHAR(20),        -- 'low', 'medium', 'high', 'critical'
    actual_count    INTEGER,
    expected_count  INTEGER,
    deviation_pct   DECIMAL(8, 2),
    description     TEXT,
    is_resolved     BOOLEAN DEFAULT FALSE,
    resolved_at     TIMESTAMP
);
```

### Table: `alerts`
```sql
CREATE TABLE alerts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    city        VARCHAR(100),
    district    VARCHAR(100),
    categories  TEXT[],
    threshold   INTEGER,               -- alert when count > threshold
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);
```

### Table: `data_ingestion_logs`
```sql
CREATE TABLE data_ingestion_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source      VARCHAR(100),
    city        VARCHAR(100),
    records_fetched INTEGER,
    records_inserted INTEGER,
    records_skipped  INTEGER,
    status      VARCHAR(50),           -- 'success', 'partial', 'failed'
    error_msg   TEXT,
    started_at  TIMESTAMP,
    completed_at TIMESTAMP
);
```

---

## 🔗 API Routes — Full Specification

### Base URL: `http://localhost:8000/api/v1`

---

### AUTH `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | None | Register new user |
| POST | `/auth/login` | None | Login → returns JWT |
| POST | `/auth/logout` | JWT | Invalidate token |
| POST | `/auth/refresh` | Refresh Token | Get new access token |
| POST | `/auth/forgot-password` | None | Send reset email |
| POST | `/auth/reset-password` | None | Reset with token |
| GET | `/auth/verify/{token}` | None | Verify email |
| GET | `/auth/google` | None | OAuth redirect |
| GET | `/auth/google/callback` | None | OAuth callback |
| GET | `/auth/me` | JWT | Get current user |
| PATCH | `/auth/me` | JWT | Update profile |

**Register Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Login Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": { "id": "uuid", "email": "...", "plan": "free" }
}
```

---

### CRIMES `/api/v1/crimes`

| Method | Endpoint | Auth | Plan | Description |
|--------|----------|------|------|-------------|
| GET | `/crimes` | JWT | Free+ | List crimes with filters |
| GET | `/crimes/{id}` | JWT | Free+ | Single incident detail |
| GET | `/crimes/stats/summary` | JWT | Free+ | Aggregate stats |
| GET | `/crimes/stats/by-category` | JWT | Free+ | Breakdown by type |
| GET | `/crimes/stats/by-time` | JWT | Pro+ | Time-series data |
| GET | `/crimes/stats/by-district` | JWT | Free+ | District comparison |
| GET | `/crimes/heatmap` | JWT | Free+ | GeoJSON for map |
| GET | `/crimes/export` | JWT | Pro+ | CSV/JSON export |

**GET /crimes Query Params:**
```
city        string   required  e.g. "chicago"
start_date  date     required  ISO 8601
end_date    date     required  ISO 8601
category    string   optional  ASSAULT, THEFT, VANDALISM, ...
district    string   optional
lat         float    optional  center point for radius search
lng         float    optional
radius_m    int      optional  default 1000
limit       int      optional  default 100, max 1000
offset      int      optional  default 0
```

**GET /crimes Response:**
```json
{
  "total": 4821,
  "data": [
    {
      "id": "uuid",
      "category": "THEFT",
      "subcategory": "MOTOR VEHICLE",
      "description": "Vehicle broken into",
      "latitude": 41.8781,
      "longitude": -87.6298,
      "location_name": "N Michigan Ave",
      "district": "Loop",
      "occurred_at": "2024-03-15T14:23:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 100, "total_pages": 49 }
}
```

---

### ANALYTICS `/api/v1/analytics`

| Method | Endpoint | Auth | Plan | Description |
|--------|----------|------|------|-------------|
| GET | `/analytics/dashboard` | JWT | Free+ | Main dashboard stats |
| GET | `/analytics/trends` | JWT | Pro+ | 30/90/365 day trends |
| GET | `/analytics/compare` | JWT | Pro+ | Compare time periods |
| GET | `/analytics/top-locations` | JWT | Free+ | Highest crime areas |
| GET | `/analytics/category-breakdown` | JWT | Free+ | Category pie data |
| GET | `/analytics/hourly-pattern` | JWT | Pro+ | Crime by hour of day |
| GET | `/analytics/weekly-pattern` | JWT | Pro+ | Crime by day of week |

**GET /analytics/dashboard Response:**
```json
{
  "period": "last_30_days",
  "total_incidents": 1243,
  "change_pct": -4.2,
  "top_category": "THEFT",
  "safest_district": "Lincoln Square",
  "highest_district": "West Garfield Park",
  "resolved_rate": 0.34,
  "stats_by_category": [
    { "category": "THEFT", "count": 412, "pct": 33.1 }
  ]
}
```

---

### ML `/api/v1/ml`

| Method | Endpoint | Auth | Plan | Description |
|--------|----------|------|------|-------------|
| GET | `/ml/hotspots` | JWT | Pro+ | Current crime hotspots |
| GET | `/ml/forecast` | JWT | Pro+ | 7/30 day prediction |
| GET | `/ml/anomalies` | JWT | Pro+ | Detected anomalies |
| GET | `/ml/risk-score/{district}` | JWT | Pro+ | District risk index |
| POST | `/ml/retrain` | Admin | Admin | Trigger model retrain |
| GET | `/ml/model-status` | JWT | Pro+ | Last trained, accuracy |

**GET /ml/hotspots Response:**
```json
{
  "city": "chicago",
  "generated_at": "2024-06-01T00:00:00Z",
  "hotspots": [
    {
      "cluster_id": 1,
      "center": { "lat": 41.878, "lng": -87.630 },
      "radius_m": 450,
      "incident_count": 89,
      "risk_score": 8.7,
      "top_category": "ASSAULT",
      "categories": { "ASSAULT": 34, "THEFT": 28, "ROBBERY": 27 }
    }
  ]
}
```

**GET /ml/forecast Response:**
```json
{
  "city": "chicago",
  "category": "THEFT",
  "district": "Loop",
  "forecast": [
    {
      "date": "2024-06-02",
      "predicted": 42,
      "lower": 35,
      "upper": 51
    }
  ]
}
```

---

### PAYMENTS `/api/v1/payments`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/payments/plans` | None | List all pricing plans |
| POST | `/payments/checkout` | JWT | Create Stripe checkout |
| POST | `/payments/portal` | JWT | Stripe billing portal |
| GET | `/payments/subscription` | JWT | Current subscription |
| POST | `/payments/webhook` | Stripe Sig | Stripe webhook handler |
| POST | `/payments/cancel` | JWT | Cancel subscription |

**POST /payments/checkout Request:**
```json
{
  "plan": "pro",
  "billing_cycle": "monthly"
}
```

**POST /payments/checkout Response:**
```json
{
  "checkout_url": "https://checkout.stripe.com/..."
}
```

---

### ALERTS `/api/v1/alerts`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/alerts` | JWT | List user's alerts |
| POST | `/alerts` | JWT | Create new alert |
| PATCH | `/alerts/{id}` | JWT | Update alert |
| DELETE | `/alerts/{id}` | JWT | Delete alert |
| GET | `/alerts/triggered` | JWT | Recently triggered |

---

### ADMIN `/api/v1/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/ingestion-logs` | Admin | ETL job history |
| POST | `/admin/ingest` | Admin | Trigger manual ingest |
| GET | `/admin/stats` | Admin | System-wide stats |

---

## 🤖 ML Pipeline Implementation

### 1. Hotspot Detection (DBSCAN)
```python
# app/ml/hotspot.py
from sklearn.cluster import DBSCAN
import numpy as np

def detect_hotspots(incidents: list, eps_km=0.5, min_samples=10):
    """
    eps_km: radius in km (0.5 = 500m)
    min_samples: min incidents to form cluster
    """
    coords = np.array([[i.latitude, i.longitude] for i in incidents])
    # Convert km to radians for haversine
    eps_rad = eps_km / 6371.0
    
    db = DBSCAN(
        eps=eps_rad,
        min_samples=min_samples,
        algorithm='ball_tree',
        metric='haversine'
    ).fit(np.radians(coords))
    
    # Process clusters → hotspot objects
    # Calculate risk score (0-10) based on incident density + recency
    return hotspots
```

### 2. Time-Series Forecasting (Prophet)
```python
# app/ml/forecast.py
from prophet import Prophet
import pandas as pd

def train_forecast_model(city: str, category: str, district: str):
    df = load_daily_counts(city, category, district)  # from DB
    df = df.rename(columns={'date': 'ds', 'count': 'y'})
    
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    model.add_country_holidays(country_name='US')
    model.fit(df)
    
    # Predict next 30 days
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(30)
```

### 3. Anomaly Detection (Isolation Forest)
```python
# app/ml/anomaly.py
from sklearn.ensemble import IsolationForest

def detect_anomalies(city: str, district: str):
    df = load_weekly_counts(city, district)
    
    model = IsolationForest(
        contamination=0.05,  # expect 5% anomalies
        random_state=42
    )
    df['anomaly'] = model.fit_predict(df[['count']])
    # -1 = anomaly, 1 = normal
    
    anomalies = df[df['anomaly'] == -1]
    return anomalies
```

---

## 🔄 ETL Data Pipeline

### Celery Tasks
```python
# app/tasks/etl_tasks.py
from celery import Celery

@celery.task
def ingest_city_data(city: str):
    """Fetch latest crime data from city API"""
    # 1. Call city API (see api-integrations.md)
    # 2. Normalize to standard schema
    # 3. Upsert into crime_incidents table
    # 4. Log results to data_ingestion_logs
    pass

@celery.task  
def retrain_ml_models(city: str):
    """Retrain hotspot + forecast + anomaly models"""
    detect_hotspots_and_save(city)
    train_all_forecasts(city)
    detect_all_anomalies(city)

# Schedule: Run every day at 2am
from apscheduler.schedulers.asyncio import AsyncIOScheduler
scheduler = AsyncIOScheduler()
scheduler.add_job(ingest_city_data, 'cron', hour=2, args=['chicago'])
scheduler.add_job(retrain_ml_models, 'cron', hour=3, args=['chicago'])
```

---

## 🛡️ Security Implementation

### Rate Limiting
```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/auth/login")
@limiter.limit("5/minute")   # brute force protection
async def login(request: Request, ...):
    ...

@router.get("/crimes")
@limiter.limit("100/minute")  # general API limit
async def get_crimes(...):
    ...
```

### JWT Configuration
```python
# Access token: 1 hour
# Refresh token: 30 days
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 30
ALGORITHM = "HS256"
```

### CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://crimescope.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
