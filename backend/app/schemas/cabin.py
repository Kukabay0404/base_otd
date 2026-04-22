from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


class CabinBase(BaseModel):
    title: str
    description: Optional[str] = None
    rooms: int
    floors: int
    beds: int
    category: str
    price_weekdays: int = Field(..., alias="priceWeekdays")
    price_weekend: int = Field(..., alias="priceWeekend")
    pool: bool
    images: Optional[List[str]] = None

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )


class CabinCreate(CabinBase):
    pass


class CabinUpdate(CabinBase):
    pass


class GuestInfo(BaseModel):
    adults: int
    children: int


class SearchRequest(BaseModel):
    startDate: datetime
    endDate: datetime
    guests: List[GuestInfo]


class CabinOut(CabinBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        populate_by_name=True,
    )
