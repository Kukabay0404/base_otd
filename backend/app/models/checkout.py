from sqlalchemy import String, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),  # <-- БД сама проставит значение
        nullable=False,
    )

    # обязательные поля
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False)
    email: Mapped[str] = mapped_column(String(120), nullable=False)
    citizenship: Mapped[str] = mapped_column(String(50), nullable=False)

    # необязательные
    middle_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)

    payment: Mapped[str] = mapped_column(String(50), default="card")

    # даты бронирования
    start_date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True))
    end_date: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True))


# {
#   "last_name": "Perdebekov",
#   "first_name": "Kuanysh",
#   "phone": "87057390587",
#   "email": "kuanysh@example.com",
#   "citizenship": "Uzbekistan",
#   "middle_name": "Ganibekovich",
#   "comments": "Пусть будет готово к утру",
#   "start_date": "2025-09-14T16:33:40.217Z",
#   "end_date": "2025-09-25T16:33:40.217Z"
# }
