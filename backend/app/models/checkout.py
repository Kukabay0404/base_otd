from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (
        Index(
            "ix_bookings_object_dates",
            "object_type",
            "object_id",
            "start_date",
            "end_date",
        ),
        Index("ix_bookings_user_created", "user_id", "created_at"),
        Index("ix_bookings_room_dates", "room_id", "start_date", "end_date"),
        Index("ix_bookings_cabin_dates", "cabin_id", "start_date", "end_date"),
        CheckConstraint(
            "object_type in ('room', 'cabin')",
            name="ck_bookings_object_type_values",
        ),
        CheckConstraint(
            "((room_id is not null)::int + (cabin_id is not null)::int) = 1",
            name="ck_bookings_one_target",
        ),
        CheckConstraint(
            """
            (
                object_type = 'room'
                and room_id is not null
                and cabin_id is null
                and object_id = room_id
            )
            or
            (
                object_type = 'cabin'
                and cabin_id is not null
                and room_id is null
                and object_id = cabin_id
            )
            """,
            name="ck_bookings_target_consistency",
        ),
        CheckConstraint(
            "start_date < end_date",
            name="ck_bookings_date_range",
        ),
        CheckConstraint(
            "status in ('pending', 'confirmed', 'cancelled')",
            name="ck_bookings_status_values",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    room_id: Mapped[int | None] = mapped_column(
        ForeignKey("rooms.id", ondelete="CASCADE"),
        nullable=True,
    )
    cabin_id: Mapped[int | None] = mapped_column(
        ForeignKey("cabins.id", ondelete="CASCADE"),
        nullable=True,
    )

    object_type: Mapped[str] = mapped_column(String(20), nullable=False)
    object_id: Mapped[int] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    citizenship: Mapped[str] = mapped_column(String(50), nullable=False)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    payment: Mapped[str] = mapped_column(String(50), default="card")
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        server_default="pending",
        nullable=False,
    )
    start_date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), nullable=False)
