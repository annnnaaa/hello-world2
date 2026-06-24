import { useEffect, type ReactNode } from 'react';
import { useUIStore } from '../../store/uiStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(resolved: 'dark' | 'light') {
      root.classList.remove('dark', 'light');
      root.classList.add(resolved);
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');

      function handleChange(e: MediaQueryListEvent | MediaQueryList) {
        applyTheme(e.matches ? 'dark' : 'light');
      }

      // Apply immediately
      handleChange(mq);

      // Listen for OS-level changes
      mq.addEventListener('change', handleChange as (e: MediaQueryListEvent) => void);
      return () => {
        mq.removeEventListener('change', handleChange as (e: MediaQueryListEvent) => void);
      };
    }

    applyTheme(theme);
  }, [theme]);

  return <>{children}</>;
}
