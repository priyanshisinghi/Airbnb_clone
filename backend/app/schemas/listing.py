from datetime import date, datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.meta import AmenitySchema

class UserSummarySchema(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    is_superhost: bool

    class Config:
        from_attributes = True

class ListingImageSchema(BaseModel):
    id: int
    url: str
    position: int

    class Config:
        from_attributes = True

class ListingSummaryResponse(BaseModel):
    id: int
    title: str
    property_type: str
    category: str
    city: str
    country: str
    price_per_night: float
    cleaning_fee: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    images: List[ListingImageSchema] = []
    amenities: List[AmenitySchema] = []
    host: UserSummarySchema
    rating: Optional[float] = None
    reviews_count: int = 0

    class Config:
        from_attributes = True

class ReviewSchema(BaseModel):
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: UserSummarySchema

    class Config:
        from_attributes = True

class ListingDetailResponse(ListingSummaryResponse):
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    reviews: List[ReviewSchema] = []

    class Config:
        from_attributes = True

class PaginatedListingResponse(BaseModel):
    items: List[ListingSummaryResponse]
    page: int
    page_size: int
    total: int
    total_pages: int

class UnavailableDateRange(BaseModel):
    check_in: date
    check_out: date

    class Config:
        from_attributes = True

class QuoteResponse(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    nightly_price: float
    subtotal: float
    cleaning_fee: float
    service_fee: float
    total: float
    is_available: bool = True
