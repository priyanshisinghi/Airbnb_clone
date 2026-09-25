from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    property_type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    city = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0, nullable=False)
    max_guests = Column(Integer, nullable=False)
    bedrooms = Column(Integer, nullable=False)
    beds = Column(Integer, nullable=False)
    bathrooms = Column(Float, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    host = relationship("User", back_populates="hosted_listings")
    images = relationship("ListingImage", back_populates="listing", cascade="all, delete-orphan", order_by="ListingImage.position")
    amenities = relationship("Amenity", secondary="listing_amenities", back_populates="listings")
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")
    wishlists = relationship("Wishlist", back_populates="listing", cascade="all, delete-orphan")

class ListingImage(Base):
    __tablename__ = "listing_images"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), nullable=False, index=True)
    url = Column(String, nullable=False)
    position = Column(Integer, default=0, nullable=False)

    # Relationship
    listing = relationship("Listing", back_populates="images")
