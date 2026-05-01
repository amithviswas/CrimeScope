"""CrimeScope services package."""
from app.services.data_ingestion import ingest_all_cities, ingest_city

__all__ = ["ingest_city", "ingest_all_cities"]
