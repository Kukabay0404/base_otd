from sqlalchemy import String, Integer, Enum, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from sqlalchemy.sql import func
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    admin = 'admin'
    client = 'client'


class User(Base):
    __tablename__ = 'users'

    id : Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email : Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    hashed_password : Mapped[str] = mapped_column(String(255), nullable=False)

    first_name : Mapped[str] = mapped_column(String(100), nullable=False)
    last_name : Mapped[str] = mapped_column(String(100), nullable=False)

    role : Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.client)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),  # <-- БД сама проставит значение
        nullable=False,
    )

# {
#   "email": "kuanysh@example.com",
#   "first_name": "Kuanysh",
#   "last_name": "Perdebekov",
#   "role": "client",
#   "password": "133112"
# }