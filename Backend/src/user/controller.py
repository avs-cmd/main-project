
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.user.models import User
from src.utils.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from src.utils.constants import STUDENT_ROLE


def create_user(db: Session, user_data):
    if user_data.password != user_data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match",
        )

    existing_user = db.query(User).filter(
        or_(
            User.email == user_data.email,
            User.mobile == user_data.mobile,
        )
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email or mobile number already registered",
        )

    user = User(
        full_name=user_data.full_name,
        mobile=user_data.mobile,
        email=user_data.email,
        college=user_data.college,
        linkedin_url=user_data.linkedin_url,
        password=hash_password(user_data.password),
        role=STUDENT_ROLE,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def login_user(db: Session, login_data):
    user = db.query(User).filter(
        or_(
            User.email == login_data.identity,
            User.mobile == login_data.identity,
        )
    ).first()

    if user is None or not verify_password(
        login_data.password,
        user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token({
        "sub": str(user.id),
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


def update_profile(
    db: Session,
    current_user: User,
    user_data,
):
    current_user.full_name = user_data.full_name
    current_user.mobile = user_data.mobile
    current_user.college = user_data.college
    current_user.linkedin_url = user_data.linkedin_url

    db.commit()
    db.refresh(current_user)

    return current_user
