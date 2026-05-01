"""
CrimeScope — Celery ETL Tasks
Scheduled data ingestion and ML pipeline retraining.
"""
import asyncio
import logging

from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Celery App ────────────────────────────────────────────────────────────

celery_app = Celery(
    "crimescope",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["app.tasks.etl_tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# ── Beat Schedule ─────────────────────────────────────────────────────────

celery_app.conf.beat_schedule = {
    # Ingest Chicago data daily at 2am UTC
    "ingest-chicago-daily": {
        "task": "app.tasks.etl_tasks.ingest_city_task",
        "schedule": crontab(hour=2, minute=0),
        "args": ["chicago"],
        "options": {"queue": "etl"},
    },
    # Ingest NYC data daily at 2:15am
    "ingest-nyc-daily": {
        "task": "app.tasks.etl_tasks.ingest_city_task",
        "schedule": crontab(hour=2, minute=15),
        "args": ["new_york"],
        "options": {"queue": "etl"},
    },
    # Ingest LA data daily at 2:30am
    "ingest-la-daily": {
        "task": "app.tasks.etl_tasks.ingest_city_task",
        "schedule": crontab(hour=2, minute=30),
        "args": ["los_angeles"],
        "options": {"queue": "etl"},
    },
    # Retrain ML models after ingestion at 3am
    "retrain-models-daily": {
        "task": "app.tasks.etl_tasks.retrain_ml_models_task",
        "schedule": crontab(hour=3, minute=0),
        "args": ["chicago"],
        "options": {"queue": "ml"},
    },
}


# ── Task Helpers ──────────────────────────────────────────────────────────

def _run_async(coro):
    """Run an async coroutine from a sync Celery task."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


# ── Tasks ─────────────────────────────────────────────────────────────────

@celery_app.task(
    name="app.tasks.etl_tasks.ingest_city_task",
    bind=True,
    max_retries=3,
    default_retry_delay=300,
    queue="etl",
)
def ingest_city_task(self, city: str, limit: int = 10_000, since_date: str | None = None):
    """
    Fetch and upsert crime data for a single city.
    Retries up to 3 times on failure (5-min delay).
    """
    logger.info(f"[ETL] Starting ingestion for {city}")
    try:
        from app.core.database import AsyncSessionLocal
        from app.services.data_ingestion import ingest_city

        async def _run():
            async with AsyncSessionLocal() as db:
                log = await ingest_city(db, city, limit=limit, since_date=since_date)
                return {
                    "city": city,
                    "status": log.status,
                    "inserted": log.records_inserted,
                    "skipped": log.records_skipped,
                }

        result = _run_async(_run())
        logger.info(f"[ETL] Completed ingestion for {city}: {result}")
        return result

    except Exception as exc:
        logger.exception(f"[ETL] Ingestion failed for {city}: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.etl_tasks.retrain_ml_models_task",
    bind=True,
    max_retries=2,
    queue="ml",
)
def retrain_ml_models_task(self, city: str):
    """
    Retrain hotspot detection, forecasting, and anomaly detection models.
    Runs DBSCAN hotspot clustering, Prophet forecasting, and Isolation Forest anomaly detection.
    Scheduled daily at 3am UTC via Celery beat after data ingestion.
    """
    logger.info(f"[ML] Starting model retrain for {city}")
    try:
        from app.core.database import AsyncSessionLocal
        from app.services.ml_service import retrain_all

        async def _run():
            async with AsyncSessionLocal() as db:
                return await retrain_all(db, cities=[city])

        result = _run_async(_run())
        logger.info(f"[ML] Model retrain completed for {city}: {result}")
        return result

    except Exception as exc:
        logger.exception(f"[ML] Retrain failed for {city}: {exc}")
        raise self.retry(exc=exc)


@celery_app.task(
    name="app.tasks.etl_tasks.ingest_all_cities_task",
    queue="etl",
)
def ingest_all_cities_task(limit_per_city: int = 10_000):
    """Trigger ingestion for all configured cities."""
    cities = ["chicago", "new_york", "los_angeles"]
    for city in cities:
        ingest_city_task.delay(city, limit=limit_per_city)
    return {"queued": cities}
