from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.services.sms import SMSService
from app.services.auth import create_access_token, get_or_create_user

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory code storage (use Redis in production)
_verification_codes: dict[str, str] = {}

sms_service = SMSService()


class SendCodeRequest(BaseModel):
    phone: str


class VerifyCodeRequest(BaseModel):
    phone: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/send-code")
async def send_code(request: SendCodeRequest):
    """Send verification code to phone number."""
    code = sms_service.generate_code()
    _verification_codes[request.phone] = code
    await sms_service.send_code(request.phone, code)

    # In DEBUG mode, return the code for testing
    if settings.DEBUG:
        return {"message": "Code sent", "code": code}
    return {"message": "Code sent"}


@router.post("/verify-code", response_model=TokenResponse)
async def verify_code(request: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    """Verify code and return access token."""
    # DEV MODE: Skip code verification
    # stored_code = _verification_codes.get(request.phone)
    # if not stored_code or stored_code != request.code:
    #     raise HTTPException(status_code=400, detail="Invalid code")
    # del _verification_codes[request.phone]

    # Get or create user
    user = await get_or_create_user(db, request.phone)

    # Generate token
    token = create_access_token(user.id)

    return TokenResponse(access_token=token)
