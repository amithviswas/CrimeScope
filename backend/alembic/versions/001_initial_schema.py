"""
CrimeScope — Initial Database Schema Migration
Creates all 8 tables as defined in backend-spec.md.
Uses VARCHAR for plan/status columns to avoid SQLAlchemy Enum type-creation conflicts.

Revision: 001_initial_schema
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── Create ENUM types via raw SQL (idempotent) ────────────────────────
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE userplan AS ENUM ('free', 'pro', 'enterprise', 'admin');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE plantier AS ENUM ('free', 'pro', 'enterprise');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE subscriptionstatus AS ENUM ('active', 'canceled', 'past_due', 'trialing', 'incomplete');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    """)

    # ── users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255)),
        sa.Column("hashed_password", sa.String(255)),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("is_verified", sa.Boolean(), server_default="false"),
        sa.Column("is_superuser", sa.Boolean(), server_default="false"),
        sa.Column("oauth_provider", sa.String(50)),
        sa.Column("oauth_id", sa.String(255)),
        sa.Column("plan", sa.String(20), server_default="free"),
        sa.Column("verification_token", sa.String(255)),
        sa.Column("reset_token", sa.String(255)),
        sa.Column("reset_token_expires", sa.DateTime(timezone=True)),
        sa.Column("last_login", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_unique_constraint("uq_users_email", "users", ["email"])
    op.create_index("ix_users_email", "users", ["email"])

    # ── subscriptions ──────────────────────────────────────────────────────
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("plan", sa.String(20), server_default="free"),
        sa.Column("status", sa.String(30), server_default="active"),
        sa.Column("stripe_customer_id", sa.String(255)),
        sa.Column("stripe_subscription_id", sa.String(255)),
        sa.Column("stripe_price_id", sa.String(255)),
        sa.Column("current_period_start", sa.DateTime(timezone=True)),
        sa.Column("current_period_end", sa.DateTime(timezone=True)),
        sa.Column("cancel_at_period_end", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_unique_constraint("uq_subscriptions_user_id", "subscriptions", ["user_id"])
    op.create_unique_constraint("uq_subscriptions_stripe_customer", "subscriptions", ["stripe_customer_id"])
    op.create_unique_constraint("uq_subscriptions_stripe_sub", "subscriptions", ["stripe_subscription_id"])
    op.create_index("ix_subscriptions_user_id", "subscriptions", ["user_id"])

    # ── crime_incidents ────────────────────────────────────────────────────
    op.create_table(
        "crime_incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("external_id", sa.String(255)),
        sa.Column("city", sa.String(100), nullable=False),
        sa.Column("source_api", sa.String(100)),
        sa.Column("category", sa.String(100), nullable=False),
        sa.Column("subcategory", sa.String(100)),
        sa.Column("description", sa.Text()),
        sa.Column("latitude", sa.Numeric(9, 6), nullable=False),
        sa.Column("longitude", sa.Numeric(9, 6), nullable=False),
        sa.Column("location_name", sa.String(255)),
        sa.Column("district", sa.String(100)),
        sa.Column("neighborhood", sa.String(100)),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("reported_at", sa.DateTime(timezone=True)),
        sa.Column("resolved", sa.Boolean(), server_default="false"),
        sa.Column("raw_data", postgresql.JSONB()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_unique_constraint("uq_crime_external_id", "crime_incidents", ["external_id"])
    op.create_index("ix_crime_incidents_external_id", "crime_incidents", ["external_id"])
    op.create_index("ix_crime_incidents_city", "crime_incidents", ["city"])
    op.create_index("ix_crime_incidents_category", "crime_incidents", ["category"])
    op.create_index("ix_crime_incidents_occurred_at", "crime_incidents", ["occurred_at"])
    op.create_index("ix_crime_incidents_district", "crime_incidents", ["district"])
    op.create_index("ix_crime_incidents_city_occurred", "crime_incidents", ["city", "occurred_at"])
    op.create_index("ix_crime_incidents_city_district", "crime_incidents", ["city", "district"])
    op.create_index("ix_crime_incidents_lat_lng", "crime_incidents", ["latitude", "longitude"])

    # ── hotspots ───────────────────────────────────────────────────────────
    op.create_table(
        "hotspots",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("city", sa.String(100)),
        sa.Column("cluster_id", sa.Integer()),
        sa.Column("center_lat", sa.Numeric(9, 6)),
        sa.Column("center_lng", sa.Numeric(9, 6)),
        sa.Column("radius_m", sa.Numeric(8, 2)),
        sa.Column("incident_count", sa.Integer()),
        sa.Column("risk_score", sa.Numeric(5, 2)),
        sa.Column("categories", postgresql.JSONB()),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_hotspots_city", "hotspots", ["city"])

    # ── forecasts ──────────────────────────────────────────────────────────
    op.create_table(
        "forecasts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("city", sa.String(100)),
        sa.Column("category", sa.String(100)),
        sa.Column("district", sa.String(100)),
        sa.Column("forecast_date", sa.Date(), nullable=False),
        sa.Column("predicted_count", sa.Integer()),
        sa.Column("lower_bound", sa.Integer()),
        sa.Column("upper_bound", sa.Integer()),
        sa.Column("confidence", sa.Numeric(5, 4)),
        sa.Column("model_version", sa.String(50)),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_forecasts_city", "forecasts", ["city"])
    op.create_index("ix_forecasts_forecast_date", "forecasts", ["forecast_date"])
    op.create_index("ix_forecasts_category", "forecasts", ["category"])

    # ── anomalies ──────────────────────────────────────────────────────────
    op.create_table(
        "anomalies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("city", sa.String(100)),
        sa.Column("district", sa.String(100)),
        sa.Column("category", sa.String(100)),
        sa.Column("detected_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("severity", sa.String(20)),
        sa.Column("actual_count", sa.Integer()),
        sa.Column("expected_count", sa.Integer()),
        sa.Column("deviation_pct", sa.Numeric(8, 2)),
        sa.Column("description", sa.Text()),
        sa.Column("is_resolved", sa.Boolean(), server_default="false"),
        sa.Column("resolved_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_anomalies_city", "anomalies", ["city"])
    op.create_index("ix_anomalies_detected_at", "anomalies", ["detected_at"])

    # ── alerts ─────────────────────────────────────────────────────────────
    op.create_table(
        "alerts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("city", sa.String(100)),
        sa.Column("district", sa.String(100)),
        sa.Column("categories", postgresql.ARRAY(sa.String())),
        sa.Column("threshold", sa.Integer()),
        sa.Column("window_days", sa.Integer(), server_default="7"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("notify_email", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_alerts_user_id", "alerts", ["user_id"])

    # ── data_ingestion_logs ────────────────────────────────────────────────
    op.create_table(
        "data_ingestion_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("source", sa.String(100)),
        sa.Column("city", sa.String(100)),
        sa.Column("records_fetched", sa.Integer()),
        sa.Column("records_inserted", sa.Integer()),
        sa.Column("records_skipped", sa.Integer()),
        sa.Column("status", sa.String(50)),
        sa.Column("error_msg", sa.Text()),
        sa.Column("started_at", sa.DateTime(timezone=True)),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_ingestion_logs_city", "data_ingestion_logs", ["city"])


def downgrade() -> None:
    op.drop_table("data_ingestion_logs")
    op.drop_table("alerts")
    op.drop_table("anomalies")
    op.drop_table("forecasts")
    op.drop_table("hotspots")
    op.drop_table("crime_incidents")
    op.drop_table("subscriptions")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS plantier")
    op.execute("DROP TYPE IF EXISTS userplan")
