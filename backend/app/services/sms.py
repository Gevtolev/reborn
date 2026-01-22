import random
from app.core.config import settings


class SMSService:
    def generate_code(self, length: int = 6) -> str:
        """Generate a random numeric verification code."""
        return "".join(random.choices("0123456789", k=length))

    async def send_code(self, phone: str, code: str) -> bool:
        """
        Send verification code via SMS.
        In production, integrate with Aliyun SMS or other provider.
        For MVP, just log and return True.
        """
        if settings.DEBUG:
            print(f"[DEBUG SMS] Sending code {code} to {phone}")
            return True

        # TODO: Integrate real SMS provider
        return True
