
import os
from uuid import uuid4

import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from src.tasks import controller
from src.tasks.dtos import TaskResponse, TaskSubmissionResponse
from src.utils.dependencies import get_db, get_current_user
from src.user.models import User

from sqlalchemy import and_, func
from src.tasks.models import TaskSubmission




# =====================================================
# CLOUDINARY CONFIGURATION
# =====================================================

load_dotenv()

cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
api_key = os.getenv("CLOUDINARY_API_KEY")
api_secret = os.getenv("CLOUDINARY_API_SECRET")

if not all([cloud_name, api_key, api_secret]):
    raise RuntimeError(
        "Cloudinary configuration is missing. "
        "Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY "
        "and CLOUDINARY_API_SECRET in your Backend .env file."
    )

cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True,
)


# =====================================================
# ROUTER AND UPLOAD SETTINGS
# =====================================================

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB
# =====================================================
# STUDENT RANKINGS / LEADERBOARD
# =====================================================

@router.get("/rankings")
def get_student_rankings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get every student, including students with zero points.
    results = (
        db.query(
            User.id.label("student_id"),
            User.full_name.label("full_name"),
            User.college.label("college"),
            func.coalesce(
                func.sum(TaskSubmission.approved_points), 0
            ).label("total_points"),
        )
        .outerjoin(
            TaskSubmission,
            and_(
                TaskSubmission.student_id == User.id,
                TaskSubmission.status == "completed",
            ),
        )
        .filter(User.role == "student")
        .group_by(User.id, User.full_name, User.college)
        .order_by(
            func.coalesce(
                func.sum(TaskSubmission.approved_points), 0
            ).desc(),
            User.full_name.asc(),
        )
        .all()
    )

    # Assign positions based on points.
    rankings = []

    for position, student in enumerate(results, start=1):
        rankings.append({
            "rank": position,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "college": student.college,
            "total_points": int(student.total_points or 0),
        })

    return rankings



# =====================================================
# LIST ACTIVE TASKS
# =====================================================

@router.get("/", response_model=list[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    return controller.get_active_tasks(db)



# =====================================================
# CURRENT STUDENT'S POINTS SUMMARY
# =====================================================

@router.get("/summary")
def get_my_task_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return controller.get_student_task_summary(
        db=db,
        student_id=current_user.id,
    )


# =====================================================
# SUBMIT ACTIVITY AND UPLOAD PHOTO TO CLOUDINARY
# =====================================================

@router.post(
    "/submissions",
    response_model=TaskSubmissionResponse,
)
async def submit_activity(
    task_id: int = Form(...),
    caption: str = Form(..., min_length=1, max_length=2000),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # ---------------------------------------------
        # 1. Validate caption
        # ---------------------------------------------

        caption = caption.strip()

        if not caption:
            raise HTTPException(
                status_code=400,
                detail="Caption is required.",
            )

        # ---------------------------------------------
        # 2. Validate file type
        # ---------------------------------------------

        extension = ALLOWED_TYPES.get(photo.content_type or "")

        if not extension:
            raise HTTPException(
                status_code=400,
                detail="Upload a JPG, PNG, or WebP image.",
            )

        # ---------------------------------------------
        # 3. Read and validate file size
        # ---------------------------------------------

        contents = await photo.read(MAX_FILE_SIZE + 1)

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Photo must be 2 MB or smaller.",
            )

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="Photo is empty.",
            )

        # ---------------------------------------------
        # 4. Verify actual image signature
        # ---------------------------------------------

        valid_signatures = {
            "image/jpeg": contents.startswith(b"\xff\xd8\xff"),
            "image/png": contents.startswith(
                b"\x89PNG\r\n\x1a\n"
            ),
            "image/webp": (
                len(contents) >= 12
                and contents.startswith(b"RIFF")
                and contents[8:12] == b"WEBP"
            ),
        }

        if not valid_signatures.get(
            photo.content_type or "",
            False,
        ):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid supported image.",
            )

        # ---------------------------------------------
        # 5. Confirm task is active
        # ---------------------------------------------

        active_tasks = controller.get_active_tasks(db)

        task_exists = any(
            task.id == task_id for task in active_tasks
        )

        if not task_exists:
            raise HTTPException(
                status_code=404,
                detail="Active task not found.",
            )

        # ---------------------------------------------
        # 6. Upload photo to Cloudinary
        # ---------------------------------------------

        try:
            upload_result = cloudinary.uploader.upload(
                contents,
                folder="talerang/activity_proofs",
                public_id=uuid4().hex,
                resource_type="image",
            )

            photo_url = upload_result["secure_url"]

        except Exception as error:
            print(
                "Cloudinary upload failed:",
                type(error).__name__,
            )

            raise HTTPException(
                status_code=502,
                detail="Photo upload failed. Please try again.",
            )

        # ---------------------------------------------
        # 7. Save submission and Cloudinary URL to DB
        # ---------------------------------------------

        submission = controller.create_task_submission(
            db=db,
            task_id=task_id,
            student_id=current_user.id,
            caption=caption,
            photo_path=photo_url,
        )

        if submission is None:
            raise HTTPException(
                status_code=404,
                detail="Active task not found.",
            )

        return submission

    finally:
        await photo.close()
