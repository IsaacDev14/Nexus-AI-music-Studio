import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAVIGATION_PATHS } from '../utils/constants';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'm' || e.key === 'M') {
        navigate(NAVIGATION_PATHS['Metronome']);
      }
      if (e.key === 't' || e.key === 'T') {
        navigate(NAVIGATION_PATHS['Instrument Tuner']);
      }
      if (e.key === 'p' || e.key === 'P') {
        navigate(NAVIGATION_PATHS['Practice Log']);
      }
      if (e.key === 'h' || e.key === 'H') {
        navigate(NAVIGATION_PATHS['Dashboard']);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);
}
