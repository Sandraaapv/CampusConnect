// Lightweight client-side router utility
import { useState, useEffect } from 'react';

export const navigate = (to: string) => {
  if (window.location.pathname === to) return;
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

export const useCurrentPath = (): string => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return currentPath;
};
