from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.conversation import Conversation
from app.models.profile import Profile


async def get_or_create_conversation(db: AsyncSession, user_id: int) -> Conversation:
    """Get today's conversation or create new one."""
    # For MVP, just get the latest or create new
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .limit(1)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(user_id=user_id, messages=[])
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    return conversation


async def add_message(
    db: AsyncSession,
    conversation: Conversation,
    role: str,
    content: str
) -> None:
    """Add a message to conversation."""
    messages = conversation.messages.copy() if conversation.messages else []
    messages.append({"role": role, "content": content})
    conversation.messages = messages
    await db.commit()


async def get_user_profile(db: AsyncSession, user_id: int) -> dict:
    """Get user profile as dict."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return {}

    return {
        "current_stage": profile.current_stage,
        "nickname": profile.nickname,
        "current_identity": profile.current_identity,
        "ideal_identity": profile.ideal_identity,
        "core_problem": profile.core_problem,
        "anti_vision": profile.anti_vision,
        "vision": profile.vision,
        "identity_statement": profile.identity_statement,
        "key_insights": profile.key_insights
    }


async def update_user_insights(
    db: AsyncSession,
    user_id: int,
    insights: list[str]
) -> None:
    """Update user's key insights."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if profile:
        profile.key_insights = insights
        await db.commit()


async def clear_user_conversations(db: AsyncSession, user_id: int) -> None:
    """Clear all conversations for a user."""
    result = await db.execute(
        select(Conversation).where(Conversation.user_id == user_id)
    )
    conversations = result.scalars().all()

    for conv in conversations:
        conv.messages = []

    await db.commit()
