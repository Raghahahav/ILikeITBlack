"""
API Routes Module
Defines all FastAPI endpoints for the chatbot application.
"""

import os
import json
import shutil
import uuid
from typing import Optional
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File, Header, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from config import settings
from rag import get_rag_pipeline
from agent import stream_agent_response, clear_session_memory
from tools import has_rag_tool, get_tool_names


# Create routers
chat_router = APIRouter(prefix="/chat", tags=["Chat"])
documents_router = APIRouter(prefix="/documents", tags=["Documents"])
health_router = APIRouter(tags=["Health"])


# Request/Response Models
class ChatRequest(BaseModel):
    """Chat request model."""

    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    """Chat response model."""

    response: str
    session_id: str
    tools_used: list = []


class DocumentResponse(BaseModel):
    """Document response model."""

    id: str
    filename: str
    file_type: str
    chunk_count: int
    uploaded_at: str


class UploadResponse(BaseModel):
    """Upload response model."""

    success: bool
    doc_id: str
    filename: str
    chunk_count: int
    message: str


class DeleteResponse(BaseModel):
    """Delete response model."""

    success: bool
    message: str


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    rag_active: bool
    document_count: int
    available_tools: list


# Chat Endpoints
@chat_router.post("")
async def chat(
    request: ChatRequest,
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    x_model_name: Optional[str] = Header(None, alias="X-Model-Name"),
):
    """
    Chat endpoint with streaming response.
    Accepts optional API key and model name via headers.
    """

    # Use provided credentials or fall back to env
    api_key = x_api_key or settings.openrouter_api_key
    model_name = x_model_name or settings.model_name

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="API key required. Set OPENROUTER_API_KEY in .env or pass X-API-Key header.",
        )

    async def generate():
        """Generate streaming response."""
        try:
            async for item in stream_agent_response(
                message=request.message,
                session_id=request.session_id,
                api_key=api_key,
                model_name=model_name,
            ):
                # Send as Server-Sent Events format
                yield f"data: {json.dumps(item)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"
        finally:
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@chat_router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear chat history for a session."""
    success = clear_session_memory(session_id)
    return {
        "success": success,
        "message": f"Session {session_id} cleared" if success else "Session not found",
    }


# Document Endpoints
@documents_router.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (.pdf or .txt) for RAG processing.
    """
    # Validate file type
    filename = file.filename or "unknown"
    file_ext = Path(filename).suffix.lower()

    if file_ext not in [".pdf", ".txt"]:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file_ext}. Only .pdf and .txt files are allowed.",
        )

    # Save file temporarily
    rag_pipeline = get_rag_pipeline()
    temp_path = rag_pipeline.upload_dir / f"{uuid.uuid4()}{file_ext}"

    try:
        # Write file to disk
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process document
        doc_id, chunk_count = rag_pipeline.process_document(str(temp_path), filename)

        return UploadResponse(
            success=True,
            doc_id=doc_id,
            filename=filename,
            chunk_count=chunk_count,
            message=f"Document '{filename}' uploaded and processed successfully.",
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    finally:
        # Clean up temp file
        if temp_path.exists():
            os.remove(temp_path)


@documents_router.get("", response_model=list[DocumentResponse])
async def list_documents():
    """List all uploaded documents."""
    rag_pipeline = get_rag_pipeline()
    documents = rag_pipeline.get_documents()

    return [
        DocumentResponse(
            id=doc["id"],
            filename=doc["filename"],
            file_type=doc["file_type"],
            chunk_count=doc["chunk_count"],
            uploaded_at=doc["uploaded_at"],
        )
        for doc in documents
    ]


@documents_router.delete("/{doc_id}", response_model=DeleteResponse)
async def delete_document(doc_id: str):
    """Delete a document from the vector store."""
    rag_pipeline = get_rag_pipeline()

    success = rag_pipeline.delete_document(doc_id)

    if not success:
        raise HTTPException(status_code=404, detail="Document not found")

    return DeleteResponse(
        success=True, message=f"Document {doc_id} deleted successfully."
    )


# Health Endpoints
@health_router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        rag_pipeline = get_rag_pipeline()
        documents = rag_pipeline.get_documents()
        rag_active = has_rag_tool()
        available_tools = get_tool_names()
        status = "healthy"
        document_count = len(documents)
    except Exception:
        # Keep health endpoint available even if optional components fail to initialize
        status = "degraded"
        rag_active = False
        document_count = 0
        available_tools = ["web_search"]

    return HealthResponse(
        status=status,
        rag_active=rag_active,
        document_count=document_count,
        available_tools=available_tools,
    )


@health_router.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "AI Chatbot API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
