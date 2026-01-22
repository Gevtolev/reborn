from sqlalchemy import Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Messages as JSON array
    messages: Mapped[list] = mapped_column(JSON, default=list)

    # AI-generated summary for long-term memory
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Extracted insights
    extracted_insights: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship(back_populates="conversations")
