#!/usr/bin/env python3
"""
CrimeScope — Seed Crime Data from Chicago Open Data Portal
----------------------------------------------------------
Fetches real crime incidents from Chicago's public Socrata API
(no API key required for small requests) and inserts them into
the CrimeScope database.

Usage:
    python seed_chicago_crimes.py
    python seed_chicago_crimes.py --limit 5000

Run this once after deploying the backend to populate the DB.
"""
import argparse
import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# ── ensure app is importable ──────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise SystemExit("ERROR: Set DATABASE_URL environment variable first.")

from app.models.crime import CrimeIncident  # noqa: E402

# ── Chicago Open Data endpoint ────────────────────────────────────────────────
CHICAGO_URL = (
    "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
    "?$limit={limit}&$offset={offset}"
    "&$where=latitude IS NOT NULL AND longitude IS NOT NULL"
    "&$order=date DESC"
)

CATEGORY_MAP = {
    "THEFT":           "THEFT",
    "BATTERY":         "ASSAULT",
    "ASSAULT":         "ASSAULT",
    "ROBBERY":         "ROBBERY",
    "BURGLARY":        "BURGLARY",
    "MOTOR VEHICLE THEFT": "THEFT",
    "CRIMINAL DAMAGE": "VANDALISM",
    "NARCOTICS":       "NARCOTICS",
    "HOMICIDE":        "HOMICIDE",
    "CRIMINAL SEXUAL ASSAULT": "ASSAULT",
    "WEAPONS VIOLATION": "WEAPONS",
    "FRAUD":           "FRAUD",
    "ARSON":           "ARSON",
}


async def fetch_page(client: httpx.AsyncClient, limit: int, offset: int) -> list[dict]:
    url = CHICAGO_URL.format(limit=limit, offset=offset)
    resp = await client.get(url, timeout=30.0)
    resp.raise_for_status()
    return resp.json()


def map_row(row: dict) -> dict | None:
    try:
        lat  = float(row.get("latitude")  or 0)
        lon  = float(row.get("longitude") or 0)
        if not lat or not lon:
            return None

        primary_type = (row.get("primary_type") or "").upper()
        category = CATEGORY_MAP.get(primary_type, "OTHER")

        occurred_at_raw = row.get("date") or ""
        try:
            occurred_at = datetime.fromisoformat(occurred_at_raw.replace("Z", "+00:00"))
        except Exception:
            occurred_at = datetime.now(timezone.utc)

        return dict(
            id=uuid.uuid4(),
            city="chicago",
            category=category,
            subcategory=row.get("description") or primary_type,
            latitude=lat,
            longitude=lon,
            district=row.get("district") or None,
            neighborhood=row.get("community_area_name") or row.get("beat") or None,
            occurred_at=occurred_at,
            resolved=row.get("arrest") == "true",
            source_api="chicago_open_data",
        )
    except Exception as e:
        print(f"  [SKIP] Skipped row: {e}")
        return None


async def seed(total_limit: int) -> None:
    # asyncpg doesn't accept sslmode as a URL query param — strip it and
    # pass ssl=True via connect_args instead.
    db_url = DATABASE_URL
    connect_args: dict = {}
    if "sslmode=require" in db_url:
        db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
        connect_args["ssl"] = True

    engine = create_async_engine(db_url, echo=False, connect_args=connect_args)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    PAGE = 500
    inserted = 0
    offset   = 0

    print(f"[INFO] Fetching up to {total_limit:,} Chicago crime incidents...")

    async with httpx.AsyncClient() as client:
        while inserted < total_limit:
            page_limit = min(PAGE, total_limit - inserted)
            print(f"  Fetching {page_limit} rows at offset {offset}...", end=" ", flush=True)
            rows = await fetch_page(client, page_limit, offset)
            if not rows:
                print("done (no more data).")
                break

            records = [r for row in rows if (r := map_row(row))]
            print(f"-> {len(records)} valid records", end=" ", flush=True)

            if records:
                async with Session() as db:
                    for rec in records:
                        db.add(CrimeIncident(**rec))
                    await db.commit()
                print("committed OK.")

            else:
                print()

            inserted += len(records)
            offset   += page_limit

    print(f"\n[DONE] Seeded {inserted:,} incidents from Chicago Open Data.")
    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed CrimeScope DB with Chicago crime data")
    parser.add_argument("--limit", type=int, default=2000, help="Total incidents to fetch (default: 2000)")
    args = parser.parse_args()
    asyncio.run(seed(args.limit))
