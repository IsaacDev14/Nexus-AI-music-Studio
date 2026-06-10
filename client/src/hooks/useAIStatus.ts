import { useState, useEffect } from 'react';
import { api } from '../api/apiService';

export interface AIStatus {
  gemini_available: boolean;
  grok_available: boolean;
  status: 'online' | 'offline';
}

export function useAIStatus(pollIntervalMs = 60000) {
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const res = await api.get<AIStatus>('/ai/status');
        if (mounted) {
          setStatus(res.data);
          setError(null);
        }
      } catch {
        if (mounted) {
          setStatus({ gemini_available: false, grok_available: false, status: 'offline' });
          setError('Backend unreachable');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    check();
    const interval = setInterval(check, pollIntervalMs);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pollIntervalMs]);

  return { status, loading, error };
}
