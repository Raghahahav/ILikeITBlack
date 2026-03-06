"""
Configuration management for the AI Chatbot backend.
All settings are loaded from environment variables.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # OpenRouter Configuration
    openrouter_api_key: str = Field(default="", env="OPENROUTER_API_KEY")
    model_name: str = Field(default="anthropic/claude-3-haiku", env="MODEL_NAME")

    # Embedding Model
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2", env="EMBEDDING_MODEL"
    )

    # Server Configuration
    host: str = Field(default="0.0.0.0", env="HOST")
    port: int = Field(default=8000, env="PORT")
    debug: bool = Field(default=False, env="DEBUG")

    # CORS Origins
    cors_origins: str = Field(
        default="http://localhost:5173,http://localhost:3000", env="CORS_ORIGINS"
    )

    # Storage Paths
    vector_store_path: str = Field(
        default="./data/vector_store", env="VECTOR_STORE_PATH"
    )
    upload_dir: str = Field(default="./data/uploads", env="UPLOAD_DIR")

    # Agent Configuration
    memory_k: int = Field(default=10, env="MEMORY_K")
    chunk_size: int = Field(default=1000, env="CHUNK_SIZE")
    chunk_overlap: int = Field(default=200, env="CHUNK_OVERLAP")

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"
        protected_namespaces = ("settings_",)


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get the application settings."""
    return settings
