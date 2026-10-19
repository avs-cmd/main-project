
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from src.utils.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    mobile = Column(String, nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True, index=True)
    college = Column(String, nullable=False)
    linkedin_url = Column(String(500), nullable=True)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
