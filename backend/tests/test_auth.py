import pytest


@pytest.mark.asyncio
async def test_login_success(client, session_factory, models, hash_password):
    async with session_factory() as session:
        user = models.User(
            email="test@example.com",
            hashed_password=hash_password("password123"),
            first_name="Test",
            last_name="User",
        )
        session.add(user)
        await session.commit()

    response = await client.post(
        "/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123",
        },
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_login_invalid(client):
    response = await client.post(
        "/auth/login",
        json={
            "email": "invalid@example.com",
            "password": "wrong",
        },
    )
    assert response.status_code == 401
