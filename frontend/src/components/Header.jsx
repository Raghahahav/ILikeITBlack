import { Settings, FileText, Trash2 } from 'lucide-react';

const Header = ({ isConnected, documentCount, onSettingsClick, onDocumentsClick, onClearChat }) => {
  return (
    <header className="flex-shrink-0 h-14 border-b border-border-subtle flex items-center justify-between px-5">
      {/* Left — Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-accent-glow flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-text-primary tracking-tight">Nova</span>
        <div className="flex items-center gap-1.5 ml-3">
          <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-status-success' : 'bg-status-error'}`} />
          <span className="text-2xs text-text-muted">{isConnected ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onClearChat}
          className="p-2 rounded-md text-text-faint hover:text-text-secondary hover:bg-surface-3 transition-default"
          title="Clear chat"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDocumentsClick}
          className="relative p-2 rounded-md text-text-faint hover:text-text-secondary hover:bg-surface-3 transition-default"
          title="Documents"
        >
          <FileText className="w-4 h-4" />
          {documentCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-[10px] font-medium text-white flex items-center justify-center">
              {documentCount}
            </span>
          )}
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-md text-text-faint hover:text-text-secondary hover:bg-surface-3 transition-default"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
