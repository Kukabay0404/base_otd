from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, Integer, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"
    __table_args__ = (
        CheckConstraint("rooms > 0", name="ck_rooms_rooms_positive"),
        CheckConstraint("beds > 0", name="ck_rooms_beds_positive"),
        CheckConstraint("price_weekdays >= 0", name="ck_rooms_price_weekdays_nonnegative"),
        CheckConstraint("price_weekend >= 0", name="ck_rooms_price_weekend_nonnegative"),
        CheckConstraint(
            "capacity is null or capacity > 0",
            name="ck_rooms_capacity_positive",
        ),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    rooms: Mapped[int] = mapped_column(Integer, nullable=False)
    area: Mapped[str] = mapped_column(String(50), nullable=False)
    beds: Mapped[int] = mapped_column(Integer, nullable=False)
    tv: Mapped[bool] = mapped_column(Boolean, default=False)
    capacity: Mapped[int | None] = mapped_column(Integer, nullable=True, server_default="1")
    price_weekdays: Mapped[int] = mapped_column(Integer, nullable=False)
    price_weekend: Mapped[int] = mapped_column(Integer, nullable=False)
    images: Mapped[list[str]] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
