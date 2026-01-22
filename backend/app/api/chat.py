from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.conversation import (
    get_or_create_conversation,
    add_message,
    get_user_profile
)
from app.ai import chat_stream_with_agent, FIRST_MESSAGE_PROMPT

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatHistoryResponse(BaseModel):
    messages: list[dict]


@router.get("/first-message")
async def get_first_message(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the first message for new users."""
    return {"message": FIRST_MESSAGE_PROMPT}


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current conversation history."""
    conversation = await get_or_create_conversation(db, user.id)
    return ChatHistoryResponse(messages=conversation.messages or [])


@router.post("/send")
async def send_message(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get streaming response."""
    # Get conversation and profile
    conversation = await get_or_create_conversation(db, user.id)
    profile = await get_user_profile(db, user.id)

    # Add user message
    await add_message(db, conversation, "user", request.message)

    # Prepare messages for AI (include the new message)
    ai_messages = conversation.messages or []

    async def generate():
        full_response = []
        try:
            async for chunk in chat_stream_with_agent(ai_messages, profile):
                full_response.append(chunk)
                yield f"data: {chunk}\n\n"

            # Save assistant response
            assistant_message = "".join(full_response)
            await add_message(db, conversation, "assistant", assistant_message)

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
