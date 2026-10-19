
from sqlalchemy.orm import Session

from src.tasks.models import Task, TaskSubmission


def get_active_tasks(db: Session):
    return (
        db.query(Task)
        .filter(Task.is_active.is_(True))
        .order_by(Task.id.asc())
        .all()
    )



def create_task_submission(
    db: Session,
    task_id: int,
    student_id: int,
    caption: str,
    photo_path: str,
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.is_active.is_(True),
        )
        .first()
    )

    if task is None:
        return None

    submission = TaskSubmission(
        task_id=task.id,
        student_id=student_id,
        caption=caption,
        photo_path=photo_path,
        status="completed",
        approved_points=task.points,
    )

    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission

def get_student_task_summary(db: Session, student_id: int):
    """Return database-backed task totals for one student."""
    from sqlalchemy import func

    total_points = (
        db.query(func.coalesce(func.sum(TaskSubmission.approved_points), 0))
        .filter(
            TaskSubmission.student_id == student_id,
            TaskSubmission.status == "completed",
        )
        .scalar()
    )

    completed_tasks = (
        db.query(TaskSubmission)
        .filter(
            TaskSubmission.student_id == student_id,
            TaskSubmission.status == "completed",
        )
        .count()
    )

    return {
        "total_points": int(total_points or 0),
        "completed_tasks": completed_tasks,
    }
