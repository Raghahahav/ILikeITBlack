import { useState, useEffect } from 'react';
import { X, Key, Cpu, Check } from 'lucide-react';
import { getStoredSettings, saveSettings, POPULAR_MODELS } from '../services/api';
import clsx from 'clsx';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredSettings();
      setApiKey(stored.apiKey || '');
      setModelName(stored.modelName || '');
    }
  }, [isOpen]);

  const handleSave = () => {
    saveSettings({ apiKey, modelName });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 w-full max-w-sm z-50
                      bg-surface-1 border-l border-border-subtle flex flex-col animate-slide-right">
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-border-subtle flex-shrink-0">
          <span className="text-sm font-medium text-text-primary">Settings</span>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-surface-3 text-text-faint hover:text-text-secondary transition-default">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* API Key */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Key className="w-3.5 h-3.5 text-text-faint" />
              OpenRouter API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-sm
                         text-text-primary placeholder-text-faint focus:border-accent/40 transition-default"
            />
            <p className="text-2xs text-text-faint">
              Get a key at{' '}
              <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer"
                 className="text-accent hover:underline">openrouter.ai/keys</a>
            </p>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Cpu className="w-3.5 h-3.5 text-text-faint" />
              Model
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. anthropic/claude-3-haiku"
              className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-sm
                         text-text-primary placeholder-text-faint focus:border-accent/40 transition-default"
            />
          </div>

          {/* Quick Select */}
          <div className="space-y-2">
            <span className="text-xs font-medium text-text-secondary">Quick select</span>
            <div className="grid grid-cols-1 gap-1">
              {POPULAR_MODELS.slice(0, 8).map((model) => (
                <button
                  key={model.id}
                  onClick={() => setModelName(model.id)}
                  className={clsx(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-default text-xs',
                    modelName === model.id
                      ? 'bg-accent-subtle border border-accent/20 text-accent'
                      : 'border border-transparent hover:bg-surface-2 text-text-secondary'
                  )}
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-2xs text-text-faint">{model.provider}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className={clsx(
              'w-full py-2.5 rounded-lg text-sm font-medium transition-default flex items-center justify-center gap-1.5',
              saved
                ? 'bg-status-success/10 text-status-success border border-status-success/20'
                : 'bg-accent text-white hover:bg-accent-dim'
            )}
          >
            {saved ? <><Check className="w-4 h-4" /> Saved</> : 'Save settings'}
          </button>

          {/* Info */}
          <div className="rounded-lg border border-border-subtle p-4">
            <p className="text-2xs text-text-faint leading-relaxed">
              Settings are stored locally in your browser and sent with each request.
              If no API key is set, the server&apos;s default key will be used.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
