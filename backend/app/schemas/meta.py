from typing import Optional
from pydantic import BaseModel

class AmenitySchema(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None

    class Config:
        from_attributes = True

class CategorySchema(BaseModel):
    name: str
    count: int
