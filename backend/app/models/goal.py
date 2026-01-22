from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Goal(Base, TimestampMixin):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Type: yearly, monthly, daily
    type: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)

    # Status: active, completed, abandoned
    status: Mapped[str] = mapped_column(String(20), default="active")

    # Link to parent goal
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("goals.id"), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="goals")
