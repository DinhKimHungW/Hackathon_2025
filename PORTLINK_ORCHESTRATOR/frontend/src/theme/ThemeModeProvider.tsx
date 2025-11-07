import React, { createContext, useContext, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { createAppTheme } from './theme';

interface ThemeModeContextType {
  mode: PaletteMode;
  setMode: (mode: PaletteMode) => void;
  toggleTheme: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};

interface ThemeModeProviderProps {
  children: React.ReactNode;
}

export const ThemeModeProvider: React.FC<ThemeModeProviderProps> = ({ children }) => {
  // Get initial theme from localStorage or default to 'light'
  const getInitialMode = (): PaletteMode => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode === 'dark' ? 'dark' : 'light') as PaletteMode;
  };

  const [mode, setModeState] = useState<PaletteMode>(getInitialMode);

  const setMode = (newMode: PaletteMode) => {
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const toggleTheme = () => {
    setModeState((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, setMode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default ThemeModeProvider;
