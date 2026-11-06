from fastapi import HTTPException
from sqlalchemy.orm import Session

from src.announcements.models import Announcement
from src.announcements.dtos import AnnouncementUpdate


def create_announcement(
    db: Session,
    title: str,
    description: str,
    whatsapp_link: str | None,
    image_url: str | None,
    admin_id: int,
):
    announcement = Announcement(
        title=title.strip(),
        description=description.strip(),
        whatsapp_link=(
            whatsapp_link.strip()
            if whatsapp_link and whatsapp_link.strip()
            else None
        ),
        image_url=image_url,
        created_by=admin_id,
        is_published=False,
    )

    try:
        db.add(announcement)
        db.commit()
        db.refresh(announcement)
        return announcement
    except Exception:
        db.rollback()
        raise


def get_all_announcements(db: Session):
    return (
        db.query(Announcement)
        .order_by(Announcement.created_at.desc())
        .all()
    )


def get_published_announcements(db: Session):
    return (
        db.query(Announcement)
        .filter(Announcement.is_published.is_(True))
        .order_by(Announcement.created_at.desc())
        .all()
    )


def update_announcement(
    db: Session,
    announcement_id: int,
    request: AnnouncementUpdate,
):
    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    announcement.title = request.title.strip()
    announcement.description = request.description.strip()
    announcement.whatsapp_link = (
        request.whatsapp_link.strip()
        if request.whatsapp_link and request.whatsapp_link.strip()
        else None
    )

    db.commit()
    db.refresh(announcement)

    return announcement


def set_announcement_published(
    db: Session,
    announcement_id: int,
    is_published: bool,
):
    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    announcement.is_published = is_published

    db.commit()
    db.refresh(announcement)

    return announcement


def delete_announcement(
    db: Session,
    announcement_id: int,
):
    announcement = (
        db.query(Announcement)
        .filter(Announcement.id == announcement_id)
        .first()
    )

    if not announcement:
        raise HTTPException(
            status_code=404,
            detail="Announcement not found",
        )

    db.delete(announcement)
    db.commit()

    return {"message": "Announcement deleted successfully"}