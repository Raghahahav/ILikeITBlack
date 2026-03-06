/**
 * API Service
 * Handles all communication with the backend API
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Get stored settings from localStorage
 */
export const getStoredSettings = () => {
  const settings = localStorage.getItem('chatbot_settings');
  if (settings) {
    try {
      return JSON.parse(settings);
    } catch {
      return {};
    }
  }
  return {};
};

/**
 * Save settings to localStorage
 */
export const saveSettings = (settings) => {
  localStorage.setItem('chatbot_settings', JSON.stringify(settings));
};

/**
 * Get default headers including optional API key and model
 */
const getHeaders = (customSettings = {}) => {
  const stored = getStoredSettings();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const apiKey = customSettings.apiKey || stored.apiKey;
  const modelName = customSettings.modelName || stored.modelName;
  
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  if (modelName) {
    headers['X-Model-Name'] = modelName;
  }
  
  return headers;
};

/**
 * Health check
 */
export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
};

/**
 * Send a chat message and receive streaming response
 * @param {string} message - The user's message
 * @param {string} sessionId - Session identifier
 * @param {function} onToken - Callback for each token received
 * @param {function} onToolStart - Callback when a tool starts
 * @param {function} onToolEnd - Callback when a tool ends
 * @param {function} onError - Callback for errors
 * @param {function} onDone - Callback when streaming is complete
 */
export const sendMessage = async (
  message,
  sessionId,
  { onToken, onToolStart, onToolEnd, onError, onDone }
) => {
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Chat request failed');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onDone?.();
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            
            switch (data.type) {
              case 'token':
                onToken?.(data.content);
                break;
              case 'tool_start':
                onToolStart?.(data.tool, data.input);
                break;
              case 'tool_end':
                onToolEnd?.(data.tool);
                break;
              case 'error':
                onError?.(data.content);
                break;
              case 'done':
                onDone?.();
                break;
            }
          } catch (parseError) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    onError?.(error.message);
  }
};

/**
 * Upload a document
 * @param {File} file - The file to upload
 * @param {function} onProgress - Progress callback (0-100)
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress?.(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.detail || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.open('POST', `${API_URL}/documents/upload`);
    xhr.send(formData);
  });
};

/**
 * Get list of uploaded documents
 */
export const getDocuments = async () => {
  const response = await fetch(`${API_URL}/documents`);
  if (!response.ok) {
    throw new Error('Failed to fetch documents');
  }
  return response.json();
};

/**
 * Delete a document
 * @param {string} docId - Document ID to delete
 */
export const deleteDocument = async (docId) => {
  const response = await fetch(`${API_URL}/documents/${docId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete document');
  }
  return response.json();
};

/**
 * Clear session history
 * @param {string} sessionId - Session ID to clear
 */
export const clearSession = async (sessionId) => {
  const response = await fetch(`${API_URL}/chat/session/${sessionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to clear session');
  }
  return response.json();
};

/**
 * Popular OpenRouter models
 */
export const POPULAR_MODELS = [
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
  { id: 'openai/gpt-4', name: 'GPT-4', provider: 'OpenAI' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', provider: 'Google' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'Google' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', provider: 'Meta' },
  { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', provider: 'Meta' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large', provider: 'Mistral' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'Mistral' },
];
