from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth.deps import get_current_admin
from app.database import get_db


router = APIRouter(prefix="/room_admin", tags=["Admin"])


def _room_capacity_expr():
    return func.greatest(
        func.coalesce(models.Room.capacity, 0),
        func.coalesce(models.Room.beds, 0),
    )


def _build_room_search_query(payload: schemas.room.SearchRequestRoom):
    total_guests = sum(g.adults + g.children for g in payload.guests)

    overlap_exists = (
        select(models.Booking.id)
        .where(
            and_(
                models.Booking.object_type == "room",
                models.Booking.object_id == models.Room.id,
                models.Booking.status.in_(["pending", "confirmed"]),
                models.Booking.start_date < payload.endDate,
                models.Booking.end_date > payload.startDate,
            )
        )
        .exists()
    )

    return select(models.Room).where(
        _room_capacity_expr() >= total_guests,
        ~overlap_exists,
    )


@router.get("/", response_model=list[schemas.RoomOut])
async def get_rooms(
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    result = await db.execute(select(models.Room))
    return result.scalars().all()


@router.get("/public", response_model=list[schemas.RoomOut])
async def get_rooms_public(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Room))
    return result.scalars().all()


@router.post("/", response_model=schemas.room.RoomOut)
async def create_room(
    room: schemas.room.RoomCreate,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    room_data = room.model_dump(by_alias=False)
    room_data["capacity"] = room_data["beds"]
    db_room = models.Room(**room_data)
    db.add(db_room)
    await db.commit()
    await db.refresh(db_room)
    return db_room


@router.put("/{room_id}", response_model=schemas.room.RoomOut)
async def update_room(
    room_id: int,
    room: schemas.room.RoomUpdate,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    room_data = room.model_dump(by_alias=False)
    room_data["capacity"] = room_data["beds"]
    query = (
        update(models.Room)
        .where(models.Room.id == room_id)
        .values(**room_data)
        .returning(models.Room)
    )
    result = await db.execute(query)
    updated = result.scalar_one_or_none()
    if updated is None:
        raise HTTPException(404, detail="Room not found")

    await db.commit()
    return updated


@router.delete("/{room_id}")
async def delete_room(
    room_id: int,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    query = delete(models.Room).where(models.Room.id == room_id)
    result = await db.execute(query)
    await db.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}


@router.post("/search", response_model=List[schemas.RoomOut])
async def search_rooms(
    payload: schemas.room.SearchRequestRoom,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail="startDate must be before endDate")

    query = _build_room_search_query(payload)

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/public/search", response_model=List[schemas.RoomOut])
async def search_rooms_public(
    payload: schemas.room.SearchRequestRoom,
    db: AsyncSession = Depends(get_db),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail="startDate must be before endDate")

    query = _build_room_search_query(payload)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/c", response_model=List[schemas.RoomOut])
async def quick_search_rooms(
    payload: schemas.room.QuickSearchRequest,
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail="startDate must be before endDate")

    total_guests = payload.adults + payload.children

    overlap_exists = (
        select(models.Booking.id)
        .where(
            and_(
                models.Booking.object_type == "room",
                models.Booking.object_id == models.Room.id,
                models.Booking.status.in_(["pending", "confirmed"]),
                models.Booking.start_date < payload.endDate,
                models.Booking.end_date > payload.startDate,
            )
        )
        .exists()
    )

    query = select(models.Room).where(
        _room_capacity_expr() >= total_guests,
        ~overlap_exists,
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.post("/public/c", response_model=List[schemas.RoomOut])
async def quick_search_rooms_public(
    payload: schemas.room.QuickSearchRequest,
    db: AsyncSession = Depends(get_db),
):
    if payload.startDate >= payload.endDate:
        raise HTTPException(status_code=400, detail="startDate must be before endDate")

    total_guests = payload.adults + payload.children

    overlap_exists = (
        select(models.Booking.id)
        .where(
            and_(
                models.Booking.object_type == "room",
                models.Booking.object_id == models.Room.id,
                models.Booking.status.in_(["pending", "confirmed"]),
                models.Booking.start_date < payload.endDate,
                models.Booking.end_date > payload.startDate,
            )
        )
        .exists()
    )

    query = select(models.Room).where(
        _room_capacity_expr() >= total_guests,
        ~overlap_exists,
    )

    result = await db.execute(query)
    return result.scalars().all()
