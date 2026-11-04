
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.announcements import controller
from src.announcements.dtos import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementPublish,
    AnnouncementResponse,
)
from src.utils.dependencies import (
    get_db,
    get_current_user,
    require_admin,
)
from src.user.models import User


router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)


# ADMIN: Create announcement as an unpublished draft
@router.post(
    "",
    response_model=AnnouncementResponse,
)
def create_announcement(
    request: AnnouncementCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.create_announcement(
        db=db,
        request=request,
        admin_id=admin.id,
    )


# ADMIN: View all announcements
@router.get(
    "/admin",
    response_model=list[AnnouncementResponse],
)
def get_admin_announcements(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_all_announcements(db)


# ADMIN: Edit announcement
@router.put(
    "/{announcement_id}",
    response_model=AnnouncementResponse,
)
def update_announcement(
    announcement_id: int,
    request: AnnouncementUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.update_announcement(
        db=db,
        announcement_id=announcement_id,
        request=request,
    )


# ADMIN: Publish or unpublish announcement
@router.patch(
    "/{announcement_id}/publish",
    response_model=AnnouncementResponse,
)
def publish_announcement(
    announcement_id: int,
    request: AnnouncementPublish,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.set_announcement_published(
        db=db,
        announcement_id=announcement_id,
        is_published=request.is_published,
    )


# ADMIN: Delete announcement
@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.delete_announcement(
        db=db,
        announcement_id=announcement_id,
    )


# STUDENT: View published announcements only
@router.get(
    "",
    response_model=list[AnnouncementResponse],
)
def get_student_announcements(
    db: Session = Depends(get_db),
    student: User = Depends(get_current_user),
):
    if student.role != "student":
        from fastapi import HTTPException
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    return controller.get_published_announcements(db)
