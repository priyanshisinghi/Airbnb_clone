from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

class ListingAmenity(Base):
    __tablename__ = "listing_amenities"

    listing_id = Column(Integer, ForeignKey("listings.id", ondelete="CASCADE"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)

class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    icon = Column(String, nullable=True)

    # Relationship back to Listing via ListingAmenity
    listings = relationship("Listing", secondary="listing_amenities", back_populates="amenities")
