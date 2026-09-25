from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


class HostListingPayload(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    description: str = Field(min_length=10, max_length=5000)
    property_type: str = Field(min_length=2, max_length=80)
    category: str = Field(min_length=2, max_length=80)
    city: str = Field(min_length=2, max_length=120)
    country: str = Field(min_length=2, max_length=120)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    price_per_night: float = Field(gt=0, le=1_000_000)
    cleaning_fee: float = Field(default=0, ge=0, le=1_000_000)
    max_guests: int = Field(ge=1, le=100)
    bedrooms: int = Field(ge=1, le=100)
    beds: int = Field(ge=1, le=100)
    bathrooms: float = Field(gt=0, le=100)
    image_urls: List[str] = Field(default_factory=list, max_length=20)
    amenities: List[str] = Field(default_factory=list, max_length=30)

    @field_validator("title", "description", "property_type", "category", "city", "country")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value

    @field_validator("image_urls", "amenities")
    @classmethod
    def clean_list(cls, values: List[str]) -> List[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        return list(dict.fromkeys(cleaned))
