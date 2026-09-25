from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.listing import ListingSummaryResponse, UserSummarySchema

class BookingCreateRequest(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(1, ge=1)

class BookingResponse(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nightly_price: float
    nights: int
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime
    listing: Optional[ListingSummaryResponse] = None
    guest: Optional[UserSummarySchema] = None

    class Config:
        from_attributes = True
