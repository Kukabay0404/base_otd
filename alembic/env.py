import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context

from backend.app.database import Base  # твой Base
from backend.app.models import checkout  # импортируй модели, чтобы Alembic их видел

# Alembic Config
config = context.config

# Логирование
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Метаданные (Alembic нужен metadata для autogenerate)
target_metadata = Base.metadata


def run_migrations_offline():
    """Запуск в offline-режиме (без подключения к БД)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    """Запуск миграций в sync-режиме, используется внутри async."""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Запуск в online-режиме (через asyncpg)."""
    url = config.get_main_option("sqlalchemy.url")
    connectable = create_async_engine(url, poolclass=pool.NullPool)

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)  # ⬅️ sync wrapper

    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
