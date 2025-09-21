import { createContext, useContext, useEffect, useState } from 'react';

type DashboardTheme = 'light' | 'dark' | 'cobalt-blue' | 'gradient' | 'muted';

type DashboardThemeProviderProps = {
  children: React.ReactNode;
  theme: DashboardTheme;
  className?: string;
};

type DashboardThemeProviderState = {
  theme: DashboardTheme;
  setTheme: (theme: DashboardTheme) => void;
};

const initialState: DashboardThemeProviderState = {
  theme: 'cobalt-blue',
  setTheme: () => null,
};

const DashboardThemeProviderContext = createContext<DashboardThemeProviderState>(initialState);

export function DashboardThemeProvider({
  children,
  theme,
  className = '',
  ...props
}: DashboardThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<DashboardTheme>(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const value = {
    theme: currentTheme,
    setTheme: setCurrentTheme,
  };

  // Get theme classes based on the current theme
  const getThemeClasses = (theme: DashboardTheme) => {
    switch (theme) {
      case 'light':
        return 'dashboard-theme-light';
      case 'dark':
        return 'dashboard-theme-dark';
      case 'gradient':
        return 'dashboard-theme-gradient';
      case 'muted':
        return 'dashboard-theme-muted';
      case 'cobalt-blue':
      default:
        return 'dashboard-theme-cobalt-blue';
    }
  };

  return (
    <DashboardThemeProviderContext.Provider {...props} value={value}>
      <div className={`${getThemeClasses(currentTheme)} ${className}`}>
        {children}
      </div>
    </DashboardThemeProviderContext.Provider>
  );
}

export const useDashboardTheme = () => {
  const context = useContext(DashboardThemeProviderContext);

  if (context === undefined)
    throw new Error('useDashboardTheme must be used within a DashboardThemeProvider');

  return context;
};
