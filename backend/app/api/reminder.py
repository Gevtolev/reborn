from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from app.api.deps import get_current_user
from app.models.user import User
from app.services.reminder import ReminderService

router = APIRouter(prefix="/reminder", tags=["reminder"])

reminder_service = ReminderService()


class ReminderSettings(BaseModel):
    reminder_count: int = 3
    start_hour: int = 9
    end_hour: int = 21


class ScheduleResponse(BaseModel):
    scheduled_time: datetime
    question: str


@router.get("/question")
async def get_random_question(user: User = Depends(get_current_user)):
    """Get a random reflection question."""
    question = reminder_service.get_random_question()
    return {"question": question}


@router.post("/schedule", response_model=list[ScheduleResponse])
async def generate_schedule(
    settings: ReminderSettings,
    user: User = Depends(get_current_user)
):
    """Generate today's reminder schedule."""
    schedule = reminder_service.generate_daily_schedule(
        user_id=user.id,
        date=datetime.now(),
        reminder_count=settings.reminder_count,
        start_hour=settings.start_hour,
        end_hour=settings.end_hour
    )

    return [
        ScheduleResponse(
            scheduled_time=item["scheduled_time"],
            question=item["question"]
        )
        for item in schedule
    ]
