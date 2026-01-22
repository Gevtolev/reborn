"""LangChain LLM client configuration for Tongyi (通义千问)."""

from langchain_community.chat_models import ChatTongyi
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.core.config import settings


def get_chat_model(
    model: str = "qwen-plus",
    streaming: bool = True,
    temperature: float = 0.7
) -> ChatTongyi:
    """
    Get a configured ChatTongyi model instance.

    Args:
        model: Model name (qwen-turbo, qwen-plus, qwen-max)
        streaming: Whether to enable streaming
        temperature: Temperature for generation

    Returns:
        Configured ChatTongyi instance
    """
    return ChatTongyi(
        model=model,
        dashscope_api_key=settings.DASHSCOPE_API_KEY,
        streaming=streaming,
        temperature=temperature,
    )


def convert_messages(messages: list[dict]) -> list:
    """
    Convert dict messages to LangChain message objects.

    Args:
        messages: List of {"role": "user"|"assistant"|"system", "content": "..."}

    Returns:
        List of LangChain message objects
    """
    result = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")

        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
        elif role == "system":
            result.append(SystemMessage(content=content))

    return result
