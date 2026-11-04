from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class RewardRequestCreate(BaseModel):
    reward_name: str = Field(min_length=1, max_length=200)
    student_note: str | None = Field(default=None, max_length=2000)


class RewardRequestReview(BaseModel):
    admin_remarks: str | None = Field(default=None, max_length=2000)


class RewardVoucherIssue(BaseModel):
    voucher_code: str = Field(min_length=1, max_length=200)
    admin_remarks: str | None = Field(default=None, max_length=2000)


class RewardRequestResponse(BaseModel):
    id: int
    student_id: int

    student_name: str | None = None
    student_email: str | None = None

    reward_name: str
    points_required: int
    points_at_request: int

    status: str

    student_note: str | None = None
    admin_remarks: str | None = None

    requested_at: datetime
    reviewed_at: datetime | None = None

    voucher_code: str | None = None
    issued_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)