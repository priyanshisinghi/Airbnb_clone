from typing import Any, Dict, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.amenity import Amenity
from app.models.booking import Booking
from app.models.listing import Listing, ListingImage
from app.models.user import User
from app.schemas.host_listing import HostListingPayload
from app.services.listing_service import build_listing_summary, fetch_rating_stats


def _require_host(user: User) -> None:
    if not user.is_host:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only demo host users can manage listings",
        )


def _get_owned_listing(db: Session, user: User, listing_id: int) -> Listing:
    listing = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.id == listing_id)
        .first()
    )
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )
    if listing.host_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only manage your own listings",
        )
    return listing


def _resolve_amenities(db: Session, names: List[str]) -> List[Amenity]:
    if not names:
        return []

    amenities = db.query(Amenity).filter(Amenity.name.in_(names)).all()
    found = {amenity.name for amenity in amenities}
    missing = [name for name in names if name not in found]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown amenities: {', '.join(missing)}",
        )
    return amenities


def _apply_payload(db: Session, listing: Listing, payload: HostListingPayload) -> None:
    values = payload.model_dump(exclude={"image_urls", "amenities"})
    for field, value in values.items():
        setattr(listing, field, value)

    listing.images.clear()
    for position, url in enumerate(payload.image_urls):
        listing.images.append(ListingImage(url=url, position=position))

    listing.amenities = _resolve_amenities(db, payload.amenities)


def _summary(db: Session, listing: Listing) -> Dict[str, Any]:
    ratings = fetch_rating_stats(db, [listing.id])
    return build_listing_summary(listing, ratings)


def get_host_listings(db: Session, user: User) -> List[Dict[str, Any]]:
    _require_host(user)
    listings = (
        db.query(Listing)
        .options(
            joinedload(Listing.images),
            joinedload(Listing.amenities),
            joinedload(Listing.host),
        )
        .filter(Listing.host_id == user.id)
        .order_by(Listing.updated_at.desc(), Listing.id.desc())
        .all()
    )
    ratings = fetch_rating_stats(db, [listing.id for listing in listings])
    return [build_listing_summary(listing, ratings) for listing in listings]


def create_host_listing(
    db: Session,
    user: User,
    payload: HostListingPayload,
) -> Dict[str, Any]:
    _require_host(user)
    listing = Listing(host_id=user.id)
    db.add(listing)
    _apply_payload(db, listing, payload)
    db.commit()
    db.refresh(listing)
    return _summary(db, listing)


def update_host_listing(
    db: Session,
    user: User,
    listing_id: int,
    payload: HostListingPayload,
) -> Dict[str, Any]:
    _require_host(user)
    listing = _get_owned_listing(db, user, listing_id)
    _apply_payload(db, listing, payload)
    db.commit()
    db.refresh(listing)
    return _summary(db, listing)


def delete_host_listing(db: Session, user: User, listing_id: int) -> None:
    _require_host(user)
    listing = _get_owned_listing(db, user, listing_id)

    if db.query(Booking).filter(Booking.listing_id == listing.id).count() > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This listing has booking history and cannot be deleted",
        )

    db.delete(listing)
    db.commit()
