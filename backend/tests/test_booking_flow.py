from datetime import datetime, timedelta, timezone

import pytest


def _iso(days_from_now: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(days=days_from_now)).isoformat()


async def _create_user(session_factory, models, hash_password, *, email: str, role: str):
    async with session_factory() as session:
        user = models.User(
            email=email,
            hashed_password=hash_password("secret123"),
            first_name="Test",
            last_name="User",
            role=role,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user


async def _create_room(session_factory, models, *, title: str, capacity: int):
    async with session_factory() as session:
        room = models.Room(
            title=title,
            category="standard",
            rooms=1,
            area="20m2",
            beds=capacity,
            capacity=capacity,
            tv=True,
            price_weekdays=10000,
            price_weekend=12000,
            images=[],
        )
        session.add(room)
        await session.commit()
        await session.refresh(room)
        return room


async def _login(client, email: str, password: str = "secret123") -> str:
    response = await client.post(
        "/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200, response.text
    return response.json()["access_token"]


@pytest.mark.asyncio
async def test_login_returns_token_and_current_user(
    client,
    session_factory,
    models,
    hash_password,
):
    await _create_user(
        session_factory,
        models,
        hash_password,
        email="client@example.com",
        role=models.UserRole.client,
    )

    login_response = await client.post(
        "/auth/login",
        json={"email": "client@example.com", "password": "secret123"},
    )

    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    me_response = await client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["email"] == "client@example.com"
    assert me_response.json()["role"] == "client"


@pytest.mark.asyncio
async def test_public_room_search_returns_only_available_rooms(
    client,
    session_factory,
    models,
    hash_password,
):
    available_room = await _create_room(
        session_factory,
        models,
        title="Available Room",
        capacity=3,
    )
    occupied_room = await _create_room(
        session_factory,
        models,
        title="Occupied Room",
        capacity=3,
    )
    user = await _create_user(
        session_factory,
        models,
        hash_password,
        email="searcher@example.com",
        role=models.UserRole.client,
    )

    async with session_factory() as session:
        booking = models.Booking(
            user_id=user.id,
            room_id=occupied_room.id,
            cabin_id=None,
            object_type="room",
            object_id=occupied_room.id,
            last_name="User",
            first_name="Booked",
            middle_name=None,
            phone="+77000000000",
            email=user.email,
            citizenship="KZ",
            comments=None,
            payment="card",
            status="confirmed",
            start_date=datetime.fromisoformat(_iso(10)),
            end_date=datetime.fromisoformat(_iso(12)),
        )
        session.add(booking)
        await session.commit()

    response = await client.post(
        "/room_admin/public/search",
        json={
            "startDate": _iso(10),
            "endDate": _iso(12),
            "guests": [{"adults": 2, "children": 0}],
        },
    )

    assert response.status_code == 200
    room_ids = {room["id"] for room in response.json()}
    assert available_room.id in room_ids
    assert occupied_room.id not in room_ids


@pytest.mark.asyncio
async def test_create_booking_sets_pending_status_and_links_user(
    client,
    session_factory,
    models,
    hash_password,
):
    room = await _create_room(session_factory, models, title="Booking Room", capacity=2)
    await _create_user(
        session_factory,
        models,
        hash_password,
        email="booker@example.com",
        role=models.UserRole.client,
    )
    token = await _login(client, "booker@example.com")

    response = await client.post(
        "/checkout/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "object_type": "room",
            "object_id": room.id,
            "last_name": "Booker",
            "first_name": "Test",
            "middle_name": None,
            "phone": "+77000000001",
            "email": "ignored@example.com",
            "citizenship": "KZ",
            "comments": "Late arrival",
            "payment": "card",
            "start_date": _iso(15),
            "end_date": _iso(17),
        },
    )

    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["status"] == "pending"
    assert payload["room_id"] == room.id
    assert payload["cabin_id"] is None
    assert payload["email"] == "booker@example.com"
    assert payload["user_id"] is not None


@pytest.mark.asyncio
async def test_overlapping_booking_is_rejected(
    client,
    session_factory,
    models,
    hash_password,
):
    room = await _create_room(session_factory, models, title="Overlap Room", capacity=2)
    await _create_user(
        session_factory,
        models,
        hash_password,
        email="overlap@example.com",
        role=models.UserRole.client,
    )
    token = await _login(client, "overlap@example.com")

    payload = {
        "object_type": "room",
        "object_id": room.id,
        "last_name": "Overlap",
        "first_name": "Tester",
        "middle_name": None,
        "phone": "+77000000002",
        "email": "overlap@example.com",
        "citizenship": "KZ",
        "comments": None,
        "payment": "card",
        "start_date": _iso(20),
        "end_date": _iso(22),
    }

    first_response = await client.post(
        "/checkout/",
        headers={"Authorization": f"Bearer {token}"},
        json=payload,
    )
    assert first_response.status_code == 200, first_response.text

    overlapping_response = await client.post(
        "/checkout/",
        headers={"Authorization": f"Bearer {token}"},
        json={**payload, "start_date": _iso(21), "end_date": _iso(23)},
    )

    assert overlapping_response.status_code == 409
    assert overlapping_response.json()["detail"] == "Selected dates are not available"


@pytest.mark.asyncio
async def test_admin_can_update_booking_status(
    client,
    session_factory,
    models,
    hash_password,
):
    room = await _create_room(session_factory, models, title="Admin Room", capacity=2)
    admin = await _create_user(
        session_factory,
        models,
        hash_password,
        email="admin@example.com",
        role=models.UserRole.admin,
    )
    user = await _create_user(
        session_factory,
        models,
        hash_password,
        email="guest@example.com",
        role=models.UserRole.client,
    )

    async with session_factory() as session:
        booking = models.Booking(
            user_id=user.id,
            room_id=room.id,
            cabin_id=None,
            object_type="room",
            object_id=room.id,
            last_name="Guest",
            first_name="User",
            middle_name=None,
            phone="+77000000003",
            email=user.email,
            citizenship="KZ",
            comments=None,
            payment="card",
            status="pending",
            start_date=datetime.fromisoformat(_iso(25)),
            end_date=datetime.fromisoformat(_iso(27)),
        )
        session.add(booking)
        await session.commit()
        await session.refresh(booking)
        booking_id = booking.id

    admin_token = await _login(client, admin.email)

    response = await client.patch(
        f"/checkout/admin/{booking_id}/status",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={"status": "confirmed"},
    )

    assert response.status_code == 200, response.text
    assert response.json()["status"] == "confirmed"
