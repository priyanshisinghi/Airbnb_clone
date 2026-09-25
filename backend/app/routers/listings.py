from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.listing import (
    PaginatedListingResponse,
    ListingDetailResponse,
    UnavailableDateRange,
    QuoteResponse
)
from app.services import listing_service, pricing_service

router = APIRouter(prefix="/listings", tags=["listings"])

@router.get("", response_model=PaginatedListingResponse)
def get_listings(
    location: Optional[str] = Query(None, description="City, country or property title"),
    check_in: Optional[date] = Query(None, description="Check-in date (YYYY-MM-DD)"),
    check_out: Optional[date] = Query(None, description="Check-out date (YYYY-MM-DD)"),
    guests: Optional[int] = Query(None, ge=1, description="Minimum guest capacity"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price per night"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price per night"),
    property_type: Optional[str] = Query(None, description="Filter by property type (e.g., Villa, Apartment)"),
    category: Optional[str] = Query(None, description="Filter by category (e.g., Beachfront, Pools)"),
    amenities: Optional[List[str]] = Query(None, description="Filter by amenities (multi-valued)"),
    bedrooms: Optional[int] = Query(None, ge=1, description="Minimum bedrooms"),
    beds: Optional[int] = Query(None, ge=1, description="Minimum beds"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(12, ge=1, le=100, description="Page size"),
    db: Session = Depends(get_db)
):
    return listing_service.get_listings_paginated(
        db=db,
        location=location,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        category=category,
        amenities=amenities,
        bedrooms=bedrooms,
        beds=beds,
        page=page,
        page_size=page_size
    )

@router.get("/{listing_id}", response_model=ListingDetailResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    return listing_service.get_listing_by_id(db=db, listing_id=listing_id)

@router.get("/{listing_id}/unavailable-dates", response_model=List[UnavailableDateRange])
def get_unavailable_dates(listing_id: int, db: Session = Depends(get_db)):
    return listing_service.get_unavailable_dates(db=db, listing_id=listing_id)

@router.get("/{listing_id}/quote", response_model=QuoteResponse)
def get_price_quote(
    listing_id: int,
    check_in: date = Query(..., description="Check-in date (YYYY-MM-DD)"),
    check_out: date = Query(..., description="Check-out date (YYYY-MM-DD)"),
    guests: int = Query(1, ge=1, description="Guest count"),
    db: Session = Depends(get_db)
):
    return pricing_service.calculate_quote(
        db=db,
        listing_id=listing_id,
        check_in=check_in,
        check_out=check_out,
        guests=guests
    )
