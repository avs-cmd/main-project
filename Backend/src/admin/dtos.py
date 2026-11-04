from pydantic import BaseModel, ConfigDict, EmailStr


class AdminStudentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    mobile: str
    college: str
    linkedin_url: str | None = None
    designation: str
    total_points: int
    completed_activities: int
    rewards_count: int

    model_config = ConfigDict(from_attributes=True)


class SubmissionActionRequest(BaseModel):
    remarks: str | None = None
class UpdateDesignationRequest(BaseModel):
    designation: str