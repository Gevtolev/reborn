# -*- coding: utf-8 -*-
"""LangGraph-based coaching agent for Reborn."""

from typing import TypedDict, Annotated, AsyncGenerator
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage

from app.ai.client import get_chat_model
from app.ai.prompts import (
    AGENT_SYSTEM_PROMPT,
    build_user_context,
    extract_insights_from_response,
    clean_insight_markers,
)


class AgentState(TypedDict):
    """State for the coaching agent."""
    messages: Annotated[list[BaseMessage], add_messages]
    user_profile: dict
    extracted_insights: list[str]


def create_system_message(user_profile: dict) -> SystemMessage:
    """Create system message with user context."""
    user_context = build_user_context(user_profile)
    system_content = AGENT_SYSTEM_PROMPT.format(user_context=user_context)
    return SystemMessage(content=system_content)


async def coaching_node(state: AgentState) -> dict:
    """
    Main coaching node - generates AI response.
    """
    model = get_chat_model(streaming=False)

    # Build messages with system prompt
    system_msg = create_system_message(state.get("user_profile", {}))
    messages = [system_msg] + state["messages"]

    # Generate response
    response = await model.ainvoke(messages)

    # Extract insights from response
    insights = extract_insights_from_response(response.content)

    return {"messages": [response], "extracted_insights": insights}


def build_coaching_graph() -> StateGraph:
    """
    Build the LangGraph for coaching conversations.

    Simple graph for MVP:
    START -> coaching_node -> END
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("coach", coaching_node)

    # Set entry point
    graph.set_entry_point("coach")

    # Add edges
    graph.add_edge("coach", END)

    return graph.compile()


# Compiled graph instance
coaching_agent = build_coaching_graph()


async def chat_with_agent(
    messages: list[dict],
    user_profile: dict | None = None
) -> tuple[str, list[str]]:
    """
    Chat with the coaching agent (non-streaming).

    Args:
        messages: Conversation history as list of dicts
        user_profile: User's profile data

    Returns:
        Tuple of (response_text, extracted_insights)
    """
    # Convert messages to LangChain format
    lc_messages = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_messages.append(AIMessage(content=content))

    # Create initial state
    state = AgentState(
        messages=lc_messages,
        user_profile=user_profile or {},
        extracted_insights=[]
    )

    # Run the graph
    result = await coaching_agent.ainvoke(state)

    # Extract response
    if result["messages"]:
        last_message = result["messages"][-1]
        raw_response = last_message.content
        insights = result.get("extracted_insights", [])
        cleaned_response = clean_insight_markers(raw_response)
        return cleaned_response, insights

    return "", []


async def chat_stream_with_agent(
    messages: list[dict],
    user_profile: dict | None = None
) -> AsyncGenerator[str, None]:
    """
    Chat with the coaching agent (streaming).

    Args:
        messages: Conversation history as list of dicts
        user_profile: User's profile data

    Yields:
        Chunks of the agent's response (with insight markers cleaned)
    """
    model = get_chat_model(streaming=True)

    # Convert messages to LangChain format
    lc_messages = []
    for msg in messages:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            lc_messages.append(HumanMessage(content=content))
        elif role == "assistant":
            lc_messages.append(AIMessage(content=content))

    # Add system message
    system_msg = create_system_message(user_profile or {})
    full_messages = [system_msg] + lc_messages

    # Stream response
    buffer = ""
    async for chunk in model.astream(full_messages):
        if chunk.content:
            buffer += chunk.content
            # Stream cleaned content
            cleaned = clean_insight_markers(buffer)
            yield cleaned[len(clean_insight_markers(buffer[:len(buffer) - len(chunk.content)])):]
