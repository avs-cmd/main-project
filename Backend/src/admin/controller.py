from fastapi import HTTPException
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func,and_

from src.user.models import User
from src.tasks.models import Task, TaskSubmission
from src.rewards.models import RewardRequest


def get_all_students(db: Session):
    students = (
        db.query(User)
        .filter(User.role == "student")
        .order_by(User.full_name.asc())
        .all()
    )

    results = []

    for student in students:
        total_points = (
            db.query(
                func.coalesce(
                    func.sum(TaskSubmission.approved_points), 0
                )
            )
            .filter(
                TaskSubmission.student_id == student.id,
                TaskSubmission.status == "completed",
            )
            .scalar()
        )

        completed_activities = (
            db.query(TaskSubmission)
            .filter(
                TaskSubmission.student_id == student.id,
                TaskSubmission.status == "completed",
            )
            .count()
        )

        rewards_count = (
            db.query(RewardRequest)
            .filter(
                RewardRequest.student_id == student.id,
                RewardRequest.status == "issued",
            )
            .count()
        )

        results.append({
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
            "mobile": student.mobile,
            "college": student.college,
            "linkedin_url": student.linkedin_url,
            "designation": student.designation,
            "total_points": int(total_points or 0),
            "completed_activities": completed_activities,
            "rewards_count": rewards_count,
        })

    return results


def get_student_profile(db: Session, student_id: int):
    student = (
        db.query(User)
        .filter(
            User.id == student_id,
            User.role == "student",
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    total_points = (
        db.query(
            func.coalesce(func.sum(TaskSubmission.approved_points), 0)
        )
        .filter(
            TaskSubmission.student_id == student.id,
            TaskSubmission.status == "completed",
        )
        .scalar()
    )

    completed_activities = (
        db.query(TaskSubmission)
        .filter(
            TaskSubmission.student_id == student.id,
            TaskSubmission.status == "completed",
        )
        .count()
    )

    rewards_count = (
        db.query(RewardRequest)
        .filter(
            RewardRequest.student_id == student.id,
            RewardRequest.status == "issued",
        )
        .count()
    )

    return {
        "id": student.id,
        "full_name": student.full_name,
        "email": student.email,
        "mobile": student.mobile,
        "college": student.college,
        "linkedin_url": student.linkedin_url,
        "designation": student.designation,
        "total_points": int(total_points or 0),
        "completed_activities": completed_activities,
        "rewards_count": rewards_count,
    }
def get_student_activities(db: Session, student_id: int):

    student = (
        db.query(User)
        .filter(
            User.id == student_id,
            User.role == "student"
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    submissions = (
        db.query(TaskSubmission, Task)
        .join(Task, TaskSubmission.task_id == Task.id)
        .filter(TaskSubmission.student_id == student_id)
        .order_by(TaskSubmission.submitted_at.desc())
        .all()
    )

    activities = []

    for submission, task in submissions:
        activities.append({
            "submission_id": submission.id,
            "task_id": task.id,
            "task_title": task.title,
            "task_description": task.description,
            "student_description": submission.caption,
            "photo_url": submission.photo_path,
            "status": submission.status,
            "points": submission.approved_points,
            "submitted_at": submission.submitted_at,
            "admin_remarks": submission.admin_remarks
        })

    return activities
def undo_submission(
    db: Session,
    submission_id: int,
    remarks: str | None = None,
):
    submission = (
        db.query(TaskSubmission)
        .filter(TaskSubmission.id == submission_id)
        .with_for_update()
        .first()
    )

    if submission is None:
        raise HTTPException(
            status_code=404,
            detail="Submission not found",
        )

    if submission.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Only completed submissions can be undone.",
        )

    old_points = submission.approved_points

    try:
        submission.status = "undone"
        submission.approved_points = 0
        submission.admin_remarks = remarks or "Task completion undone by admin."
        submission.reviewed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(submission)

    except Exception:
        db.rollback()
        raise

    return {
        "message": "Task successfully undone.",
        "submission_id": submission.id,
        "previous_points": old_points,
        "deducted_points": old_points,
        "status": submission.status,
    }


def reject_submission(
    db: Session,
    submission_id: int,
    remarks: str | None = None,
):
    submission = (
        db.query(TaskSubmission)
        .filter(TaskSubmission.id == submission_id)
        .with_for_update()
        .first()
    )

    if submission is None:
        raise HTTPException(
            status_code=404,
            detail="Submission not found",
        )

    if submission.status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Only completed submissions can be rejected.",
        )

    old_points = submission.approved_points

    try:
        submission.status = "rejected"
        submission.approved_points = 0
        submission.admin_remarks = remarks or "Submission rejected by admin."
        submission.reviewed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(submission)

    except Exception:
        db.rollback()
        raise

    return {
        "message": "Submission successfully rejected.",
        "submission_id": submission.id,
        "previous_points": old_points,
        "deducted_points": old_points,
        "status": submission.status,
    }
def update_student_designation(
    db: Session,
    student_id: int,
    designation: str,
):
    allowed_designations = [
        "Campus Ambassador",
        "Chapter Ambassador"
    ]

    if designation not in allowed_designations:
        raise HTTPException(
            status_code=400,
            detail="Invalid designation"
        )

    student = (
        db.query(User)
        .filter(
            User.id == student_id,
            User.role == "student"
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found"
        )

    student.designation = designation

    db.commit()
    db.refresh(student)

    return {
        "message": "Student designation updated successfully",
        "student_id": student.id,
        "designation": student.designation
    }
def get_admin_rankings(db: Session):

    results = (
        db.query(
            User.id.label("student_id"),
            User.full_name.label("full_name"),
            User.college.label("college"),
            User.designation.label("designation"),
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
        .group_by(
            User.id,
            User.full_name,
            User.college,
            User.designation,
        )
        .order_by(
            func.coalesce(
                func.sum(TaskSubmission.approved_points), 0
            ).desc(),
            User.full_name.asc(),
        )
        .all()
    )

    rankings = []

    for position, student in enumerate(results, start=1):
        rankings.append({
            "rank": position,
            "student_id": student.student_id,
            "full_name": student.full_name,
            "college": student.college,
            "designation": student.designation,
            "total_points": int(student.total_points or 0),
        })

    return rankings