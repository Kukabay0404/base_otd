from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime


class BookingBase(BaseModel):
    last_name: str
    first_name: str
    phone: str
    email: EmailStr
    citizenship: str

    middle_name: str | None = None
    comments: str | None = None

    payment: str = "card"

    start_date: datetime | None = None
    end_date: datetime | None = None


class BookingCreate(BookingBase):
    pass


class BookingOut(BookingBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
