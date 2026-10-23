from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.rewards import controller
from src.rewards.dtos import (
    RewardRequestCreate,
    RewardRequestResponse,
    RewardRequestReview,
)
from src.utils.dependencies import get_db, get_current_user, require_admin
from src.user.models import User

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.post("/requests", response_model=RewardRequestResponse, status_code=201)
def create_reward_request(
    request_data: RewardRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = controller.create_request(db, current_user, request_data)
    return {
        "id": item.id,
        "student_id": item.student_id,
        "student_name": current_user.full_name,
        "student_email": current_user.email,
        "reward_name": item.reward_name,
        "points_required": item.points_required,
        "points_at_request": item.points_at_request,
        "status": item.status,
        "student_note": item.student_note,
        "admin_remarks": item.admin_remarks,
        "requested_at": item.requested_at,
        "reviewed_at": item.reviewed_at,
    }


@router.get("/requests/me", response_model=list[RewardRequestResponse])
def get_my_reward_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    items = controller.list_student_requests(db, current_user.id)
    return [
        {
            "id": item.id,
            "student_id": item.student_id,
            "student_name": current_user.full_name,
            "student_email": current_user.email,
            "reward_name": item.reward_name,
            "points_required": item.points_required,
            "points_at_request": item.points_at_request,
            "status": item.status,
            "student_note": item.student_note,
            "admin_remarks": item.admin_remarks,
            "requested_at": item.requested_at,
            "reviewed_at": item.reviewed_at,
        }
        for item in items
    ]


@router.get("/requests", response_model=list[RewardRequestResponse])
def get_all_reward_requests(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    return controller.list_all_requests(db)


@router.patch("/requests/{request_id}/approve", response_model=RewardRequestResponse)
def approve_reward_request(
    request_id: int,
    review_data: RewardRequestReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = controller.review_request(
        db, request_id, "approved", review_data.admin_remarks
    )
    return {
        "id": item.id,
        "student_id": item.student_id,
        "reward_name": item.reward_name,
        "points_required": item.points_required,
        "points_at_request": item.points_at_request,
        "status": item.status,
        "student_note": item.student_note,
        "admin_remarks": item.admin_remarks,
        "requested_at": item.requested_at,
        "reviewed_at": item.reviewed_at,
    }


@router.patch("/requests/{request_id}/reject", response_model=RewardRequestResponse)
def reject_reward_request(
    request_id: int,
    review_data: RewardRequestReview,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    item = controller.review_request(
        db, request_id, "rejected", review_data.admin_remarks
    )
    return {
        "id": item.id,
        "student_id": item.student_id,
        "reward_name": item.reward_name,
        "points_required": item.points_required,
        "points_at_request": item.points_at_request,
        "status": item.status,
        "student_note": item.student_note,
        "admin_remarks": item.admin_remarks,
        "requested_at": item.requested_at,
        "reviewed_at": item.reviewed_at,
    }
