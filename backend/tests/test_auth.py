import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.database import get_db
from tests.conftest import session_factory


@pytest.mark.asyncio
async def test_login_success(session_factory):
    async with session_factory() as session:
        # Create test user
        from app.models.user import User
        from app.auth.hash import hash_password
        user = User(
            email="test@example.com",
            hashed_password=hash_password("password123"),
            first_name="Test",
            last_name="User",
        )
        session.add(user)
        await session.commit()

    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        assert response.status_code == 200
        assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_invalid():
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        response = await client.post("/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrong"
        })
        assert response.status_code == 401