from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.utils.db import SessionLocal
from src.user.controller import create_user, login_user , update_profile
from src.user.dtos import (
    SignupRequest,
    LoginRequest,
    UserResponse,
    LoginResponse,
    UpdateProfileRequest
)
from src.utils.dependencies import get_current_user, get_db
from src.user.models import User

router = APIRouter(
    prefix="/user",
    tags=["User"]
)



@router.post("/signup", response_model=UserResponse)
def signup(
    user_data: SignupRequest,
    db: Session = Depends(get_db)
):
    return create_user(db, user_data)
@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    return login_user(db, login_data)

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user

@router.put("/profile",response_model=UserResponse)
def update_my_profile(
    user_data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_profile(
        db,
        current_user,
        user_data
    )
