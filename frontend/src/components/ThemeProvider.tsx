'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

// ============================================================
// Theme Context
// ============================================================
type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: 'light', toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    applyTheme(next);
  };

  // Avoid hydration mismatch
  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);


// ============================================================
// Dark Mode Toggle Button
// ============================================================
export function DarkModeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all
        hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${className}`}
      title={theme === 'dark' ? 'Chuyển sang sáng' : 'Chuyển sang tối'}
    >
      <Sun
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'
        }`}
      />
      <Moon
        size={16}
        className={`absolute transition-all duration-300 ${
          theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  );
}
