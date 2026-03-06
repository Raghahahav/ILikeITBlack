import { useState, useCallback, useRef } from 'react';
import { sendMessage as apiSendMessage } from '../services/api';

/**
 * Custom hook for managing chat state and streaming
 */
export const useChat = (sessionId = 'default') => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentTool, setCurrentTool] = useState(null);
  const [error, setError] = useState(null);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    abortRef.current = false;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add placeholder for assistant message
    const assistantMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    let accumulatedContent = '';

    await apiSendMessage(content, sessionId, {
      onToken: (token) => {
        if (abortRef.current) return;
        accumulatedContent += token;
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: accumulatedContent,
          };
          return updated;
        });
      },
      onToolStart: (tool, input) => {
        if (abortRef.current) return;
        setCurrentTool({ name: tool, input, status: 'running' });
      },
      onToolEnd: (tool) => {
        if (abortRef.current) return;
        setCurrentTool(null);
      },
      onError: (errorMsg) => {
        setError(errorMsg);
        setIsStreaming(false);
        setCurrentTool(null);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]?.role === 'assistant' && !updated[lastIdx].content) {
            updated.pop();
          } else if (updated[lastIdx]) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              isStreaming: false,
              error: errorMsg,
            };
          }
          return updated;
        });
      },
      onDone: () => {
        setIsStreaming(false);
        setCurrentTool(null);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (updated[lastIdx]) {
            updated[lastIdx] = {
              ...updated[lastIdx],
              isStreaming: false,
            };
          }
          return updated;
        });
      },
    });
  }, [sessionId, isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setCurrentTool(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    setIsStreaming(false);
    setCurrentTool(null);
    setMessages((prev) => {
      const updated = [...prev];
      const lastIdx = updated.length - 1;
      if (updated[lastIdx]) {
        updated[lastIdx] = {
          ...updated[lastIdx],
          isStreaming: false,
        };
      }
      return updated;
    });
  }, []);

  return {
    messages,
    isStreaming,
    currentTool,
    error,
    sendMessage,
    clearMessages,
    stopStreaming,
  };
};
