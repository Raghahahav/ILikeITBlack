"""
AI Chatbot Backend
FastAPI application with RAG, web search, and streaming chat capabilities.
"""

from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from config import settings
from routes import chat_router, documents_router, health_router

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for startup and shutdown."""
    # Startup
    print("🚀 AI Chatbot API starting...")
    print(f"📁 Vector store path: {settings.vector_store_path}")
    print(f"📁 Upload directory: {settings.upload_dir}")
    print(f"🤖 Default model: {settings.model_name}")
    print(f"🔗 CORS origins: {settings.cors_origins_list}")

    yield

    # Shutdown
    print("👋 AI Chatbot API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="AI Chatbot API",
    description="Production-ready AI chatbot with RAG and web search capabilities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(documents_router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info" if not settings.debug else "debug",
    )
