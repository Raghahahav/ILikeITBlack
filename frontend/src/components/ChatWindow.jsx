import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Zap, ArrowRight } from 'lucide-react';

const SUGGESTIONS = [
  'Explain how transformers work',
  'Summarize my uploaded documents',
  'What are the latest AI trends?',
];

const ChatWindow = ({ messages, isStreaming, currentTool, onSuggestionClick }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {isEmpty ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center h-full px-6">
          <div className="max-w-md w-full text-center">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent/10 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-5 h-5 text-accent" />
            </div>

            <h2 className="text-xl font-semibold text-text-primary mb-2 tracking-tight">
              What can I help with?
            </h2>
            <p className="text-sm text-text-muted mb-10 leading-relaxed">
              Ask anything. I can search the web, analyze your documents, or just chat.
            </p>

            {/* Suggestions */}
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => onSuggestionClick?.(s)}
                  className="group flex items-center justify-between w-full px-4 py-3 rounded-xl
                             border border-border text-left text-sm text-text-secondary
                             hover:border-border-hover hover:bg-surface-2 transition-default"
                >
                  <span>{s}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-text-faint opacity-0 group-hover:opacity-100 transition-default" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Messages ── */
        <div className="max-w-3xl mx-auto px-5 py-6 space-y-1">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Tool indicator */}
          {currentTool && (
            <div className="flex items-center gap-2.5 py-3 px-1 animate-fade-in">
              <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span className="text-xs text-text-muted">
                {currentTool.name === 'web_search' && 'Searching the web…'}
                {currentTool.name === 'document_search' && 'Reading documents…'}
                {!['web_search', 'document_search'].includes(currentTool.name) &&
                  `Using ${currentTool.name}…`}
              </span>
            </div>
          )}
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
