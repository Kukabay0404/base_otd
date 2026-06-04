import asyncio
import os
import subprocess
import sys

import uvicorn
from sqlalchemy import inspect, text

from app.core.config import settings
from app.database import Base, engine


CORE_TABLES = {"users", "rooms", "cabins", "bookings"}


def _run_alembic(*args: str) -> None:
    subprocess.run([sys.executable, "-m", "alembic", *args], check=True)


async def _get_public_tables() -> set[str]:
    async with engine.connect() as conn:
        return set(await conn.run_sync(lambda sync_conn: inspect(sync_conn).get_table_names()))


async def _has_alembic_version() -> bool:
    async with engine.connect() as conn:
        result = await conn.execute(
            text(
                """
                select exists (
                    select 1
                    from information_schema.tables
                    where table_schema = 'public'
                    and table_name = 'alembic_version'
                )
                """
            )
        )
        return bool(result.scalar_one())


async def _ensure_schema_state() -> None:
    tables = await _get_public_tables()
    has_version_table = await _has_alembic_version()

    if not has_version_table:
        if CORE_TABLES.issubset(tables):
            _run_alembic("stamp", "head")
        else:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            _run_alembic("stamp", "head")

    _run_alembic("upgrade", "head")


def main() -> None:
    asyncio.run(_ensure_schema_state())
    uvicorn.run("app.main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")))


if __name__ == "__main__":
    main()
