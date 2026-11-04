from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.admin import controller
from src.admin.dtos import AdminStudentResponse
from src.utils.dependencies import get_db, require_admin
from src.user.models import User
from src.admin.dtos import SubmissionActionRequest
from src.admin.dtos import UpdateDesignationRequest


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/students",
    response_model=list[AdminStudentResponse],
)
def get_students(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_all_students(db)


@router.get(
    "/students/{student_id}",
    response_model=AdminStudentResponse,
)
def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_student_profile(db, student_id)

@router.get("/students/{student_id}/submissions")
def get_student_activities(
    student_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_student_activities(
        db=db,
        student_id=student_id
    )

@router.post("/submissions/{submission_id}/undo")
def undo_student_submission(
    submission_id: int,
    request: SubmissionActionRequest | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.undo_submission(
        db=db,
        submission_id=submission_id,
        remarks=request.remarks if request else None,
    )


@router.post("/submissions/{submission_id}/reject")
def reject_student_submission(
    submission_id: int,
    request: SubmissionActionRequest | None = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.reject_submission(
        db=db,
        submission_id=submission_id,
        remarks=request.remarks if request else None,
    )
@router.put("/students/{student_id}/designation")
def update_designation(
    student_id: int,
    request: UpdateDesignationRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.update_student_designation(
        db=db,
        student_id=student_id,
        designation=request.designation,
    )
@router.get("/rankings")
def get_admin_rankings(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_admin_rankings(db)