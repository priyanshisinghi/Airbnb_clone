from typing import Optional

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    is_host: bool
    is_superhost: bool

    model_config = ConfigDict(from_attributes=True)
