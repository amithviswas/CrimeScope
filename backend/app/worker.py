"""
CrimeScope Backend — Celery Worker
Background task processing for ML jobs and ETL.
"""
from celery import Celery

from app.core.config import settings

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
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Make this importable as `app.worker`
worker = celery_app
