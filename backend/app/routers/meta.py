from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.meta import CategorySchema, AmenitySchema
from app.services import listing_service

router = APIRouter(prefix="/meta", tags=["meta"])

@router.get("/categories", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    return listing_service.get_meta_categories(db=db)

@router.get("/amenities", response_model=List[AmenitySchema])
def get_amenities(db: Session = Depends(get_db)):
    return listing_service.get_meta_amenities(db=db)
