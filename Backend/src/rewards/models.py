from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func

from src.utils.db import Base


class RewardRequest(Base):
    """A student's persistent request for a reward.

    Reward codes are intentionally not stored here; they are sent through the
    separate email workflow after an administrator approves a request.
    """
    __tablename__ = "reward_requests"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    reward_name = Column(String(200), nullable=False)
    points_required = Column(Integer, nullable=False, default=0)
    points_at_request = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending", index=True)
    student_note = Column(Text, nullable=True)
    admin_remarks = Column(Text, nullable=True)
    requested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
