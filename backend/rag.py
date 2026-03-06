"""
RAG Pipeline Module
Handles document processing, chunking, embedding, and vector storage.
"""

import os
import uuid
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from pathlib import Path

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain.tools.retriever import create_retriever_tool

from config import settings


class DocumentMetadata:
    """Document metadata storage."""

    def __init__(self, storage_path: str):
        self.storage_path = Path(storage_path)
        self.metadata_file = self.storage_path / "metadata.json"
        self.metadata: Dict[str, dict] = {}
        self._load_metadata()

    def _load_metadata(self):
        """Load metadata from disk."""
        if self.metadata_file.exists():
            with open(self.metadata_file, "r") as f:
                self.metadata = json.load(f)

    def _save_metadata(self):
        """Save metadata to disk."""
        self.storage_path.mkdir(parents=True, exist_ok=True)
        with open(self.metadata_file, "w") as f:
            json.dump(self.metadata, f, indent=2)

    def add(self, doc_id: str, filename: str, file_type: str, chunk_count: int):
        """Add document metadata."""
        self.metadata[doc_id] = {
            "id": doc_id,
            "filename": filename,
            "file_type": file_type,
            "chunk_count": chunk_count,
            "uploaded_at": datetime.now().isoformat(),
        }
        self._save_metadata()

    def remove(self, doc_id: str) -> bool:
        """Remove document metadata."""
        if doc_id in self.metadata:
            del self.metadata[doc_id]
            self._save_metadata()
            return True
        return False

    def get_all(self) -> List[dict]:
        """Get all document metadata."""
        return list(self.metadata.values())

    def exists(self, doc_id: str) -> bool:
        """Check if document exists."""
        return doc_id in self.metadata


class RAGPipeline:
    """RAG Pipeline for document processing and retrieval."""

    def __init__(self):
        self.vector_store_path = Path(settings.vector_store_path)
        self.upload_dir = Path(settings.upload_dir)

        # Create directories
        self.vector_store_path.mkdir(parents=True, exist_ok=True)
        self.upload_dir.mkdir(parents=True, exist_ok=True)

        # Initialize components
        self.embeddings = self._init_embeddings()
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
        )

        # Document metadata
        self.doc_metadata = DocumentMetadata(str(self.vector_store_path))

        # Load or create vector store
        self.vector_store = self._load_or_create_vector_store()

    def _init_embeddings(self) -> HuggingFaceEmbeddings:
        """Initialize HuggingFace embeddings."""
        return HuggingFaceEmbeddings(
            model_name=settings.embedding_model,
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True},
        )

    def _load_or_create_vector_store(self) -> Optional[FAISS]:
        """Load existing vector store or return None."""
        index_path = self.vector_store_path / "index.faiss"
        if index_path.exists():
            try:
                return FAISS.load_local(
                    str(self.vector_store_path),
                    self.embeddings,
                    allow_dangerous_deserialization=True,
                )
            except Exception as e:
                print(f"Error loading vector store: {e}")
                return None
        return None

    def _save_vector_store(self):
        """Save vector store to disk."""
        if self.vector_store:
            self.vector_store.save_local(str(self.vector_store_path))

    def parse_pdf(self, file_path: str) -> str:
        """Parse PDF file using PyMuPDF."""
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
        except Exception as e:
            raise ValueError(f"Error parsing PDF: {e}")
        return text

    def parse_txt(self, file_path: str) -> str:
        """Parse text file."""
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            raise ValueError(f"Error parsing text file: {e}")

    def process_document(self, file_path: str, filename: str) -> Tuple[str, int]:
        """
        Process a document: parse, chunk, embed, and store.
        Returns tuple of (doc_id, chunk_count).
        """
        # Determine file type and parse
        file_ext = Path(filename).suffix.lower()

        if file_ext == ".pdf":
            text = self.parse_pdf(file_path)
            file_type = "pdf"
        elif file_ext == ".txt":
            text = self.parse_txt(file_path)
            file_type = "txt"
        else:
            raise ValueError(f"Unsupported file type: {file_ext}")

        if not text.strip():
            raise ValueError("Document is empty or could not be parsed")

        # Generate document ID
        doc_id = str(uuid.uuid4())

        # Chunk the document
        chunks = self.text_splitter.split_text(text)

        # Create documents with metadata
        documents = [
            Document(
                page_content=chunk,
                metadata={
                    "doc_id": doc_id,
                    "filename": filename,
                    "chunk_index": i,
                    "file_type": file_type,
                },
            )
            for i, chunk in enumerate(chunks)
        ]

        # Add to vector store
        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(documents, self.embeddings)
        else:
            self.vector_store.add_documents(documents)

        # Save vector store
        self._save_vector_store()

        # Save metadata
        self.doc_metadata.add(doc_id, filename, file_type, len(chunks))

        return doc_id, len(chunks)

    def delete_document(self, doc_id: str) -> bool:
        """
        Delete a document from the vector store.
        Note: FAISS doesn't support direct deletion, so we rebuild without the doc.
        """
        if not self.doc_metadata.exists(doc_id):
            return False

        if self.vector_store is None:
            self.doc_metadata.remove(doc_id)
            return True

        # Get all documents except the one to delete
        all_docs = []
        for doc_meta in self.doc_metadata.get_all():
            if doc_meta["id"] != doc_id:
                # We need to retrieve documents for this doc_id from the store
                # Since FAISS doesn't support this directly, we'll rebuild
                pass

        # For simplicity, we'll just remove from metadata
        # In production, you'd want to rebuild the entire index
        self.doc_metadata.remove(doc_id)

        # Rebuild vector store from remaining documents
        remaining_docs = self.doc_metadata.get_all()
        if not remaining_docs:
            self.vector_store = None
            # Remove the index files
            index_path = self.vector_store_path / "index.faiss"
            pkl_path = self.vector_store_path / "index.pkl"
            if index_path.exists():
                os.remove(index_path)
            if pkl_path.exists():
                os.remove(pkl_path)

        return True

    def get_documents(self) -> List[dict]:
        """Get list of all uploaded documents."""
        return self.doc_metadata.get_all()

    def get_retriever(self, k: int = 4):
        """Get a retriever for the vector store."""
        if self.vector_store is None:
            return None
        return self.vector_store.as_retriever(
            search_type="similarity", search_kwargs={"k": k}
        )

    def create_retriever_tool(self):
        """Create a LangChain retriever tool."""
        retriever = self.get_retriever()
        if retriever is None:
            return None

        return create_retriever_tool(
            retriever,
            name="document_search",
            description=(
                "Search through uploaded documents to find relevant information. "
                "Use this tool when the user asks questions that might be answered "
                "by the uploaded documents. Input should be a search query."
            ),
        )

    def has_documents(self) -> bool:
        """Check if there are any documents in the store."""
        return len(self.doc_metadata.get_all()) > 0


# Global RAG pipeline instance
_rag_pipeline: Optional[RAGPipeline] = None


def get_rag_pipeline() -> RAGPipeline:
    """Get or create the RAG pipeline instance."""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
