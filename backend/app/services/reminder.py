import random
from datetime import datetime, time
from app.data.questions import REFLECTION_QUESTIONS


class ReminderService:
    def __init__(self):
        self.questions = REFLECTION_QUESTIONS

    def get_random_question(self) -> str:
        """Get a random reflection question."""
        return random.choice(self.questions)

    def generate_random_times(
        self,
        count: int,
        start_hour: int = 9,
        end_hour: int = 21
    ) -> list[time]:
        """
        Generate random reminder times for a day.

        Args:
            count: Number of reminders
            start_hour: Start of allowed time range (default 9am)
            end_hour: End of allowed time range (default 9pm)

        Returns:
            List of time objects, sorted
        """
        total_minutes = (end_hour - start_hour) * 60
        times = []

        for _ in range(count):
            random_minutes = random.randint(0, total_minutes)
            hour = start_hour + random_minutes // 60
            minute = random_minutes % 60
            times.append(time(hour=hour, minute=minute))

        return sorted(times)

    def generate_daily_schedule(
        self,
        user_id: int,
        date: datetime,
        reminder_count: int = 3,
        start_hour: int = 9,
        end_hour: int = 21
    ) -> list[dict]:
        """
        Generate a daily reminder schedule for a user.

        Returns:
            List of {user_id, scheduled_time, question}
        """
        times = self.generate_random_times(reminder_count, start_hour, end_hour)
        schedule = []

        for t in times:
            scheduled_time = datetime.combine(date.date(), t)
            schedule.append({
                "user_id": user_id,
                "scheduled_time": scheduled_time,
                "question": self.get_random_question()
            })

        return schedule
