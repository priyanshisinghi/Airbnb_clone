from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Float, String, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    guest_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)
    guests = Column(Integer, nullable=False)
    nightly_price = Column(Float, nullable=False)
    nights = Column(Integer, nullable=False)
    cleaning_fee = Column(Float, nullable=False)
    service_fee = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="confirmed", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Relationships
    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_bookings_availability", "listing_id", "check_in", "check_out"),
    )
