from datetime import date
from math import ceil
from typing import List, Optional, Dict, Any
from sqlalchemy import func, or_, and_
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.listing import Listing, ListingImage
from app.models.amenity import Amenity, ListingAmenity
from app.models.booking import Booking
from app.models.review import Review
from app.models.user import User


def build_listing_summary(listing: Listing, rating_stats: Dict[int, Dict]) -> Dict[str, Any]:
    """Build a ListingSummaryResponse-compatible dict for a single Listing ORM object."""
    st = rating_stats.get(listing.id, {"avg_rating": None, "reviews_count": 0})
    return {
        "id": listing.id,
        "title": listing.title,
        "property_type": listing.property_type,
        "category": listing.category,
        "city": listing.city,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "cleaning_fee": listing.cleaning_fee,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "images": sorted(listing.images, key=lambda img: img.position),
        "amenities": listing.amenities,
        "host": listing.host,
        "rating": st["avg_rating"],
        "reviews_count": st["reviews_count"],
    }


def fetch_rating_stats(db: Session, listing_ids: List[int]) -> Dict[int, Dict]:
    """Bulk-fetch avg rating + review count for a list of listing IDs."""
    rating_stats: Dict[int, Dict] = {}
    if not listing_ids:
        return rating_stats
    stats = (
        db.query(
            Review.listing_id,
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("reviews_count"),
        )
        .filter(Review.listing_id.in_(listing_ids))
        .group_by(Review.listing_id)
        .all()
    )
    for stat in stats:
        rating_stats[stat.listing_id] = {
            "avg_rating": round(float(stat.avg_rating), 2) if stat.avg_rating else None,
            "reviews_count": stat.reviews_count,
        }
    return rating_stats

def get_listings_paginated(
    db: Session,
    location: Optional[str] = None,
    check_in: Optional[date] = None,
    check_out: Optional[date] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    category: Optional[str] = None,
    amenities: Optional[List[str]] = None,
    bedrooms: Optional[int] = None,
    beds: Optional[int] = None,
    page: int = 1,
    page_size: int = 12,
) -> Dict[str, Any]:
    # Validate date range
    if check_in and check_out:
        if check_in >= check_out:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="check_in date must be strictly before check_out date"
            )

    query = db.query(Listing).options(
        joinedload(Listing.host),
        joinedload(Listing.images),
        joinedload(Listing.amenities)
    )

    # Location filter (city, country, or title)
    if location and location.strip():
        loc_term = f"%{location.strip()}%"
        query = query.filter(
            or_(
                Listing.city.ilike(loc_term),
                Listing.country.ilike(loc_term),
                Listing.title.ilike(loc_term)
            )
        )

    # Capacity & Room filters
    if guests and guests > 0:
        query = query.filter(Listing.max_guests >= guests)
    if bedrooms and bedrooms > 0:
        query = query.filter(Listing.bedrooms >= bedrooms)
    if beds and beds > 0:
        query = query.filter(Listing.beds >= beds)

    # Price range filters
    if min_price is not None and min_price >= 0:
        query = query.filter(Listing.price_per_night >= min_price)
    if max_price is not None and max_price >= 0:
        query = query.filter(Listing.price_per_night <= max_price)

    # Property type filter
    if property_type and property_type.strip():
        query = query.filter(Listing.property_type.ilike(property_type.strip()))

    # Category filter
    if category and category.strip():
        query = query.filter(Listing.category.ilike(category.strip()))

    # Amenities filter (Must satisfy ALL selected amenities)
    if amenities:
        for amen in amenities:
            if amen.strip():
                query = query.filter(Listing.amenities.any(Amenity.name.ilike(amen.strip())))

    # Date Availability filter
    if check_in and check_out:
        unavailable_subquery = (
            db.query(Booking.listing_id)
            .filter(
                Booking.status == "confirmed",
                Booking.check_in < check_out,
                Booking.check_out > check_in
            )
            .subquery()
        )
        query = query.filter(Listing.id.not_in(unavailable_subquery))

    total = query.distinct(Listing.id).count()
    total_pages = ceil(total / page_size) if total > 0 else 1

    # Paginate results
    offset = (page - 1) * page_size
    listings = query.distinct(Listing.id).order_by(Listing.id.asc()).offset(offset).limit(page_size).all()

    # Pre-calculate ratings and review counts in bulk for fetched listings
    listing_ids = [l.id for l in listings]
    rating_stats = {}
    if listing_ids:
        stats = (
            db.query(
                Review.listing_id,
                func.avg(Review.rating).label("avg_rating"),
                func.count(Review.id).label("reviews_count")
            )
            .filter(Review.listing_id.in_(listing_ids))
            .group_by(Review.listing_id)
            .all()
        )
        for stat in stats:
            rating_stats[stat.listing_id] = {
                "avg_rating": round(float(stat.avg_rating), 2) if stat.avg_rating else None,
                "reviews_count": stat.reviews_count
            }

    items = []
    for l in listings:
        st = rating_stats.get(l.id, {"avg_rating": None, "reviews_count": 0})
        items.append({
            "id": l.id,
            "title": l.title,
            "property_type": l.property_type,
            "category": l.category,
            "city": l.city,
            "country": l.country,
            "price_per_night": l.price_per_night,
            "cleaning_fee": l.cleaning_fee,
            "max_guests": l.max_guests,
            "bedrooms": l.bedrooms,
            "beds": l.beds,
            "bathrooms": l.bathrooms,
            "images": sorted(l.images, key=lambda img: img.position),
            "amenities": l.amenities,
            "host": l.host,
            "rating": st["avg_rating"],
            "reviews_count": st["reviews_count"]
        })

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages
    }

def get_listing_by_id(db: Session, listing_id: int) -> Dict[str, Any]:
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.host),
            joinedload(Listing.images),
            joinedload(Listing.amenities)
        )
        .filter(Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    # Calculate average rating and total reviews count
    stat = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("reviews_count")
        )
        .filter(Review.listing_id == listing_id)
        .first()
    )

    avg_rating = round(float(stat.avg_rating), 2) if stat and stat.avg_rating else None
    reviews_count = stat.reviews_count if stat else 0

    reviews = (
        db.query(Review)
        .options(joinedload(Review.author))
        .filter(Review.listing_id == listing_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    return {
        "id": listing.id,
        "title": listing.title,
        "description": listing.description,
        "property_type": listing.property_type,
        "category": listing.category,
        "city": listing.city,
        "country": listing.country,
        "latitude": listing.latitude,
        "longitude": listing.longitude,
        "price_per_night": listing.price_per_night,
        "cleaning_fee": listing.cleaning_fee,
        "max_guests": listing.max_guests,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "created_at": listing.created_at,
        "updated_at": listing.updated_at,
        "images": sorted(listing.images, key=lambda img: img.position),
        "amenities": listing.amenities,
        "host": listing.host,
        "rating": avg_rating,
        "reviews_count": reviews_count,
        "reviews": reviews
    }

def get_unavailable_dates(db: Session, listing_id: int) -> List[Dict[str, date]]:
    # Verify listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    bookings = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed"
        )
        .order_by(Booking.check_in.asc())
        .all()
    )

    return [{"check_in": b.check_in, "check_out": b.check_out} for b in bookings]

def get_meta_categories(db: Session) -> List[Dict[str, Any]]:
    stats = (
        db.query(Listing.category, func.count(Listing.id).label("count"))
        .group_by(Listing.category)
        .order_by(Listing.category.asc())
        .all()
    )
    return [{"name": s.category, "count": s.count} for s in stats]

def get_meta_amenities(db: Session) -> List[Amenity]:
    return db.query(Amenity).order_by(Amenity.name.asc()).all()
