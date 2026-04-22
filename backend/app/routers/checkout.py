from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth.deps import get_current_admin, get_current_user
from app.database import get_db
from app.cache.redis_client import get_redis_client


router = APIRouter(prefix="/checkout", tags=["Booking"])


@router.post("/", response_model=schemas.checkout.BookingOut)
async def create_booking(
    booking: schemas.checkout.BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if booking.start_date >= booking.end_date:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")

    room_id: int | None = None
    cabin_id: int | None = None

    if booking.object_type == "room":
        room_id = booking.object_id
        obj_exists = await db.execute(select(models.Room.id).where(models.Room.id == room_id))
    else:
        cabin_id = booking.object_id
        obj_exists = await db.execute(select(models.Cabin.id).where(models.Cabin.id == cabin_id))

    if obj_exists.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail="Object not found")

    # Распределённый лок
    redis = await get_redis_client()
    if redis is None:
        # Если Redis отключён, пропускаем лок (для development)
        pass
    else:
        lock_key = f"booking_lock:{booking.object_type}:{booking.object_id}:{booking.start_date.isoformat()}:{booking.end_date.isoformat()}"
        
        # Попытка установить лок на 30 секунд
        lock_acquired = await redis.setnx(lock_key, str(current_user.id))
        if not lock_acquired:
            raise HTTPException(
                status_code=409, 
                detail="This spot is currently being reserved by another user. Please try again."
            )
        
        # Установить TTL на лок
        await redis.expire(lock_key, 30)

    try:
        # Проверка доступности
        overlap_filter = [
            models.checkout.Booking.status.in_(["pending", "confirmed"]),
            models.checkout.Booking.start_date < booking.end_date,
            models.checkout.Booking.end_date > booking.start_date,
        ]
        if room_id is not None:
            overlap_filter.append(models.checkout.Booking.room_id == room_id)
        else:
            overlap_filter.append(models.checkout.Booking.cabin_id == cabin_id)

        overlap = await db.execute(
            select(models.checkout.Booking.id).where(and_(*overlap_filter))
        )
        if overlap.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Selected dates are not available")

        # Создание бронирования
        payload = booking.model_dump()
        payload["status"] = "pending"
        payload["user_id"] = current_user.id
        payload["email"] = current_user.email
        payload["room_id"] = room_id
        payload["cabin_id"] = cabin_id

        db_booking = models.checkout.Booking(**payload)
        db.add(db_booking)
        await db.commit()
        await db.refresh(db_booking)
        
        if redis is not None:
            return db_booking
    
    finally:
        # Освободить лок
        if redis is not None:
            await redis.delete(lock_key)


@router.get("/", response_model=list[schemas.checkout.BookingOut])
async def get_bookings(
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    result = await db.execute(select(models.checkout.Booking))
    return result.scalars().all()


@router.get("/my", response_model=list[schemas.checkout.MyBookingOut])
async def get_my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(
        select(models.checkout.Booking)
        .where(
            or_(
                models.checkout.Booking.user_id == current_user.id,
                and_(
                    models.checkout.Booking.user_id.is_(None),
                    models.checkout.Booking.email == current_user.email,
                ),
            )
        )
        .order_by(models.checkout.Booking.created_at.desc())
    )
    bookings = result.scalars().all()

    room_ids = [b.room_id for b in bookings if b.room_id is not None]
    cabin_ids = [b.cabin_id for b in bookings if b.cabin_id is not None]

    room_titles: dict[int, str] = {}
    cabin_titles: dict[int, str] = {}

    if room_ids:
        rooms = await db.execute(
            select(models.Room.id, models.Room.title).where(models.Room.id.in_(room_ids))
        )
        room_titles = {row.id: row.title for row in rooms.all()}

    if cabin_ids:
        cabins = await db.execute(
            select(models.Cabin.id, models.Cabin.title).where(models.Cabin.id.in_(cabin_ids))
        )
        cabin_titles = {row.id: row.title for row in cabins.all()}

    response: list[schemas.checkout.MyBookingOut] = []
    for booking in bookings:
        object_title = (
            room_titles.get(booking.room_id)
            if booking.object_type == "room"
            else cabin_titles.get(booking.cabin_id)
        )
        item = schemas.checkout.MyBookingOut.model_validate(booking)
        response.append(item.model_copy(update={"object_title": object_title}))

    return response


@router.patch("/admin/{booking_id}/status", response_model=schemas.checkout.BookingOut)
async def admin_update_booking_status(
    booking_id: int,
    payload: schemas.checkout.BookingStatusUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    result = await db.execute(
        update(models.checkout.Booking)
        .where(models.checkout.Booking.id == booking_id)
        .values(status=payload.status)
        .returning(models.checkout.Booking)
    )
    booking = result.scalar_one_or_none()
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    await db.commit()
    return booking


@router.delete("/{booking_id}", response_model=dict)
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    result = await db.execute(select(models.checkout.Booking).filter_by(id=booking_id))
    booking = result.scalar_one_or_none()

    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    is_owner = booking.user_id == current_user.id
    if not (current_user.is_admin or is_owner):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    await db.delete(booking)
    await db.commit()
    return {"message": f"Booking {booking_id} deleted successfully"}
