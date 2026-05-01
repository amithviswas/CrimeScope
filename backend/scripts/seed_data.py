"""
CrimeScope — Data Seed Script
Fetches 10,000+ real Chicago crime records and seeds the database.

Usage:
    docker compose exec backend python scripts/seed_data.py
    # or locally:
    cd backend && python scripts/seed_data.py
"""
import asyncio
import logging
import os
import sys

# Add backend root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)


async def main():
    from app.core.database import AsyncSessionLocal, engine, Base
    from app.services.data_ingestion import ingest_city, CITY_APIS
    from sqlalchemy import text

    logger.info("=" * 60)
    logger.info("CrimeScope — Database Seed Script")
    logger.info("=" * 60)

    # 1. Verify DB connection
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT version()"))
        pg_version = result.scalar()
        logger.info(f"✓ Connected to PostgreSQL: {pg_version[:50]}")

    # 2. Check table counts before
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT COUNT(*) FROM crime_incidents"))
        before_count = result.scalar()
        logger.info(f"✓ crime_incidents rows before seed: {before_count:,}")

    # 3. Ingest Chicago (primary city — most complete data)
    logger.info("\n── Phase 1: Ingesting Chicago crime data ──")
    async with AsyncSessionLocal() as db:
        log = await ingest_city(
            db,
            city="chicago",
            limit=10_000,
            since_date="2024-01-01",
        )
        logger.info(f"  Status   : {log.status}")
        logger.info(f"  Fetched  : {log.records_fetched:,}")
        logger.info(f"  Inserted : {log.records_inserted:,}")
        logger.info(f"  Skipped  : {log.records_skipped:,}")

    # 4. Optionally seed NYC if token is set
    if os.getenv("NYC_API_TOKEN"):
        logger.info("\n── Phase 2: Ingesting NYC crime data ──")
        async with AsyncSessionLocal() as db:
            log = await ingest_city(db, city="new_york", limit=5_000)
            logger.info(f"  Status   : {log.status}")
            logger.info(f"  Inserted : {log.records_inserted:,}")
    else:
        logger.info("\n⚠  NYC_API_TOKEN not set — skipping NYC data")

    # 5. Optionally seed LA if token is set
    if os.getenv("LA_API_TOKEN"):
        logger.info("\n── Phase 3: Ingesting LA crime data ──")
        async with AsyncSessionLocal() as db:
            log = await ingest_city(db, city="los_angeles", limit=5_000)
            logger.info(f"  Status   : {log.status}")
            logger.info(f"  Inserted : {log.records_inserted:,}")
    else:
        logger.info("\n⚠  LA_API_TOKEN not set — skipping LA data")

    # 6. Final count
    async with AsyncSessionLocal() as db:
        result = await db.execute(text("SELECT COUNT(*) FROM crime_incidents"))
        after_count = result.scalar()

        result2 = await db.execute(text(
            "SELECT city, COUNT(*) as cnt FROM crime_incidents GROUP BY city ORDER BY cnt DESC"
        ))
        by_city = result2.fetchall()

        result3 = await db.execute(text(
            "SELECT category, COUNT(*) as cnt FROM crime_incidents GROUP BY category ORDER BY cnt DESC LIMIT 5"
        ))
        top_cats = result3.fetchall()

    logger.info("\n" + "=" * 60)
    logger.info(f"✅ Seed complete — {after_count:,} total records (+{after_count - before_count:,} new)")
    logger.info("\nBy city:")
    for city, cnt in by_city:
        logger.info(f"  {city:<15} {cnt:>8,}")
    logger.info("\nTop 5 categories:")
    for cat, cnt in top_cats:
        logger.info(f"  {cat:<20} {cnt:>8,}")
    logger.info("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
