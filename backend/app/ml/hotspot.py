"""
CrimeScope — Hotspot Detection (DBSCAN)
Clusters crime incidents by lat/lng to find high-density areas.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any

import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Hotspot:
    cluster_id: int
    center_lat: float
    center_lng: float
    radius_m: float
    incident_count: int
    risk_score: float
    categories: dict[str, int]


def compute_hotspots(
    incidents: list[dict[str, Any]],
    eps_km: float = 0.3,
    min_samples: int = 10,
) -> list[Hotspot]:
    """
    Run DBSCAN on incident coordinates and return hotspot summaries.

    Args:
        incidents: List of dicts with keys: latitude, longitude, category
        eps_km:    DBSCAN epsilon in km (cluster radius)
        min_samples: Minimum incidents to form a cluster

    Returns:
        List of Hotspot objects sorted by risk_score descending
    """
    if not incidents:
        return []

    try:
        from sklearn.cluster import DBSCAN
    except ImportError:
        logger.error("scikit-learn not installed — cannot run DBSCAN")
        return []

    coords = np.array([[inc["latitude"], inc["longitude"]] for inc in incidents])

    # DBSCAN with haversine metric (inputs in radians)
    coords_rad = np.radians(coords)
    eps_rad = eps_km / 6371.0  # Earth radius in km

    db = DBSCAN(eps=eps_rad, min_samples=min_samples, metric="haversine", algorithm="ball_tree")
    labels = db.fit_predict(coords_rad)

    unique_labels = set(labels)
    unique_labels.discard(-1)  # noise points

    hotspots: list[Hotspot] = []

    for cluster_id in unique_labels:
        mask = labels == cluster_id
        cluster_incs = [inc for inc, m in zip(incidents, mask) if m]
        cluster_coords = coords[mask]

        center_lat = float(cluster_coords[:, 0].mean())
        center_lng = float(cluster_coords[:, 1].mean())

        # Radius = max distance from center to any point (in meters)
        from sklearn.metrics.pairwise import haversine_distances
        center_rad = np.radians([[center_lat, center_lng]])
        pts_rad = np.radians(cluster_coords)
        dists = haversine_distances(center_rad, pts_rad)[0] * 6371000  # → meters
        radius_m = float(dists.max())

        # Category breakdown
        cat_counts: dict[str, int] = {}
        for inc in cluster_incs:
            cat = inc.get("category", "UNKNOWN")
            cat_counts[cat] = cat_counts.get(cat, 0) + 1

        count = len(cluster_incs)

        # Risk score (0–10): density-weighted, capped at 10
        # Higher density per km² = higher score
        area_km2 = max(0.01, np.pi * (radius_m / 1000) ** 2)
        density = count / area_km2
        risk_score = min(10.0, round(density * 0.1, 2))

        hotspots.append(Hotspot(
            cluster_id=int(cluster_id),
            center_lat=center_lat,
            center_lng=center_lng,
            radius_m=round(radius_m, 1),
            incident_count=count,
            risk_score=risk_score,
            categories=cat_counts,
        ))

    # Sort by risk score descending
    hotspots.sort(key=lambda h: h.risk_score, reverse=True)
    logger.info(f"DBSCAN found {len(hotspots)} hotspot clusters from {len(incidents)} incidents")
    return hotspots
