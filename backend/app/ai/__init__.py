from app.ai.client import get_chat_model, convert_messages
from app.ai.agent import (
    coaching_agent,
    chat_with_agent,
    chat_stream_with_agent,
    AgentState
)
from app.ai.prompts import (
    AGENT_SYSTEM_PROMPT,
    FIRST_MESSAGE_PROMPT,
    build_user_context
)

__all__ = [
    # Client
    "get_chat_model",
    "convert_messages",
    # Agent
    "coaching_agent",
    "chat_with_agent",
    "chat_stream_with_agent",
    "AgentState",
    # Prompts
    "AGENT_SYSTEM_PROMPT",
    "FIRST_MESSAGE_PROMPT",
    "build_user_context",
]
