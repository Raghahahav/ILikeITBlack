import { useState, useEffect, useCallback } from 'react';
import { checkHealth } from '../services/api';

/**
 * Custom hook for health status monitoring
 */
export const useHealth = (interval = 30000) => {
  const [status, setStatus] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const check = useCallback(async () => {
    try {
      const health = await checkHealth();
      setStatus(health);
      setIsConnected(true);
      setError(null);
    } catch (err) {
      setIsConnected(false);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    check();
    const timer = setInterval(check, interval);
    return () => clearInterval(timer);
  }, [check, interval]);

  return {
    status,
    isConnected,
    error,
    refresh: check,
  };
};
