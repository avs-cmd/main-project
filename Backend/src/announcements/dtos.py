
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    whatsapp_link: Optional[str] = None


class AnnouncementUpdate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    whatsapp_link: Optional[str] = None


class AnnouncementPublish(BaseModel):
    is_published: bool


class AnnouncementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    whatsapp_link: Optional[str] = None
    created_by: int
    is_published: bool
    created_at: datetime
    updated_at: datetime
    image_url: Optional[str] = None
