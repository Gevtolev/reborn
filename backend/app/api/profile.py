from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileResponse(BaseModel):
    anti_vision: str | None
    vision: str | None
    identity_statement: str | None
    current_stage: str
    key_insights: list | None


class ProfileUpdateRequest(BaseModel):
    anti_vision: str | None = None
    vision: str | None = None
    identity_statement: str | None = None
    key_insights: list | None = None


@router.get("", response_model=ProfileResponse)
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user profile."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return ProfileResponse(
            anti_vision=None,
            vision=None,
            identity_statement=None,
            current_stage="new_user",
            key_insights=None
        )

    return ProfileResponse(
        anti_vision=profile.anti_vision,
        vision=profile.vision,
        identity_statement=profile.identity_statement,
        current_stage=profile.current_stage,
        key_insights=profile.key_insights
    )


@router.put("")
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    if request.anti_vision is not None:
        profile.anti_vision = request.anti_vision
    if request.vision is not None:
        profile.vision = request.vision
    if request.identity_statement is not None:
        profile.identity_statement = request.identity_statement
    if request.key_insights is not None:
        profile.key_insights = request.key_insights

    # Update stage based on profile completeness
    if profile.vision and profile.anti_vision:
        profile.current_stage = "established"
    elif profile.anti_vision or profile.vision:
        profile.current_stage = "exploring"

    await db.commit()

    return {"message": "Profile updated"}
