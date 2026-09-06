"""
Load InternEra demo schema/data SQL files into the configured database.

Run from backend folder:
  python load_demo_data.py --with-schema
  python load_demo_data.py
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

from sqlalchemy import text


ROOT = Path(__file__).resolve().parent
SQL_DIR = ROOT / "database"
SCHEMA_SQL = SQL_DIR / "internera_schema_FINAL.sql"
TEST_DATA_SQL = SQL_DIR / "internera_test_data_FINAL.sql"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.database import engine  # noqa: E402


def _split_sql_statements(sql_text: str) -> list[str]:
    cleaned_lines = []
    for line in sql_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("--"):
            continue
        cleaned_lines.append(line)
    cleaned = "\n".join(cleaned_lines)
    return [stmt.strip() for stmt in cleaned.split(";") if stmt.strip()]


def _run_sql_file(path: Path) -> int:
    sql_text = path.read_text(encoding="utf-8", errors="ignore")
    statements = _split_sql_statements(sql_text)
    count = 0
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))
            count += 1
    return count


def main() -> None:
    parser = argparse.ArgumentParser(description="Load InternEra demo SQL data.")
    parser.add_argument(
        "--with-schema",
        action="store_true",
        help="Apply schema SQL before loading test data (destructive reset).",
    )
    args = parser.parse_args()

    if args.with_schema:
        if not SCHEMA_SQL.exists():
            raise FileNotFoundError(f"Missing schema file: {SCHEMA_SQL}")
        schema_count = _run_sql_file(SCHEMA_SQL)
        print(f"Applied schema statements: {schema_count}")

    if not TEST_DATA_SQL.exists():
        raise FileNotFoundError(f"Missing test data file: {TEST_DATA_SQL}")

    data_count = _run_sql_file(TEST_DATA_SQL)
    print(f"Applied test data statements: {data_count}")
    print("Demo data load complete.")


if __name__ == "__main__":
    main()

