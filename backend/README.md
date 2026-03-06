# Nova Backend

High-performance FastAPI backend optimized for speed. Features RAG pipeline, web search, and fast streaming responses.

## Features

- ⚡ **Dual-Path Agent** - Direct LLM streaming for simple queries, agent only when tools needed
- 📚 **RAG Pipeline** - Upload PDFs/TXT for context-aware responses
- 🔍 **Web Search** - DuckDuckGo integration
- 💬 **Fast Streaming** - Server-sent events with reduced latency
- 🧠 **Conversation Memory** - Session-based chat history
- 🔐 **Flexible API Keys** - Pass per-request or use environment variables

## Tech Stack

- **FastAPI** - Modern async Python web framework
- **LangChain** - LLM orchestration and tool management
- **OpenRouter** - LLM provider (Claude, GPT-4, etc.)
- **FAISS** - Vector storage for document embeddings
- **HuggingFace Embeddings** - Local, free embedding model
- **PyMuPDF** - PDF parsing

## Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env` and set your OpenRouter API key:

```env
OPENROUTER_API_KEY=your_key_here
MODEL_NAME=anthropic/claude-3-haiku
```

### 4. Run the Server

```bash
# Development mode with auto-reload
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check

```
GET /health
```

Returns server status, active tools, and document count.

### Chat

```
POST /chat
Content-Type: application/json

{
  "message": "Your question here",
  "session_id": "user-123"
}
```

Optional headers:

- `X-API-Key`: Override the default OpenRouter API key
- `X-Model-Name`: Override the default model (e.g., `anthropic/claude-3-opus`)

Returns a streaming response (Server-Sent Events).

### Upload Document

```
POST /documents/upload
Content-Type: multipart/form-data

file: <your-file.pdf or your-file.txt>
```

### List Documents

```
GET /documents
```

### Delete Document

```
DELETE /documents/{doc_id}
```

### Clear Session

```
DELETE /chat/session/{session_id}
```

## Project Structure

```
backend/
├── main.py              # FastAPI entry point with lifespan handler
├── config.py            # Pydantic settings from .env
├── routes.py            # API endpoints (/chat, /health, /documents)
├── agent.py             # Optimized dual-path agent (fast + agent paths)
├── tools.py             # Lazy-loaded tools (web search, RAG retriever)
├── rag.py               # RAG pipeline (PDF/TXT parsing, chunking, FAISS)
├── requirements.txt     # Python dependencies
├── .env                 # Configuration (needs OPENROUTER_API_KEY)
└── data/
    ├── uploads/         # Uploaded PDF/TXT files
    └── vector_store/    # FAISS vector store
```

## Performance Optimizations

- **Dual-Path Agent**: Simple queries bypass agent overhead and stream directly via LLM
- **Lazy Tool Loading**: Web search and RAG only initialize on first use
- **Reduced Token Limits**: `temperature=0.5`, `max_tokens=2048`, `max_iterations=3`
- **Memory Efficient**: Only keeps last 10 messages in context

## Environment Variables

| Variable             | Description                 | Default                                       |
| -------------------- | --------------------------- | --------------------------------------------- |
| `OPENROUTER_API_KEY` | Your OpenRouter API key     | Required                                      |
| `MODEL_NAME`         | Default LLM model           | `anthropic/claude-3-haiku`                    |
| `EMBEDDING_MODEL`    | HuggingFace embedding model | `sentence-transformers/all-MiniLM-L6-v2`      |
| `HOST`               | Server host                 | `0.0.0.0`                                     |
| `PORT`               | Server port                 | `8000`                                        |
| `DEBUG`              | Enable debug mode           | `false`                                       |
| `CORS_ORIGINS`       | Allowed CORS origins        | `http://localhost:5173,http://localhost:3000` |
| `VECTOR_STORE_PATH`  | Path to FAISS storage       | `./data/vector_store`                         |
| `UPLOAD_DIR`         | Temporary upload directory  | `./data/uploads`                              |
| `MEMORY_K`           | Conversation history length | `10`                                          |
| `CHUNK_SIZE`         | Document chunk size         | `1000`                                        |
| `CHUNK_OVERLAP`      | Chunk overlap               | `200`                                         |

## Supported Models (OpenRouter)

- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `anthropic/claude-3-haiku`
- `openai/gpt-4-turbo`
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `google/gemini-pro`
- `meta-llama/llama-3-70b-instruct`

See [OpenRouter Models](https://openrouter.ai/models) for the full list.

## Development

### Running Tests

```bash
pytest tests/
```

### API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## License

MIT
