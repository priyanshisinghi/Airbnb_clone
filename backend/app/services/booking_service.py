from datetime import date
from typing import List
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.listing import Listing
from app.models.booking import Booking
from app.models.user import User
from app.schemas.booking import BookingCreateRequest
from app.services import pricing_service

def create_booking(db: Session, current_user: User, payload: BookingCreateRequest) -> Booking:
    today = date.today()

    # 1. Validate listing exists
    listing = db.query(Listing).filter(Listing.id == payload.listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Listing with id {payload.listing_id} not found"
        )

    # 2. Validate dates
    if payload.check_out <= payload.check_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_out date must be strictly after check_in date"
        )

    if payload.check_in < today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="check_in date cannot be in the past"
        )

    # 3. Validate guest count
    if payload.guests < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guest count must be at least 1"
        )

    if payload.guests > listing.max_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Guest count exceeds maximum capacity of {listing.max_guests} guests"
        )

    # 4. Final Pre-Insert Overlap Check (Returns HTTP 409 Conflict if unavailable)
    overlapping = (
        db.query(Booking)
        .filter(
            Booking.listing_id == payload.listing_id,
            Booking.status == "confirmed",
            Booking.check_in < payload.check_out,
            Booking.check_out > payload.check_in
        )
        .first()
    )

    if overlapping:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Selected dates are no longer available for booking"
        )

    # 5. Authoritative price calculation from database listing price
    quote = pricing_service.calculate_quote(
        db=db,
        listing_id=payload.listing_id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests
    )

    # 6. Save booking entity
    booking = Booking(
        listing_id=payload.listing_id,
        guest_id=current_user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nightly_price=quote["nightly_price"],
        nights=quote["nights"],
        cleaning_fee=quote["cleaning_fee"],
        service_fee=quote["service_fee"],
        total_price=quote["total"],
        status="confirmed"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

def get_user_bookings(db: Session, current_user: User) -> List[Booking]:
    return (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.guest)
        )
        .filter(Booking.guest_id == current_user.id)
        .order_by(Booking.check_in.desc())
        .all()
    )

def get_host_bookings(db: Session, current_user: User) -> List[Booking]:
    if not current_user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only demo host users can view host reservations",
        )

    return (
        db.query(Booking)
        .join(Booking.listing)
        .options(
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.guest),
        )
        .filter(Listing.host_id == current_user.id)
        .order_by(Booking.check_in.asc(), Booking.id.asc())
        .all()
    )

def cancel_booking(db: Session, current_user: User, booking_id: int) -> Booking:
    booking = (
        db.query(Booking)
        .options(
            joinedload(Booking.listing).joinedload(Listing.host),
            joinedload(Booking.listing).joinedload(Listing.images),
            joinedload(Booking.guest)
        )
        .filter(Booking.id == booking_id)
        .first()
    )

    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with id {booking_id} not found"
        )

    # Authorization Check
    if booking.guest_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this booking"
        )

    if booking.status != "cancelled":
        booking.status = "cancelled"
        db.commit()
        db.refresh(booking)

    return booking
