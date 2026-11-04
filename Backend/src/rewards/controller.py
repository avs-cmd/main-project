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


# STUDENT: SUBMIT A REWARD REQUEST
def create_request(db: Session, student: User, data):

    reward_name = data.reward_name.strip()

    if not reward_name:
        raise HTTPException(
            status_code=422,
            detail="Reward name is required."
        )

    # Points are recorded for information only.
    # They do NOT determine whether a student can request a reward.
    points = get_student_points(db, student.id)

    item = RewardRequest(
        student_id=student.id,
        reward_name=reward_name,
        points_required=0,
        points_at_request=points,
        status="pending",
        student_note=(
            data.student_note.strip()
            if data.student_note
            else None
        ),
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    return item


# STUDENT: VIEW OWN REWARD REQUESTS
def list_student_requests(db: Session, student_id: int):

    return (
        db.query(RewardRequest)
        .filter(RewardRequest.student_id == student_id)
        .order_by(
            RewardRequest.requested_at.desc(),
            RewardRequest.id.desc()
        )
        .all()
    )


# ADMIN: VIEW ALL REWARD REQUESTS
def list_all_requests(db: Session):

    rows = (
        db.query(
            RewardRequest,
            User.full_name,
            User.email
        )
        .join(User, User.id == RewardRequest.student_id)
        .order_by(
            RewardRequest.requested_at.desc(),
            RewardRequest.id.desc()
        )
        .all()
    )

    results = []

    for item, student_name, student_email in rows:

        results.append({
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
            "voucher_code": item.voucher_code,
            "issued_at": item.issued_at,
        })

    return results


# ADMIN: APPROVE OR REJECT A REQUEST
def review_request(
    db: Session,
    request_id: int,
    status: str,
    admin_remarks: str | None
):

    item = (
        db.query(RewardRequest)
        .filter(RewardRequest.id == request_id)
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Reward request not found."
        )

    if item.status != "pending":
        raise HTTPException(
            status_code=409,
            detail=f"This request has already been reviewed. Current status: {item.status}."
        )

    item.status = status.lower()

    item.admin_remarks = (
        admin_remarks.strip()
        if admin_remarks
        else None
    )

    item.reviewed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(item)

    return item


# ADMIN: ISSUE A VOUCHER
def issue_voucher(
    db: Session,
    request_id: int,
    voucher_code: str,
    admin_remarks: str | None = None,
):

    item = (
        db.query(RewardRequest)
        .filter(RewardRequest.id == request_id)
        .with_for_update()
        .first()
    )

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Reward request not found."
        )

    if item.status != "approved":
        raise HTTPException(
            status_code=409,
            detail="Only approved reward requests can receive a voucher."
        )

    voucher_code = voucher_code.strip()

    if not voucher_code:
        raise HTTPException(
            status_code=422,
            detail="Voucher code cannot be empty."
        )

    item.voucher_code = voucher_code
    item.status = "issued"
    item.issued_at = datetime.now(timezone.utc)

    if admin_remarks:
        item.admin_remarks = admin_remarks.strip()

    try:
        db.commit()
        db.refresh(item)
        return item

    except Exception:
        db.rollback()
        raise