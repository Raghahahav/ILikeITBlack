"""
LangChain Agent Module — Optimized for speed.
Uses direct LLM streaming for simple queries, agent only when tools are needed.
"""

import asyncio
from typing import AsyncGenerator, Dict, Optional, List, Any
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.callbacks.base import BaseCallbackHandler
from langchain.schema import AgentFinish, LLMResult, HumanMessage, SystemMessage

from config import settings


# Session memory store
session_memories: Dict[str, ConversationBufferWindowMemory] = {}

SYSTEM_PROMPT = """You are a helpful, concise AI assistant. Respond clearly and use markdown formatting when appropriate. Be direct — start answering immediately without restating the question."""

AGENT_SYSTEM_PROMPT = """You are a helpful AI assistant with access to tools.

Rules:
- Use document_search FIRST when documents are uploaded and the question is relevant to them.
- Use web_search only for real-time/current information or when documents don't have the answer.
- Briefly mention your source (e.g. "From your documents..." or "Based on web search...").
- Be concise. Use markdown.

Documents uploaded: {has_documents}
Tools: {tool_names}"""


class StreamingCallback(BaseCallbackHandler):
    """Lightweight streaming callback with asyncio queue."""

    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()
        self._tools: List[str] = []
        self.done = False

    async def on_llm_new_token(self, token: str, **kwargs):
        await self.queue.put(("token", token))

    async def on_tool_start(self, serialized: Dict[str, Any], input_str: str, **kwargs):
        name = serialized.get("name", "tool")
        self._tools.append(name)
        await self.queue.put(("tool_start", name))

    async def on_tool_end(self, output: str, **kwargs):
        name = self._tools.pop() if self._tools else "tool"
        await self.queue.put(("tool_end", name))

    async def on_agent_finish(self, finish: AgentFinish, **kwargs):
        self.done = True
        await self.queue.put(("done", ""))

    async def on_llm_error(self, error: Exception, **kwargs):
        await self.queue.put(("error", str(error)))
        self.done = True


def get_memory(session_id: str) -> ConversationBufferWindowMemory:
    if session_id not in session_memories:
        session_memories[session_id] = ConversationBufferWindowMemory(
            k=settings.memory_k, memory_key="chat_history", return_messages=True
        )
    return session_memories[session_id]


def _needs_tools(message: str) -> bool:
    """Quick heuristic: does this message likely need tools?"""
    msg = message.lower()
    triggers = [
        "document",
        "file",
        "uploaded",
        "pdf",
        "attachment",
        "paper",
        "report",
        "summarize my",
        "from my",
        "in my",
        "latest",
        "current",
        "today",
        "news",
        "recent",
        "weather",
        "price",
        "stock",
        "search the web",
        "look up",
        "find online",
    ]
    return any(w in msg for w in triggers)


async def stream_agent_response(
    message: str,
    session_id: str = "default",
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
) -> AsyncGenerator[Dict[str, Any], None]:
    """Stream response — fast LLM path or agent path based on context."""

    # Lazy import to avoid circular + speed up non-tool requests
    from tools import get_available_tools, has_rag_tool

    has_docs = has_rag_tool()
    use_agent = has_docs or _needs_tools(message)
    tools = get_available_tools() if use_agent else []

    key = api_key or settings.openrouter_api_key
    model = model_name or settings.model_name

    if tools:
        # ── AGENT PATH (tools available) ──
        cb = StreamingCallback()

        llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=key,
            model=model,
            streaming=True,
            temperature=0.5,
            max_tokens=2048,
            callbacks=[cb],
        )

        tool_names = [t.name for t in tools]
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    AGENT_SYSTEM_PROMPT.format(
                        has_documents="Yes" if has_docs else "No",
                        tool_names=", ".join(tool_names),
                    ),
                ),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad"),
            ]
        )

        agent = create_openai_tools_agent(llm, tools, prompt)
        memory = get_memory(session_id)
        executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=memory,
            verbose=False,
            handle_parsing_errors=True,
            max_iterations=3,
        )

        async def _run():
            try:
                await executor.ainvoke({"input": message}, config={"callbacks": [cb]})
            except Exception as e:
                await cb.queue.put(("error", str(e)))
            finally:
                cb.done = True
                await cb.queue.put(("done", ""))

        task = asyncio.create_task(_run())
        try:
            while not cb.done:
                try:
                    kind, data = await asyncio.wait_for(cb.queue.get(), timeout=0.05)
                    if kind == "token":
                        yield {"type": "token", "content": data}
                    elif kind == "tool_start":
                        yield {"type": "tool_start", "tool": data}
                    elif kind == "tool_end":
                        yield {"type": "tool_end", "tool": data}
                    elif kind == "error":
                        yield {"type": "error", "content": data}
                    elif kind == "done":
                        break
                except asyncio.TimeoutError:
                    continue
        finally:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

    else:
        # ── FAST PATH (direct LLM, no agent overhead) ──
        llm = ChatOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=key,
            model=model,
            streaming=True,
            temperature=0.5,
            max_tokens=2048,
        )

        memory = get_memory(session_id)
        history = memory.load_memory_variables({}).get("chat_history", [])

        msgs = (
            [SystemMessage(content=SYSTEM_PROMPT)]
            + list(history)
            + [HumanMessage(content=message)]
        )

        full = ""
        try:
            async for chunk in llm.astream(msgs):
                if chunk.content:
                    full += chunk.content
                    yield {"type": "token", "content": chunk.content}
        except Exception as e:
            yield {"type": "error", "content": str(e)}

        memory.save_context({"input": message}, {"output": full})

    yield {"type": "done"}


def clear_session_memory(session_id: str) -> bool:
    if session_id in session_memories:
        del session_memories[session_id]
        return True
    return False
