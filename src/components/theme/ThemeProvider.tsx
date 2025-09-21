import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'cobalt-blue' | 'gradient' | 'muted';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'cobalt-blue',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'cobalt-blue',
  storageKey = 'sdx-portal-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark', 'cobalt-blue', 'gradient', 'muted');

    // Add the current theme class
    if (theme === 'cobalt-blue') {
      // cobalt-blue is the default theme, no class needed
      root.classList.add('light');
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};

export const themes: { id: Theme; name: string; description: string; colors: string[] }[] = [
  {
    id: 'cobalt-blue',
    name: 'Cobalt Blue',
    description: 'Professional blue theme',
    colors: ['hsl(217, 91%, 60%)', 'hsl(217, 91%, 50%)', 'hsl(217, 91%, 70%)']
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean light theme',
    colors: ['hsl(0, 0%, 100%)', 'hsl(220, 13%, 91%)', 'hsl(220, 14%, 96%)']
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Elegant dark theme',
    colors: ['hsl(222, 84%, 5%)', 'hsl(217, 33%, 17%)', 'hsl(215, 20%, 65%)']
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradient theme',
    colors: ['hsl(271, 81%, 56%)', 'hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)']
  },
  {
    id: 'muted',
    name: 'Muted',
    description: 'Subtle muted theme',
    colors: ['hsl(210, 9%, 31%)', 'hsl(210, 11%, 96%)', 'hsl(210, 6%, 46%)']
  }
];
