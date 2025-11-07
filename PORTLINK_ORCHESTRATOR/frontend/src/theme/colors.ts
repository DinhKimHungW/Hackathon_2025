// Maritime-themed color palette for professional port management system
export const colors = {
  // Primary Colors (Maritime Authority)
  navy: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#0A2463', // Main navy blue
    600: '#081D4F',
    700: '#06163C',
    800: '#040F28',
    900: '#020714',
  },
  
  ocean: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#1E88E5', // Main ocean blue
    600: '#1976D2',
    700: '#1565C0',
    800: '#0D47A1',
    900: '#01579B',
  },
  
  teal: {
    50: '#E0F7FA',
    100: '#B2EBF2',
    200: '#80DEEA',
    300: '#4DD0E1',
    400: '#26C6DA',
    500: '#00ACC1', // Main teal
    600: '#00A0B0',
    700: '#008FA0',
    800: '#007E8F',
    900: '#006D7F',
  },
  
  // Secondary/Accent Colors
  sunset: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#FF6B35', // Main sunset orange
    600: '#F57C00',
    700: '#EF6C00',
    800: '#E65100',
    900: '#BF360C',
  },
  
  // Status Colors
  success: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50', // Success green
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  
  warning: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726', // Warning amber
    500: '#FF9800',
    600: '#FB8C00',
    700: '#F57C00',
    800: '#EF6C00',
    900: '#E65100',
  },
  
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350', // Error red
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  
  info: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Info blue
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  
  // Neutral/Gray Scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  blueGray: {
    50: '#ECEFF1',
    100: '#CFD8DC',
    200: '#B0BEC5',
    300: '#90A4AE',
    400: '#78909C',
    500: '#607D8B',
    600: '#546E7A',
    700: '#455A64',
    800: '#37474F',
    900: '#263238',
  },
};

// Gradient definitions
export const gradients = {
  primary: 'linear-gradient(135deg, #0A2463 0%, #1E88E5 100%)',
  secondary: 'linear-gradient(135deg, #1E88E5 0%, #00ACC1 100%)',
  sunset: 'linear-gradient(135deg, #FF6B35 0%, #FFA726 100%)',
  success: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
  ocean: 'linear-gradient(135deg, #1E88E5 0%, #00ACC1 50%, #4CAF50 100%)',
  dark: 'linear-gradient(135deg, #263238 0%, #37474F 100%)',
  light: 'linear-gradient(135deg, #ECEFF1 0%, #FFFFFF 100%)',
};

// Ship type colors
export const shipTypeColors = {
  CONTAINER: colors.ocean[500],
  BULK: colors.teal[500],
  TANKER: colors.sunset[500],
  RORO: colors.success[500],
  GENERAL: colors.info[500],
  PASSENGER: colors.navy[500],
};

// Status colors
export const statusColors = {
  SCHEDULED: colors.info[500],
  ARRIVED: colors.success[500],
  IN_PROGRESS: colors.ocean[500],
  DEPARTED: colors.gray[500],
  DELAYED: colors.warning[500],
  CANCELLED: colors.error[500],
  
  // Asset status
  AVAILABLE: colors.success[500],
  IN_USE: colors.ocean[500],
  MAINTENANCE: colors.warning[500],
  OUT_OF_SERVICE: colors.error[500],
  
  // Task status
  PENDING: colors.gray[500],
  ACTIVE: colors.ocean[500],
  COMPLETED: colors.success[500],
  
  // Conflict severity
  CRITICAL: colors.error[500],
  HIGH: colors.warning[600],
  MEDIUM: colors.warning[400],
  LOW: colors.info[500],
};

export default colors;
