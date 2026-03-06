"""
LangChain Tools Module — lazy-loaded for speed.
"""

from typing import List, Optional
from langchain.tools import Tool

# Lazy singletons
_web_search = None
_rag_pipeline = None


def _get_web_search():
    global _web_search
    if _web_search is None:
        from langchain_community.tools import DuckDuckGoSearchRun

        _web_search = DuckDuckGoSearchRun()
    return _web_search


def _get_rag():
    global _rag_pipeline
    if _rag_pipeline is None:
        from rag import get_rag_pipeline

        _rag_pipeline = get_rag_pipeline()
    return _rag_pipeline


def _web_search_fn(query: str) -> str:
    try:
        return _get_web_search().run(query)
    except Exception as e:
        return f"Web search failed: {e}"


def get_available_tools() -> List[Tool]:
    """Get tools — only includes what's actually available."""
    tools = []

    # Web search
    tools.append(
        Tool(
            name="web_search",
            description="Search the web for current/real-time information. Input: search query.",
            func=_web_search_fn,
        )
    )

    # RAG retriever (only if documents exist)
    try:
        rag = _get_rag()
        rag_tool = rag.create_retriever_tool()
        if rag_tool is not None:
            tools.append(rag_tool)
    except Exception:
        pass

    return tools


def get_tool_names() -> List[str]:
    try:
        return [t.name for t in get_available_tools()]
    except Exception:
        return ["web_search"]


def has_rag_tool() -> bool:
    try:
        rag = _get_rag()
        return rag.has_documents()
    except Exception:
        return False
