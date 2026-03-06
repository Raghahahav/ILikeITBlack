# Nova Frontend

Premium, minimalist React + Vite UI. Fast, responsive, beautiful.

## Features

- ⚡ **Minimal Design** - Dark zinc palette, violet accents, no glassmorphism
- 📱 **Responsive** - Works on mobile, tablet, desktop
- 💬 **Real-Time Streaming** - Messages appear token-by-token
- 📄 **Document Upload** - Drag-and-drop PDF/TXT files
- ⚙️ **Settings Panel** - Configure API key and model selection
- 🎨 **Tailwind CSS** - Custom design tokens for brand consistency

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast development and build
- \**Tailwind CSS*UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **React Markdown** - Markdown rendering with syntax highlighting
- **React Syntax Highlighter** - Code block styl

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Dev Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`
npm run dev

````

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
````

Built files will be in the `dist` folder.

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                  # Main app shell
│   ├── main.jsx                 # Vite entry point
│   ├── index.css                # Global styles (Tailwind + custom)
│   ├── components/
│   │   ├── Header.jsx           # Top bar with status
│   │   ├── ChatWindow.jsx       # Message list + empty state
│   │   ├── ChatInput.jsx        # Message input with send button
│   │   ├── MessageBubble.jsx    # User/AI message rendering
│   │   ├── DocumentPanel.jsx    # Slide-out document upload/list
│   │   ├── SettingsPanel.jsx    # API key & model selection
│   │   ├── ToastContainer.jsx   # Toast notifications
│   │   └── StatusBadge.jsx      # Connection status (inline in Header)
│   ├── hooks/
│   │   ├── useChat.js           # Chat state management & streaming
│   │   ├── useDocuments.js      # Document upload/delete
│   │   ├── useHealth.js         # Backend health polling
│   │   └── useToast.jsx         # Toast context provider
│   └── services/
│       └── api.js               # All backend API calls
├── tailwind.config.js           # Custom design tokens
├── index.html                   # HTML template
└── package.json                 # Dependencies
```

## Design System

### Colors

- **Surface**: `#09090b` (background) → `#27272a` (elevated)
- **Border**: `#27272a` (default) → `#3f3f46` (hover)
- **Text**: `#fafafa` (primary) → `#52525b` (faint)
- **Accent**: `#a78bfa` (violet, primary) → `#7c3aed` (dim)
- **Status**: Success `#4ade80`, Error `#f87171`, Warning `#fbbf24`

### Typography

- **Font**: Inter (system fallback)
- **Monospace**: JetBrains Mono / Fira Code
- **Animations**: 0.15s–0.25s ease-out (fade-in, slide-up, slide-right)
- **Status Badges** - Rounded pills with color-coded states

### Typography

- **Font Family** - Inter (sans-serif)
- **Code Font** - JetBrains Mono (monospace)

## Environment Variables

| Variable       | Description     | Default                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` |

## Features in Detail

### Chat Interface

- Full-height scrollable message area
- User messages aligned right (indigo gradient)
- AI messages aligned left (glass card)
- Streaming cursor animation during response
- Markdown rendering with code highlighting

### Document Panel

- Drag-and-drop upload zone
- Upload progress bar
- Document list with metadata
- Delete functionality
- RAG active indicator

### Settings Panel

- API key input (password field)
- Model selection dropdown
- Custom model ID input
- Popular models quick-select
- Settings stored in localStorage

### Status Indicators

- Connection status badge (green/red)
- RAG active badge with document count
- Tool usage indicators (searching web, reading documents)
- Toast notifications for user feedback

## Keyboard Shortcuts

| Shortcut        | Action              |
| --------------- | ------------------- |
| `Enter`         | Send message        |
| `Shift + Enter` | New line in message |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Running Linter

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## License

MIT
