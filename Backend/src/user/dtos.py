
from pydantic import BaseModel, EmailStr, ConfigDict


class SignupRequest(BaseModel):
    full_name: str
    mobile: str
    email: EmailStr
    college: str
    linkedin_url: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    identity: str
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    mobile: str
    email: EmailStr
    college: str
    linkedin_url: str | None = None
    role: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    full_name: str
    mobile: str
    college: str
    linkedin_url: str | None = None
