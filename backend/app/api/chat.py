# -*- coding: utf-8 -*-
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
    get_user_profile,
    update_user_insights,
    clear_user_conversations,
)
from app.ai import chat_stream_with_agent, chat_with_agent, FIRST_MESSAGE_PROMPT
from app.ai.prompts import extract_insights_from_response, clean_insight_markers

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
        full_response = ""
        try:
            async for chunk in chat_stream_with_agent(ai_messages, profile):
                full_response += chunk
                yield f"data: {chunk}\n\n"

            # Save assistant response
            await add_message(db, conversation, "assistant", full_response)

            # Extract insights from full response
            insights = extract_insights_from_response(full_response)
            if insights:
                # Save insights to profile
                existing_insights = profile.key_insights or []
                all_insights = list(set(existing_insights + insights))
                await update_user_insights(db, user.id, all_insights[-5:])  # Keep last 5

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )


@router.delete("/history")
async def clear_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all conversation history for the current user."""
    await clear_user_conversations(db, user.id)
    return {"message": "History cleared"}
