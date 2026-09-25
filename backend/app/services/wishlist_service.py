"""
Wishlist service — all DB logic lives here, router stays thin.
"""
from typing import List, Dict, Any
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models.wishlist import Wishlist
from app.models.listing import Listing
from app.models.user import User
from app.services.listing_service import build_listing_summary, fetch_rating_stats


def get_wishlist_listing_ids(db: Session, user: User) -> List[int]:
    """Return a flat list of listing IDs the user has saved."""
    rows = db.query(Wishlist.listing_id).filter(Wishlist.user_id == user.id).all()
    return [r.listing_id for r in rows]


def get_wishlist_listings(db: Session, user: User) -> List[Dict[str, Any]]:
    """Return full listing summary dicts the user has saved, newest-first."""
    rows = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id)
        .order_by(Wishlist.created_at.desc())
        .options(
            joinedload(Wishlist.listing).joinedload(Listing.images),
            joinedload(Wishlist.listing).joinedload(Listing.host),
            joinedload(Wishlist.listing).joinedload(Listing.amenities),
        )
        .all()
    )

    listings = [r.listing for r in rows]
    listing_ids = [l.id for l in listings]
    rating_stats = fetch_rating_stats(db, listing_ids)

    return [build_listing_summary(l, rating_stats) for l in listings]


def add_to_wishlist(db: Session, user: User, listing_id: int) -> dict:
    """Save a listing. Idempotent — no error if already saved."""
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found",
        )

    existing = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if not existing:
        entry = Wishlist(user_id=user.id, listing_id=listing_id)
        db.add(entry)
        db.commit()

    return {"saved": True, "listing_id": listing_id}


def remove_from_wishlist(db: Session, user: User, listing_id: int) -> dict:
    """Un-save a listing. Idempotent — no error if not saved."""
    entry = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
        .first()
    )
    if entry:
        db.delete(entry)
        db.commit()

    return {"saved": False, "listing_id": listing_id}
