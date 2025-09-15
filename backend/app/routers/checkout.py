from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/checkout", tags=["Booking"])

@router.post("/", response_model=schemas.checkout.BookingOut)
async def create_booking(
    booking: schemas.checkout.BookingCreate,
    db: AsyncSession = Depends(get_db),
):
    db_booking = models.checkout.Booking(**booking.model_dump())
    db.add(db_booking)
    await db.commit()
    await db.refresh(db_booking)
    return db_booking


@router.get("/", response_model=list[schemas.checkout.BookingOut])
async def get_bookings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.checkout.Booking))
    return result.scalars().all()

@router.delete("/{booking_id}", response_model=dict)
async def delete_booking(booking_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.checkout.Booking).filter_by(id=booking_id)
    )
    booking = result.scalar_one_or_none()

    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")

    await db.delete(booking)
    await db.commit()
    return {"message": f"Booking {booking_id} deleted successfully"}
