from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User

def get_current_user(db: Session = Depends(get_db)) -> User:
    # Mock authentication: Retrieve the demo guest or first guest
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
