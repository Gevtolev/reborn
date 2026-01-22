from typing import AsyncGenerator
import dashscope
from dashscope import Generation
from app.core.config import settings

dashscope.api_key = settings.DASHSCOPE_API_KEY


async def chat_stream(
    messages: list[dict],
    system_prompt: str = ""
) -> AsyncGenerator[str, None]:
    """
    Stream chat completion from Qwen model.

    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."}
        system_prompt: System prompt to prepend
    """
    full_messages = []

    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})

    full_messages.extend(messages)

    responses = Generation.call(
        model="qwen-turbo",
        messages=full_messages,
        result_format="message",
        stream=True,
        incremental_output=True
    )

    for response in responses:
        if response.status_code == 200:
            content = response.output.choices[0].message.content
            if content:
                yield content
        else:
            raise Exception(f"AI Error: {response.code} - {response.message}")


async def chat(messages: list[dict], system_prompt: str = "") -> str:
    """Non-streaming chat completion."""
    result = []
    async for chunk in chat_stream(messages, system_prompt):
        result.append(chunk)
    return "".join(result)
