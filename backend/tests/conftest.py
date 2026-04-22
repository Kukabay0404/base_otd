import importlib
import os
import subprocess
import time
import uuid
from collections.abc import AsyncIterator

import pytest
import psycopg2
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool


if os.name == "nt":
    import asyncio

    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


def _docker(*args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["docker", *args],
        check=True,
        capture_output=True,
        text=True,
    )


def _wait_for_postgres(database_url: str, timeout_seconds: int = 45) -> None:
    deadline = time.time() + timeout_seconds
    while time.time() < deadline:
        try:
            conn = psycopg2.connect(database_url)
        except Exception:
            time.sleep(1)
            continue
        conn.close()
        return
    raise RuntimeError("Timed out waiting for PostgreSQL test container")


@pytest.fixture(scope="session")
def postgres_container() -> dict[str, str]:
    container_name = f"foreststay-test-db-{uuid.uuid4().hex[:8]}"
    try:
        _docker(
            "run",
            "--name",
            container_name,
            "-e",
            "POSTGRES_PASSWORD=postgres",
            "-e",
            "POSTGRES_USER=postgres",
            "-e",
            "POSTGRES_DB=foreststay_test",
            "-P",
            "-d",
            "postgres:16-alpine",
        )
        port_output = _docker("port", container_name, "5432/tcp").stdout.strip()
        host_port = port_output.rsplit(":", 1)[-1]
        database_url = (
            f"postgresql+asyncpg://postgres:postgres@127.0.0.1:{host_port}/foreststay_test"
        )
        _wait_for_postgres(
            f"postgresql://postgres:postgres@127.0.0.1:{host_port}/foreststay_test"
        )
        return {"database_url": database_url, "container_name": container_name}
    except Exception:
        subprocess.run(["docker", "rm", "-f", container_name], check=False)
        raise


@pytest.fixture(scope="session")
def app_modules(postgres_container: dict[str, str]):
    os.environ["APP_ENV"] = "test"
    os.environ["DATABASE_URL"] = postgres_container["database_url"]
    os.environ["AUTO_CREATE_TABLES"] = "0"
    os.environ["JWT_SECRET_KEY"] = "test-jwt-secret"
    os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"] = "60"

    config_module = importlib.import_module("app.core.config")
    config_module = importlib.reload(config_module)
    database_module = importlib.import_module("app.database")
    database_module = importlib.reload(database_module)
    database_module.engine = create_async_engine(
        postgres_container["database_url"],
        echo=False,
        future=True,
        poolclass=NullPool,
    )
    database_module.AsyncSessionLocal = async_sessionmaker(
        database_module.engine,
        expire_on_commit=False,
        class_=AsyncSession,
    )
    models_module = importlib.import_module("app.models")
    models_module = importlib.reload(models_module)
    hash_module = importlib.import_module("app.auth.hash")
    hash_module = importlib.reload(hash_module)
    main_module = importlib.import_module("app.main")
    main_module = importlib.reload(main_module)

    return {
        "config": config_module,
        "database": database_module,
        "models": models_module,
        "hash": hash_module,
        "main": main_module,
    }


@pytest.fixture(scope="session", autouse=True)
def cleanup_postgres_container(postgres_container: dict[str, str]):
    yield
    subprocess.run(
        ["docker", "rm", "-f", postgres_container["container_name"]],
        check=False,
    )


@pytest.fixture(autouse=True)
async def reset_database(app_modules) -> AsyncIterator[None]:
    database_module = app_modules["database"]
    async with database_module.engine.begin() as conn:
        await conn.run_sync(database_module.Base.metadata.drop_all)
        await conn.run_sync(database_module.Base.metadata.create_all)
    yield
    async with database_module.engine.begin() as conn:
        await conn.run_sync(database_module.Base.metadata.drop_all)


@pytest.fixture
async def client(app_modules) -> AsyncIterator[AsyncClient]:
    app = app_modules["main"].app
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as test_client:
        yield test_client


@pytest.fixture
def session_factory(app_modules):
    return app_modules["database"].AsyncSessionLocal


@pytest.fixture
def models(app_modules):
    return app_modules["models"]


@pytest.fixture
def hash_password(app_modules):
    return app_modules["hash"].hash_password
