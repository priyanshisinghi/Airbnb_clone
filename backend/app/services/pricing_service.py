from datetime import date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.listing import Listing
from app.models.booking import Booking

def calculate_quote(
    db: Session,
    listing_id: int,
    check_in: date,
    check_out: date,
    guests: int
) -> dict:
    today = date.today()

    # 1. Validate listing exists
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {listing_id} not found"
        )

    # 2. Validate check_out > check_in
    if check_out <= check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_out date must be strictly after check_in date"
        )

    # 3. Validate dates not in the past
    if check_in < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_in date cannot be in the past"
        )

    # 4. Validate guest count
    if guests < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guest count must be at least 1"
        )

    if guests > listing.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Guest count exceeds maximum capacity of {listing.max_guests} guests for this property"
        )

    # 5. Validate date availability against confirmed bookings
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.listing_id == listing_id,
            Booking.status == "confirmed",
            Booking.check_in < check_out,
            Booking.check_out > check_in
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected dates are not available for this listing"
        )

    # Single source of truth pricing calculation
    nights = (check_out - check_in).days
    nightly_price = float(listing.price_per_night)
    subtotal = float(round(nightly_price * nights, 2))
    cleaning_fee = float(listing.cleaning_fee)
    service_fee = float(round(subtotal * 0.12, 2))
    total = float(round(subtotal + cleaning_fee + service_fee, 2))

    return {
        "listing_id": listing.id,
        "check_in": check_in,
        "check_out": check_out,
        "guests": guests,
        "nights": nights,
        "nightly_price": nightly_price,
        "subtotal": subtotal,
        "cleaning_fee": cleaning_fee,
        "service_fee": service_fee,
        "total": total,
        "is_available": True
    }
