import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import clsx from 'clsx';

const ChatInput = ({ onSend, isStreaming, onStop }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
    }
  }, [message]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim() && !isStreaming) {
      onSend(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !isStreaming;

  return (
    <div className="flex-shrink-0 border-t border-border-subtle bg-surface">
      <div className="max-w-3xl mx-auto px-5 py-4">
        <div className="relative flex items-end rounded-xl border border-border bg-surface-2 focus-within:border-accent/40 transition-default">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Nova…"
            rows={1}
            className={clsx(
              'flex-1 bg-transparent border-none resize-none',
              'text-sm text-text-primary placeholder-text-faint',
              'px-4 py-3.5 pr-12',
              'max-h-[180px] focus:outline-none'
            )}
            disabled={isStreaming}
          />

          <div className="absolute right-2 bottom-2">
            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                className="w-8 h-8 rounded-lg bg-status-error/15 text-status-error
                           flex items-center justify-center hover:bg-status-error/25 transition-default"
                title="Stop"
              >
                <Square className="w-3.5 h-3.5" fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSend}
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-default',
                  canSend
                    ? 'bg-accent text-white hover:bg-accent-dim'
                    : 'bg-surface-3 text-text-faint cursor-not-allowed'
                )}
                title="Send"
              >
                <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        <p className="text-2xs text-text-faint mt-2 text-center">
          Nova can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
