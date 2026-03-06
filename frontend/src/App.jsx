import { useState, useCallback } from 'react';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import DocumentPanel from './components/DocumentPanel';
import SettingsPanel from './components/SettingsPanel';
import ToastContainer from './components/ToastContainer';
import { ToastProvider, useToast } from './hooks/useToast';
import { useChat } from './hooks/useChat';
import { useDocuments } from './hooks/useDocuments';
import { useHealth } from './hooks/useHealth';
import { clearSession } from './services/api';

const SESSION_ID = `session_${Date.now()}`;

const AppContent = () => {
  const [panel, setPanel] = useState(null); // 'docs' | 'settings' | null

  const { success, error: showError } = useToast();
  const { isConnected } = useHealth();

  const {
    messages,
    isStreaming,
    currentTool,
    sendMessage,
    clearMessages,
    stopStreaming,
  } = useChat(SESSION_ID);

  const {
    documents,
    isLoading: docsLoading,
    uploadProgress,
    upload,
    remove,
  } = useDocuments();

  const handleUpload = useCallback(async (file) => {
    try {
      const result = await upload(file);
      success(`${result.filename} processed — ${result.chunk_count} chunks`);
    } catch (err) {
      showError(err.message);
    }
  }, [upload, success, showError]);

  const handleDelete = useCallback(async (docId) => {
    try {
      await remove(docId);
      success('Document removed');
    } catch (err) {
      showError(err.message);
    }
  }, [remove, success, showError]);

  const handleClearChat = useCallback(async () => {
    clearMessages();
    try { await clearSession(SESSION_ID); } catch { /* ignore */ }
  }, [clearMessages]);

  const togglePanel = useCallback((name) => {
    setPanel(prev => prev === name ? null : name);
  }, []);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isConnected={isConnected}
          documentCount={documents.length}
          onSettingsClick={() => togglePanel('settings')}
          onDocumentsClick={() => togglePanel('docs')}
          onClearChat={handleClearChat}
        />

        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          currentTool={currentTool}
          onSuggestionClick={sendMessage}
        />

        <ChatInput
          onSend={sendMessage}
          isStreaming={isStreaming}
          onStop={stopStreaming}
        />
      </div>

      {/* Side panels */}
      <DocumentPanel
        documents={documents}
        isLoading={docsLoading}
        uploadProgress={uploadProgress}
        onUpload={handleUpload}
        onDelete={handleDelete}
        isOpen={panel === 'docs'}
        onClose={() => setPanel(null)}
      />

      <SettingsPanel
        isOpen={panel === 'settings'}
        onClose={() => setPanel(null)}
      />

      <ToastContainer />
    </div>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
