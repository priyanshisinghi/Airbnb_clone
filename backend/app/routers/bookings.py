from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.booking import BookingCreateRequest, BookingResponse
from app.services import booking_service

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    payload: BookingCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return booking_service.create_booking(db=db, current_user=current_user, payload=payload)

@router.get("/me", response_model=List[BookingResponse])
def get_my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return booking_service.get_user_bookings(db=db, current_user=current_user)

@router.get("/host", response_model=List[BookingResponse])
def get_host_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return booking_service.get_host_bookings(db=db, current_user=current_user)

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return booking_service.cancel_booking(db=db, current_user=current_user, booking_id=booking_id)
