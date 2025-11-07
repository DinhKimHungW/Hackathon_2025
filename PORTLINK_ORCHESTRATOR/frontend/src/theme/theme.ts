import { createTheme } from '@mui/material/styles';
import type { ThemeOptions, PaletteMode } from '@mui/material/styles';
import { red, blue, green, orange } from '@mui/material/colors';

// Brand colors
const BRAND_PRIMARY = '#1976d2'; // Blue
const BRAND_SECONDARY = '#dc004e'; // Pink/Red
const BRAND_SUCCESS = '#2e7d32'; // Green
const BRAND_WARNING = '#ed6c02'; // Orange
const BRAND_ERROR = '#d32f2f'; // Red
const BRAND_INFO = '#0288d1'; // Light Blue

// Custom breakpoints
const breakpoints = {
  values: {
    xs: 0, // Mobile
    sm: 600, // Tablet portrait
    md: 960, // Tablet landscape
    lg: 1280, // Desktop
    xl: 1920, // Large desktop
  },
};

// Typography configuration
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Apple Color Emoji"',
    '"Segoe UI Emoji"',
    '"Segoe UI Symbol"',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.6,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none' as const, // Disable uppercase buttons
    fontWeight: 500,
  },
};

// Light mode palette
const lightPalette = {
  mode: 'light' as PaletteMode,
  primary: {
    main: BRAND_PRIMARY,
    light: blue[300],
    dark: blue[700],
    contrastText: '#fff',
  },
  secondary: {
    main: BRAND_SECONDARY,
    light: red[300],
    dark: red[700],
    contrastText: '#fff',
  },
  success: {
    main: BRAND_SUCCESS,
    light: green[300],
    dark: green[700],
    contrastText: '#fff',
  },
  warning: {
    main: BRAND_WARNING,
    light: orange[300],
    dark: orange[700],
    contrastText: '#fff',
  },
  error: {
    main: BRAND_ERROR,
    light: red[300],
    dark: red[700],
    contrastText: '#fff',
  },
  info: {
    main: BRAND_INFO,
    light: blue[200],
    dark: blue[800],
    contrastText: '#fff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  divider: 'rgba(0, 0, 0, 0.12)',
};

// Dark mode palette
const darkPalette = {
  mode: 'dark' as PaletteMode,
  primary: {
    main: blue[400],
    light: blue[300],
    dark: blue[700],
    contrastText: '#fff',
  },
  secondary: {
    main: red[400],
    light: red[300],
    dark: red[700],
    contrastText: '#fff',
  },
  success: {
    main: green[400],
    light: green[300],
    dark: green[700],
    contrastText: '#000',
  },
  warning: {
    main: orange[400],
    light: orange[300],
    dark: orange[700],
    contrastText: '#000',
  },
  error: {
    main: red[400],
    light: red[300],
    dark: red[700],
    contrastText: '#fff',
  },
  info: {
    main: blue[300],
    light: blue[200],
    dark: blue[800],
    contrastText: '#000',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#fff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

// Component overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '8px 16px',
        minHeight: 44, // Touch-friendly minimum
      },
      contained: {
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    defaultProps: {
      disableElevation: true,
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44, // Touch-friendly minimum
        minHeight: 44,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '12px 16px',
      },
      head: {
        fontWeight: 600,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        fontSize: '0.875rem',
        borderRadius: 4,
      },
    },
  },
};

// Shape configuration
const shape = {
  borderRadius: 8,
};

// Spacing configuration (8px base)
const spacing = 8;

// Create theme factory
export const createAppTheme = (mode: PaletteMode) => {
  const themeOptions: ThemeOptions = {
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography,
    breakpoints,
    components,
    shape,
    spacing,
  };

  return createTheme(themeOptions);
};

// Default theme (light mode)
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Responsive breakpoints helper
export const BREAKPOINTS = {
  mobile: '(max-width: 599px)',
  tablet: '(min-width: 600px) and (max-width: 959px)',
  desktop: '(min-width: 960px)',
  largeDesktop: '(min-width: 1920px)',
};

// Z-index levels
export const Z_INDEX = {
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// Animation durations
export const TRANSITIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
};

export default lightTheme;
