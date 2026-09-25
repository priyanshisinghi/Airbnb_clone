from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.listing import ListingSummaryResponse
from app.services import wishlist_service

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("", response_model=List[ListingSummaryResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all listings the current user has saved."""
    return wishlist_service.get_wishlist_listings(db=db, user=current_user)


@router.get("/ids", response_model=List[int])
def get_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return only the listing IDs saved by the current user (lightweight)."""
    return wishlist_service.get_wishlist_listing_ids(db=db, user=current_user)


@router.post("/{listing_id}", status_code=status.HTTP_200_OK)
def add_to_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return wishlist_service.add_to_wishlist(db=db, user=current_user, listing_id=listing_id)


@router.delete("/{listing_id}", status_code=status.HTTP_200_OK)
def remove_from_wishlist(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return wishlist_service.remove_from_wishlist(db=db, user=current_user, listing_id=listing_id)
