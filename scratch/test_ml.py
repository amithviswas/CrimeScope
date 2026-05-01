
import sys
import os
from datetime import datetime, timedelta
import random

# Add backend to path
sys.path.append(os.path.abspath("backend"))

from app.ml.hotspot import compute_hotspots
from app.ml.forecast import forecast_prophet
from app.ml.anomaly import detect_anomalies

def test_hotspots():
    print("Testing hotspots...")
    incidents = []
    for _ in range(50):
        # Generate around Chicago center: 41.88, -87.63
        incidents.append({
            "latitude": 41.88 + random.uniform(-0.01, 0.01),
            "longitude": -87.63 + random.uniform(-0.01, 0.01),
            "category": random.choice(["THEFT", "ASSAULT"])
        })
    res = compute_hotspots(incidents)
    print(f"Found {len(res)} hotspots.")
    if res:
        print(f"Top hotspot risk: {res[0].risk_score}, count: {res[0].incident_count}")

def test_forecast():
    print("Testing forecast...")
    incidents = []
    base_date = datetime.utcnow() - timedelta(days=60)
    for i in range(60):
        # simulate some trend
        count = int(20 + i * 0.5 + random.randint(-5, 5))
        for _ in range(max(1, count)):
            incidents.append({
                "occurred_at": base_date + timedelta(days=i),
                "category": "THEFT"
            })
    res = forecast_prophet(incidents, horizon_days=7)
    print(f"Forecasted {len(res)} days.")
    if res:
        print(f"First forecast: {res[0].predicted_count} on {res[0].forecast_date}")

def test_anomaly():
    print("Testing anomaly...")
    incidents = []
    base_date = datetime.utcnow() - timedelta(days=60)
    # normal days
    for i in range(59):
        count = random.randint(10, 15)
        for _ in range(count):
            incidents.append({
                "occurred_at": base_date + timedelta(days=i),
                "category": "THEFT",
                "district": "Loop"
            })
    # anomalous day (spike)
    for _ in range(50):
        incidents.append({
             "occurred_at": base_date + timedelta(days=59),
             "category": "THEFT",
             "district": "Loop"
        })
    res = detect_anomalies(incidents, lookback_days=60, recent_days=7)
    print(f"Found {len(res)} anomalies.")
    if res:
        print(f"Top anomaly severity: {res[0].severity}, deviation: {res[0].deviation_pct}%")

if __name__ == "__main__":
    test_hotspots()
    test_forecast()
    test_anomaly()

