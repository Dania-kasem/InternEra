from pathlib import Path

from sqlalchemy import text

from app.core.config import settings
from app.database import Base, engine


def ensure_runtime_schema():
    if settings.DATABASE_URL.startswith("sqlite"):
        _ensure_sqlite_demo_db()
        return

    statements = [
        "ALTER TABLE internship DROP CONSTRAINT IF EXISTS internship_status_check",
        "ALTER TABLE internship ADD CONSTRAINT internship_status_check CHECK (status IN ('open', 'closed', 'draft', 'pending', 'rejected'))",
        "ALTER TABLE internship ALTER COLUMN status SET DEFAULT 'pending'",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS ai_risk_score INTEGER",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS ai_risk_status VARCHAR(50)",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS ai_risk_warning BOOLEAN NOT NULL DEFAULT FALSE",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS ai_risk_notes TEXT",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS admin_decision VARCHAR(50)",
        "ALTER TABLE internship ADD COLUMN IF NOT EXISTS admin_rejection_reason TEXT",
    ]
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))


def _ensure_sqlite_demo_db():
    from app.models import (  # noqa: F401
        application,
        company,
        cv_analysis,
        internship,
        message,
        review,
        saved_internship,
        student,
        user,
    )

    Base.metadata.create_all(bind=engine)

    with engine.begin() as conn:
        user_count = conn.execute(text("SELECT COUNT(*) FROM users")).scalar()
        if user_count:
            return

        conn.execute(
            text(
                """
                INSERT INTO users (email, password_hash, role, is_active, is_approved)
                VALUES (
                    'admin@internera.com',
                    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRShaNLAHnUYh9wQNqKS',
                    'admin',
                    TRUE,
                    TRUE
                )
                """
            )
        )

        sql_path = Path(__file__).resolve().parents[1] / "database" / "internera_test_data_FINAL.sql"
        sql_text = sql_path.read_text(encoding="utf-8", errors="ignore")
        sql_text = sql_text.replace("NOW()", "CURRENT_TIMESTAMP")

        for statement in _split_sql_statements(sql_text):
            if statement.upper().startswith("SELECT "):
                continue
            conn.execute(text(statement))


def _split_sql_statements(sql_text):
    cleaned_lines = []
    for line in sql_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        cleaned_lines.append(line)
    cleaned = "\n".join(cleaned_lines)
    return [stmt.strip() for stmt in cleaned.split(";") if stmt.strip()]
