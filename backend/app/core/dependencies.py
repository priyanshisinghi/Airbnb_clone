from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User

def get_current_user(
    x_user_id: Optional[int] = Header(default=None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    # Mock authentication: use the selected seeded user or the demo guest.
    user = db.query(User).filter(User.id == x_user_id).first() if x_user_id else None
    if x_user_id and not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Selected demo user was not found",
        )
    if not user:
        user = db.query(User).filter(User.email == "demo.guest@example.com").first()
    if not user:
        user = db.query(User).filter(User.is_host == False).first()
    if not user:
        user = db.query(User).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No authenticated user available"
        )

    return user
