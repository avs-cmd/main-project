from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from src.rewards.models import RewardRequest
from src.tasks.models import TaskSubmission
from src.user.models import User


def get_student_points(db: Session, student_id: int) -> int:
    total = (
        db.query(func.coalesce(func.sum(TaskSubmission.approved_points), 0))
        .filter(
            TaskSubmission.student_id == student_id,
            TaskSubmission.status == "completed",
        )
        .scalar()
    )
    return int(total or 0)


def create_request(db: Session, student: User, data):
    reward_name = data.reward_name.strip()
    if not reward_name:
        raise HTTPException(status_code=422, detail="Reward name is required.")

    # Prevent accidental duplicate requests for the same reward while one is
    # awaiting a decision. A rejected request can be submitted again.
    existing = (
        db.query(RewardRequest)
        .filter(
            RewardRequest.student_id == student.id,
            RewardRequest.reward_name == reward_name,
            RewardRequest.status.in_(["pending", "approved"]),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You already have an active request for this reward.",
        )

    points = get_student_points(db, student.id)
    if points < data.points_required:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough points for this reward. Current points: {points}.",
        )

    item = RewardRequest(
        student_id=student.id,
        reward_name=reward_name,
        points_required=data.points_required,
        points_at_request=points,
        status="pending",
        student_note=(data.student_note.strip() if data.student_note else None),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def list_student_requests(db: Session, student_id: int):
    return (
        db.query(RewardRequest)
        .filter(RewardRequest.student_id == student_id)
        .order_by(RewardRequest.requested_at.desc(), RewardRequest.id.desc())
        .all()
    )


def list_all_requests(db: Session):
    rows = (
        db.query(RewardRequest, User.full_name, User.email)
        .join(User, User.id == RewardRequest.student_id)
        .order_by(RewardRequest.requested_at.desc(), RewardRequest.id.desc())
        .all()
    )
    results = []
    for item, student_name, student_email in rows:
        payload = {
            "id": item.id,
            "student_id": item.student_id,
            "student_name": student_name,
            "student_email": student_email,
            "reward_name": item.reward_name,
            "points_required": item.points_required,
            "points_at_request": item.points_at_request,
            "status": item.status,
            "student_note": item.student_note,
            "admin_remarks": item.admin_remarks,
            "requested_at": item.requested_at,
            "reviewed_at": item.reviewed_at,
        }
        results.append(payload)
    return results


def review_request(db: Session, request_id: int, status: str, admin_remarks: str | None):
    item = db.query(RewardRequest).filter(RewardRequest.id == request_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Reward request not found.")

    if item.status not in ("pending",):
        raise HTTPException(
            status_code=409,
            detail=f"Only pending requests can be reviewed. Current status: {item.status}.",
        )

    item.status = status
    item.admin_remarks = admin_remarks.strip() if admin_remarks else None
    item.reviewed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item
