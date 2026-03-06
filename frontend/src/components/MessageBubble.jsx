import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const formatTime = (ts) => {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-border-subtle">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-surface-3 border-b border-border-subtle">
        <span className="text-2xs text-text-faint font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-2xs text-text-faint hover:text-text-secondary transition-default"
        >
          {copied ? (
            <><Check className="w-3 h-3 text-status-success" /> Copied</>
          ) : (
            <><Copy className="w-3 h-3" /> Copy</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#0f0f11',
          fontSize: '0.8125rem',
          padding: '1rem',
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const MessageBubble = memo(({ message }) => {
  const isUser = message.role === 'user';
  const isStreaming = message.isStreaming;

  if (isUser) {
    return (
      <div className="flex justify-end py-2 animate-fade-in">
        <div className="max-w-[75%] rounded-2xl rounded-br-md px-4 py-2.5 bg-accent/15 border border-accent/10">
          <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <p className="text-2xs text-text-faint mt-1.5 text-right">{formatTime(message.timestamp)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 animate-fade-in">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-6 h-6 rounded-md bg-accent-subtle border border-accent/10 flex items-center justify-center mt-0.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <CodeBlock language={match[1]}>
                      {String(children).replace(/\n$/, '')}
                    </CodeBlock>
                  ) : (
                    <code className={className} {...props}>{children}</code>
                  );
                },
              }}
            >
              {message.content || ''}
            </ReactMarkdown>
            {isStreaming && (
              <span className="inline-block w-[3px] h-4 ml-0.5 bg-accent rounded-full animate-blink align-text-bottom" />
            )}
          </div>

          <p className="text-2xs text-text-faint mt-1.5">{formatTime(message.timestamp)}</p>

          {message.error && (
            <p className="text-xs text-status-error mt-1">
              {message.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
export default MessageBubble;
