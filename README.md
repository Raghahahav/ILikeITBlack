# ILikeITBlack

Fast, minimal AI chatbot with RAG and web search. Built with FastAPI + React + Vite.

![ILikeITBlack](https://img.shields.io/badge/Nova-AI%20Chat-a78bfa?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=flat-square&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## Features

⚡ **Optimized Performance**
- Dual-path agent (fast LLM streaming for simple queries, agent only when tools needed)
- Lazy-loaded tools (web search and RAG)
- Reduced token limits and iterations

🎨 **Premium Design**
- Minimal dark zinc palette with violet accents
- Responsive layout (mobile, tablet, desktop)
- Real-time streaming messages
- Smooth animations

📚 **RAG Pipeline**
- Upload PDF and TXT documents
- FAISS vector storage with HuggingFace embeddings
- Document chunking with overlap
- Context-aware responses

🔍 **Web Search**
- DuckDuckGo integration
- Real-time information retrieval
- Smart tool selection

## Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/ILikeITBlack.git
cd ILikeITBlack
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start server
python main.py
```

Backend runs on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Project Structure

```
ILikeITBlack/
├── backend/              # FastAPI backend
│   ├── agent.py         # Dual-path agent (fast + agent modes)
│   ├── tools.py         # Lazy-loaded tools (web search, RAG)
│   ├── rag.py           # RAG pipeline (PDF/TXT parsing, FAISS)
│   ├── routes.py        # API endpoints
│   ├── main.py          # FastAPI app
│   └── config.py        # Environment config
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   ├── components/  # UI components (Header, Chat, Input, etc.)
│   │   ├── hooks/       # React hooks (useChat, useDocuments, etc.)
│   │   └── services/    # API client
│   └── tailwind.config.js
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| POST | `/chat` | Send message (streaming SSE) |
| POST | `/documents/upload` | Upload PDF/TXT |
| GET | `/documents` | List documents |
| DELETE | `/documents/{id}` | Delete document |
| DELETE | `/chat/session/{id}` | Clear session |

## Configuration

### Backend (.env)

```env
OPENROUTER_API_KEY=sk-or-v1-...
MODEL_NAME=anthropic/claude-3-haiku
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

### Frontend

Settings can be configured in the UI (⚙️ button):
- OpenRouter API key (overrides backend default)
- Model selection (Claude, GPT-4, Gemini, etc.)

## Tech Stack

**Backend**
- FastAPI - Async web framework
- LangChain - LLM orchestration
- OpenRouter - Multi-model LLM API
- FAISS - Vector search
- HuggingFace - Embeddings
- PyMuPDF - PDF parsing

**Frontend**
- React 18 - UI library
- Vite - Build tool
- Tailwind CSS - Styling
- React Markdown - Markdown rendering
- Lucide React - Icons

## Performance

- **Fast Path**: Simple queries stream directly via LLM (no agent overhead)
- **Agent Path**: Only activates when tools are needed
- **Optimizations**: `temperature=0.5`, `max_tokens=2048`, `max_iterations=3`
- **Bundle Size**: ~975 KB (before gzip)

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

- 📖 [Documentation](./backend/README.md)
- 🐛 [Report Bug](https://github.com/YOUR_USERNAME/nova/issues)
- 💡 [Request Feature](https://github.com/YOUR_USERNAME/nova/issues)
