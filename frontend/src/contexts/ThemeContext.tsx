import React, { createContext, useContext, useEffect } from 'react';

// Simplified ThemeContext for light mode only
interface ThemeContextType {
  theme: 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always use light theme
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    // Clean up any old theme preferences from localStorage
    localStorage.removeItem('paa-theme');
  }, []);

  const value: ThemeContextType = {
    theme: 'light',
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}