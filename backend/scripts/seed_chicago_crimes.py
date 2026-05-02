#!/usr/bin/env python3
"""
CrimeScope - Seed Crime Data from Open Data APIs
-------------------------------------------------
Supports:
  chicago     -- Chicago Data Portal (Socrata)
  new_york    -- NYC Open Data (Socrata)
  los_angeles -- LA Open Data (Socrata)

Usage:
  python seed_chicago_crimes.py
  python seed_chicago_crimes.py --city chicago --limit 5000
  python seed_chicago_crimes.py --city new_york --limit 3000
  python seed_chicago_crimes.py --city all --limit 3000
"""
import argparse
import asyncio
import os
import sys
import uuid
from datetime import datetime, timezone

import httpx
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# ensure app is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATABASE_URL = os.environ.get("DATABASE_URL", "")
if not DATABASE_URL:
    raise SystemExit("ERROR: Set DATABASE_URL environment variable first.")

from app.models.crime import CrimeIncident  # noqa: E402

# ── City configurations ───────────────────────────────────────────────────────

CITIES: dict[str, dict] = {
    "chicago": {
        "url": (
            "https://data.cityofchicago.org/resource/ijzp-q8t2.json"
            "?$limit={limit}&$offset={offset}"
            "&$where=latitude IS NOT NULL AND longitude IS NOT NULL"
            "&$order=date DESC"
        ),
        "label": "Chicago",
        "field_map": {
            "latitude":  "latitude",
            "longitude": "longitude",
            "type":      "primary_type",
            "desc":      "description",
            "date":      "date",
            "district":  "district",
            "area":      "community_area_name",
            "beat":      "beat",
            "arrest":    "arrest",
        },
    },
    "new_york": {
        "url": (
            "https://data.cityofnewyork.us/resource/qgea-i56i.json"
            "?$limit={limit}&$offset={offset}"
            "&$where=latitude IS NOT NULL AND longitude IS NOT NULL"
            "&$order=cmplnt_fr_dt DESC"
        ),
        "label": "New York",
        "field_map": {
            "latitude":  "latitude",
            "longitude": "longitude",
            "type":      "ofns_desc",
            "desc":      "pd_desc",
            "date":      "cmplnt_fr_dt",
            "district":  "boro_nm",
            "area":      "patrol_boro",
            "beat":      "addr_pct_cd",
            "arrest":    None,
        },
    },
    "los_angeles": {
        "url": (
            "https://data.lacity.org/resource/2nrs-mtv8.json"
            "?$limit={limit}&$offset={offset}"
            "&$where=lat IS NOT NULL AND lon IS NOT NULL"
            "&$order=date_occ DESC"
        ),
        "label": "Los Angeles",
        "field_map": {
            "latitude":  "lat",
            "longitude": "lon",
            "type":      "crm_cd_desc",
            "desc":      "mocodes",
            "date":      "date_occ",
            "district":  "area_name",
            "area":      "rpt_dist_no",
            "beat":      "premis_cd",
            "arrest":    None,
        },
    },
}

CATEGORY_MAP = {
    # Generic
    "THEFT":            "THEFT",
    "LARCENY":          "THEFT",
    "BURGLARY":         "BURGLARY",
    "ROBBERY":          "ROBBERY",
    "ASSAULT":          "ASSAULT",
    "BATTERY":          "ASSAULT",
    "HOMICIDE":         "HOMICIDE",
    "MURDER":           "HOMICIDE",
    "RAPE":             "ASSAULT",
    "SEX OFFENSES":     "ASSAULT",
    "NARCOTICS":        "NARCOTICS",
    "DRUGS":            "NARCOTICS",
    "VANDALISM":        "VANDALISM",
    "CRIMINAL DAMAGE":  "VANDALISM",
    "WEAPONS":          "WEAPONS",
    "ARSON":            "ARSON",
    "FRAUD":            "FRAUD",
    "MOTOR VEHICLE THEFT": "THEFT",
    "AUTO":             "THEFT",
    # NYC-specific
    "GRAND LARCENY":    "THEFT",
    "PETIT LARCENY":    "THEFT",
    "FELONY ASSAULT":   "ASSAULT",
    "MISDEMEANOR ASSAULT": "ASSAULT",
    "RAPE":             "ASSAULT",
    "DANGEROUS DRUGS":  "NARCOTICS",
    "DANGEROUS WEAPONS": "WEAPONS",
    "CRIMINAL MISCHIEF": "VANDALISM",
    # LA-specific
    "VEHICLE - STOLEN": "THEFT",
    "THEFT PLAIN - PETTY ($950 & UNDER)": "THEFT",
    "BURGLARY FROM VEHICLE": "BURGLARY",
    "ASSAULT WITH DEADLY WEAPON": "ASSAULT",
}


def classify(raw_type: str) -> str:
    upper = raw_type.upper()
    for key, cat in CATEGORY_MAP.items():
        if key in upper:
            return cat
    return "OTHER"


def map_row(row: dict, city_key: str) -> dict | None:
    try:
        fm = CITIES[city_key]["field_map"]
        lat = float(row.get(fm["latitude"]) or 0)
        lon = float(row.get(fm["longitude"]) or 0)
        if not lat or not lon:
            return None

        raw_type = str(row.get(fm["type"]) or "")
        category = classify(raw_type)

        date_raw = row.get(fm["date"]) or ""
        try:
            occurred_at = datetime.fromisoformat(date_raw.replace("Z", "+00:00"))
        except Exception:
            occurred_at = datetime.now(timezone.utc)

        district    = row.get(fm["district"]) or None
        neighborhood = row.get(fm["area"]) or row.get(fm["beat"]) or None
        arr_val     = fm["arrest"]
        resolved    = (str(row.get(arr_val, "")).lower() == "true") if arr_val else False

        return dict(
            id=uuid.uuid4(),
            city=city_key,
            category=category,
            subcategory=row.get(fm["desc"]) or raw_type,
            latitude=lat,
            longitude=lon,
            district=str(district) if district else None,
            neighborhood=str(neighborhood) if neighborhood else None,
            occurred_at=occurred_at,
            resolved=resolved,
            source_api=f"{city_key}_open_data",
        )
    except Exception as e:
        print(f"  [SKIP] {e}")
        return None


async def fetch_page(client: httpx.AsyncClient, url_tmpl: str, limit: int, offset: int) -> list[dict]:
    url  = url_tmpl.format(limit=limit, offset=offset)
    resp = await client.get(url, timeout=30.0)
    resp.raise_for_status()
    return resp.json()


async def seed_city(city_key: str, total_limit: int, engine, Session) -> int:
    cfg    = CITIES[city_key]
    PAGE   = 500
    offset = inserted = 0
    print(f"\n[{cfg['label']}] Fetching up to {total_limit:,} incidents...")

    async with httpx.AsyncClient() as client:
        while inserted < total_limit:
            page_lim = min(PAGE, total_limit - inserted)
            print(f"  offset {offset:,} ...", end=" ", flush=True)
            rows = await fetch_page(client, cfg["url"], page_lim, offset)
            if not rows:
                print("done (no more data).")
                break

            records = [r for row in rows if (r := map_row(row, city_key))]
            print(f"{len(records)} valid", end=" ", flush=True)

            if records:
                async with Session() as db:
                    for rec in records:
                        db.add(CrimeIncident(**rec))
                    await db.commit()
                print("committed OK.")
            else:
                print()

            inserted += len(records)
            offset   += page_lim

    print(f"[{cfg['label']}] Done. Seeded {inserted:,} incidents.")
    return inserted


async def main(city_arg: str, limit: int) -> None:
    db_url = DATABASE_URL
    connect_args: dict = {}
    if "sslmode=require" in db_url:
        db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
        connect_args["ssl"] = True

    engine  = create_async_engine(db_url, echo=False, connect_args=connect_args)
    Session = async_sessionmaker(engine, expire_on_commit=False)

    if city_arg == "all":
        targets = list(CITIES.keys())
    elif city_arg in CITIES:
        targets = [city_arg]
    else:
        raise SystemExit(f"Unknown city: {city_arg}. Choose from: {', '.join(CITIES)} or 'all'")

    total = 0
    for c in targets:
        total += await seed_city(c, limit, engine, Session)

    print(f"\n[DONE] Total seeded across {len(targets)} city/cities: {total:,} incidents.")
    await engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed CrimeScope DB with real crime data")
    parser.add_argument("--city",  default="chicago", help="chicago | new_york | los_angeles | all")
    parser.add_argument("--limit", type=int, default=2000, help="Incidents per city (default: 2000)")
    args = parser.parse_args()
    asyncio.run(main(args.city, args.limit))
