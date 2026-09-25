from typing import List

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.host_listing import HostListingPayload
from app.schemas.listing import ListingSummaryResponse
from app.services import host_listing_service

router = APIRouter(prefix="/host/listings", tags=["host listings"])


@router.get("", response_model=List[ListingSummaryResponse])
def get_my_listings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return host_listing_service.get_host_listings(db=db, user=current_user)


@router.post("", response_model=ListingSummaryResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: HostListingPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return host_listing_service.create_host_listing(
        db=db,
        user=current_user,
        payload=payload,
    )


@router.put("/{listing_id}", response_model=ListingSummaryResponse)
def update_listing(
    listing_id: int,
    payload: HostListingPayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return host_listing_service.update_host_listing(
        db=db,
        user=current_user,
        listing_id=listing_id,
        payload=payload,
    )


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    host_listing_service.delete_host_listing(
        db=db,
        user=current_user,
        listing_id=listing_id,
    )
    return Response(status_code=status.HTTP_204_NO_CONTENT)
