
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.utils.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    points = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    submissions = relationship(
        "TaskSubmission",
        back_populates="task",
        cascade="all, delete-orphan",
    )


class TaskSubmission(Base):
    __tablename__ = "task_submissions"

    id = Column(Integer, primary_key=True, index=True)

    task_id = Column(
        Integer,
        ForeignKey("tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # The student who submitted the activity
    student_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    caption = Column(Text, nullable=False)
    photo_path = Column(String(500), nullable=False)

    status = Column(
        String(20),
        nullable=False,
        default="pending",
        index=True,
    )

    admin_remarks = Column(Text, nullable=True)
    approved_points = Column(Integer, nullable=False, default=0)

    submitted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    task = relationship("Task", back_populates="submissions")
