
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    points: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class TaskSubmissionCreate(BaseModel):
    task_id: int
    caption: str = Field(min_length=1, max_length=2000)


class TaskSubmissionResponse(BaseModel):
    id: int
    task_id: int
    student_id: int
    caption: str
    photo_path: str
    status: str
    approved_points: int
    admin_remarks: Optional[str] = None
    submitted_at: datetime

    model_config = ConfigDict(from_attributes=True)
