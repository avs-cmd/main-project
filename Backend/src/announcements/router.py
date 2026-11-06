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

from src.announcements import controller
from src.announcements.dtos import (
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
        "and CLOUDINARY_API_SECRET."
    )

cloudinary.config(
    cloud_name=cloud_name,
    api_key=api_key,
    api_secret=api_secret,
    secure=True,
)


# =====================================================
# ROUTER AND IMAGE SETTINGS
# =====================================================

router = APIRouter(
    prefix="/announcements",
    tags=["Announcements"],
)

ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB


# =====================================================
# IMAGE VALIDATION AND CLOUDINARY UPLOAD
# =====================================================

async def upload_announcement_image(
    image: UploadFile | None,
):
    if image is None:
        return None

    try:
        extension = ALLOWED_TYPES.get(image.content_type or "")

        if not extension:
            raise HTTPException(
                status_code=400,
                detail="Upload a JPG, PNG, or WebP image.",
            )

        contents = await image.read(MAX_FILE_SIZE + 1)

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The selected image is empty.",
            )

        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Announcement image must be 2 MB or smaller.",
            )

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
            image.content_type or "",
            False,
        ):
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is not a valid supported image.",
            )

        try:
            result = cloudinary.uploader.upload(
                contents,
                folder="talerang/announcements",
                public_id=uuid4().hex,
                resource_type="image",
            )

            return result["secure_url"]

        except Exception as error:
            print(
                "Announcement Cloudinary upload failed:",
                type(error).__name__,
            )

            raise HTTPException(
                status_code=502,
                detail="Announcement image upload failed. Please try again.",
            )

    finally:
        await image.close()


# =====================================================
# ADMIN: CREATE ANNOUNCEMENT AS DRAFT
# =====================================================

@router.post(
    "",
    response_model=AnnouncementResponse,
)
async def create_announcement(
    title: str = Form(..., min_length=1, max_length=200),
    description: str = Form(..., min_length=1),
    whatsapp_link: str | None = Form(None),
    image: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    title = title.strip()
    description = description.strip()

    if not title or not description:
        raise HTTPException(
            status_code=400,
            detail="Title and description are required.",
        )

    image_url = await upload_announcement_image(image)

    return controller.create_announcement(
        db=db,
        title=title,
        description=description,
        whatsapp_link=whatsapp_link,
        image_url=image_url,
        admin_id=admin.id,
    )


# =====================================================
# ADMIN: VIEW ALL ANNOUNCEMENTS
# =====================================================

@router.get(
    "/admin",
    response_model=list[AnnouncementResponse],
)
def get_admin_announcements(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.get_all_announcements(db)


# =====================================================
# ADMIN: EDIT ANNOUNCEMENT TEXT
# =====================================================

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


# =====================================================
# ADMIN: PUBLISH OR UNPUBLISH
# =====================================================

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


# =====================================================
# ADMIN: DELETE ANNOUNCEMENT
# =====================================================

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.delete_announcement(db, announcement_id)


# =====================================================
# STUDENT: VIEW PUBLISHED ANNOUNCEMENTS
# =====================================================

@router.get(
    "",
    response_model=list[AnnouncementResponse],
)
def get_student_announcements(
    db: Session = Depends(get_db),
    student: User = Depends(get_current_user),
):
    if student.role != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required",
        )

    return controller.get_published_announcements(db)