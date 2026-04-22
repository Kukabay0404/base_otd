from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class RoomBase(BaseModel):
    title: str
    category: str
    rooms: int
    area: str
    beds: int
    tv: bool
    price_weekdays: int = Field(..., alias="priceWeekdays")
    price_weekend: int = Field(..., alias="priceWeekend")
    images: List[str]

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class RoomCreate(RoomBase):
    pass


class RoomUpdate(RoomBase):
    pass


class GuestInfoRoom(BaseModel):
    adults: int
    children: int = 0


class SearchRequestRoom(BaseModel):
    startDate: datetime
    endDate: datetime
    guests: List[GuestInfoRoom]

    model_config = ConfigDict(from_attributes=True)


class QuickSearchRequest(BaseModel):
    startDate: datetime
    endDate: datetime
    adults: int
    children: int = 0


class RoomOut(RoomBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
