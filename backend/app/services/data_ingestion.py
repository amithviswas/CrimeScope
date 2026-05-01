"""
CrimeScope — Data Ingestion Service
Fetches, normalizes, and upserts crime data from city open data APIs.
Sources: Chicago Data Portal, NYC Open Data, LA Open Data
"""
from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

import httpx
from sqlalchemy import select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.crime import CrimeIncident
from app.models.ingestion_log import IngestionLog
from app.schemas.crime import CrimeIncidentCreate

logger = logging.getLogger(__name__)


# ── City API Configurations ────────────────────────────────────────────────

CITY_APIS: dict[str, dict] = {
    "chicago": {
        "url": "https://data.cityofchicago.org/resource/ijzp-q8t2.json",
        "token_env": "CHICAGO_API_TOKEN",
        "normalizer": "normalize_chicago",
        "source_api": "chicago_data_portal",
        "default_limit": 10_000,
    },
    "new_york": {
        "url": "https://data.cityofnewyork.us/resource/5uac-w243.json",
        "token_env": "NYC_API_TOKEN",
        "normalizer": "normalize_nyc",
        "source_api": "nyc_open_data",
        "default_limit": 10_000,
    },
    "los_angeles": {
        "url": "https://data.lacity.org/resource/2nrs-mtv8.json",
        "token_env": "LA_API_TOKEN",
        "normalizer": "normalize_la",
        "source_api": "la_open_data",
        "default_limit": 10_000,
    },
}


# ── Normalizers ────────────────────────────────────────────────────────────

def normalize_chicago(record: dict) -> dict | None:
    """Normalize Chicago Data Portal crime record to CrimeScope schema."""
    try:
        lat = float(record.get("latitude") or 0)
        lng = float(record.get("longitude") or 0)
        if lat == 0 or lng == 0:
            return None  # Skip records without coordinates

        return {
            "external_id": f"chicago_{record['id']}",
            "city": "chicago",
            "category": record.get("primary_type", "UNKNOWN").upper(),
            "subcategory": record.get("description"),
            "location_name": record.get("location_description"),
            "latitude": lat,
            "longitude": lng,
            "district": record.get("district"),
            "neighborhood": record.get("community_area"),
            "occurred_at": _parse_dt(record.get("date")),
            "resolved": record.get("arrest", "false").lower() == "true",
            "source_api": "chicago_data_portal",
            "raw_data": record,
        }
    except (KeyError, ValueError, TypeError) as e:
        logger.debug(f"Skipping Chicago record {record.get('id')}: {e}")
        return None


def normalize_nyc(record: dict) -> dict | None:
    """Normalize NYC Open Data complaint record to CrimeScope schema."""
    try:
        lat = float(record.get("latitude") or 0)
        lng = float(record.get("longitude") or 0)
        if lat == 0 or lng == 0:
            return None

        return {
            "external_id": f"nyc_{record.get('cmplnt_num')}",
            "city": "new_york",
            "category": record.get("ofns_desc", "UNKNOWN").upper(),
            "subcategory": record.get("pd_desc"),
            "latitude": lat,
            "longitude": lng,
            "district": record.get("patrol_boro"),
            "neighborhood": record.get("boro_nm"),
            "occurred_at": _parse_dt(record.get("cmplnt_fr_dt")),
            "source_api": "nyc_open_data",
            "raw_data": record,
        }
    except (KeyError, ValueError, TypeError) as e:
        logger.debug(f"Skipping NYC record {record.get('cmplnt_num')}: {e}")
        return None


def normalize_la(record: dict) -> dict | None:
    """Normalize LA Open Data crime record to CrimeScope schema."""
    try:
        lat = float(record.get("lat") or 0)
        lng = float(record.get("lon") or 0)
        if lat == 0 or lng == 0:
            return None

        return {
            "external_id": f"la_{record.get('dr_no')}",
            "city": "los_angeles",
            "category": record.get("crm_cd_desc", "UNKNOWN").upper(),
            "latitude": lat,
            "longitude": lng,
            "district": record.get("area_name"),
            "occurred_at": _parse_dt(record.get("date_occ")),
            "source_api": "la_open_data",
            "raw_data": record,
        }
    except (KeyError, ValueError, TypeError) as e:
        logger.debug(f"Skipping LA record {record.get('dr_no')}: {e}")
        return None


NORMALIZERS = {
    "normalize_chicago": normalize_chicago,
    "normalize_nyc": normalize_nyc,
    "normalize_la": normalize_la,
}


# ── Date parser ────────────────────────────────────────────────────────────

def _parse_dt(value: str | None) -> datetime:
    if not value:
        return datetime.now(UTC)
    for fmt in (
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.000",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M",
        "%Y-%m-%d",
    ):
        try:
            dt = datetime.strptime(value.split("+")[0].strip(), fmt)
            return dt.replace(tzinfo=UTC)
        except ValueError:
            continue
    return datetime.now(UTC)


# ── Fetch from API ────────────────────────────────────────────────────────

async def fetch_city_records(
    city: str,
    limit: int = 10_000,
    offset: int = 0,
    since_date: str | None = None,
) -> list[dict]:
    """
    Fetch raw records from a city open data API.
    Returns list of raw JSON records.
    """
    cfg = CITY_APIS.get(city)
    if not cfg:
        raise ValueError(f"Unknown city: {city}. Supported: {list(CITY_APIS.keys())}")

    token = getattr(settings, cfg["token_env"].lower(), "") or ""

    params: dict[str, Any] = {
        "$limit": limit,
        "$offset": offset,
        "$order": "date DESC" if city == "chicago" else "$order=cmplnt_fr_dt DESC",
    }
    if since_date:
        if city == "chicago":
            params["$where"] = f"date > '{since_date}T00:00:00'"
        elif city == "new_york":
            params["$where"] = f"cmplnt_fr_dt > '{since_date}T00:00:00'"
    if token:
        params["$$app_token"] = token

    logger.info(f"Fetching {limit} records from {city} API (offset={offset})")

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.get(cfg["url"], params=params)
            resp.raise_for_status()
            records = resp.json()
            logger.info(f"Fetched {len(records)} raw records from {city}")
            return records
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching {city} data: {e}")
            raise


# ── Upsert into DB ────────────────────────────────────────────────────────

async def upsert_incidents(
    db: AsyncSession,
    city: str,
    raw_records: list[dict],
) -> tuple[int, int]:
    """
    Normalize and upsert raw records into crime_incidents.
    Returns (inserted, skipped) counts.
    """
    cfg = CITY_APIS[city]
    normalizer = NORMALIZERS[cfg["normalizer"]]

    normalized = []
    skipped = 0
    for raw in raw_records:
        result = normalizer(raw)
        if result and result.get("occurred_at"):
            normalized.append(result)
        else:
            skipped += 1

    if not normalized:
        return 0, skipped

    # Bulk upsert — ON CONFLICT DO NOTHING for external_id
    stmt = pg_insert(CrimeIncident).values(normalized)
    stmt = stmt.on_conflict_do_nothing(index_elements=["external_id"])

    await db.execute(stmt)
    await db.commit()

    inserted = len(normalized)
    logger.info(f"Upserted {inserted} records for {city}, skipped {skipped}")
    return inserted, skipped


# ── Main ingestion orchestrator ───────────────────────────────────────────

async def ingest_city(
    db: AsyncSession,
    city: str,
    limit: int = 10_000,
    since_date: str | None = None,
) -> IngestionLog:
    """
    Full ingestion pipeline for a single city:
    1. Fetch from API
    2. Normalize
    3. Upsert into DB
    4. Log result
    """
    started_at = datetime.now(UTC)
    log = IngestionLog(
        source=CITY_APIS[city]["source_api"],
        city=city,
        started_at=started_at,
        status="running",
    )
    db.add(log)
    await db.flush()

    try:
        raw_records = await fetch_city_records(city, limit=limit, since_date=since_date)
        inserted, skipped = await upsert_incidents(db, city, raw_records)

        log.records_fetched = len(raw_records)
        log.records_inserted = inserted
        log.records_skipped = skipped
        log.status = "success"
        log.completed_at = datetime.now(UTC)

    except Exception as e:
        logger.exception(f"Ingestion failed for {city}: {e}")
        log.status = "failed"
        log.error_msg = str(e)
        log.completed_at = datetime.now(UTC)

    await db.commit()
    await db.refresh(log)
    return log


async def ingest_all_cities(
    db: AsyncSession,
    limit_per_city: int = 10_000,
    since_date: str | None = None,
) -> list[IngestionLog]:
    """Run ingestion for all configured cities."""
    results = []
    for city in CITY_APIS:
        try:
            log = await ingest_city(db, city, limit=limit_per_city, since_date=since_date)
            results.append(log)
        except Exception as e:
            logger.error(f"Failed ingestion for {city}: {e}")
    return results
