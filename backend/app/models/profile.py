# -*- coding: utf-8 -*-
from sqlalchemy import String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # Basic info
    nickname: Mapped[str | None] = mapped_column(String(50), nullable=True)

    # Identity exploration
    current_identity: Mapped[str | None] = mapped_column(Text, nullable=True)
    ideal_identity: Mapped[str | None] = mapped_column(Text, nullable=True)
    core_problem: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Core memories (from Dan Koe framework)
    anti_vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    identity_statement: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stage: new_user, exploring, established
    current_stage: Mapped[str] = mapped_column(String(20), default="new_user")

    # Key insights as JSON array
    key_insights: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship(back_populates="profile")
