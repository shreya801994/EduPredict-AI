from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.models.user import User
from app.db.session import get_db
from app.schemas.user import UserCreate, LoginRequest, Token 

router = APIRouter()

@router.post("/register", response_model=Token, summary="Register New Student")
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> Any:
    """
    Registers a brand new student account into the system database.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # FIXED: Changed password= to hashed_password= to match your SQLAlchemy Model column
    new_user = User(email=payload.email, hashed_password=payload.password, full_name=payload.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    import jwt
    token = jwt.encode({"sub": new_user.email}, "SECRET_KEY_CHANGEME", algorithm="HS256")
    return {"access_token": token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "email": new_user.email,
            "full_name": new_user.full_name}


@router.post("/login", response_model=Token, summary="Login User")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)) -> Any:
    """
    Logs a student into the system, returning their secure JWT token card.
    """
    user_record = db.query(User).filter(User.email == payload.email).first()
    
    # FIXED: Checking against user_record.hashed_password instead of .password
    if not user_record or user_record.hashed_password != payload.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email credentials or invalid password."
        )
    
    import jwt
    token = jwt.encode({"sub": user_record.email}, "SECRET_KEY_CHANGEME", algorithm="HS256")
    return {"access_token": token,
            "token_type": "bearer",
            "user_id": user_record.id,
            "email": user_record.email,
            "full_name": user_record.full_name}