import { useMediaQuery } from '@mui/material';
import type { Breakpoint } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Hook to check if screen is mobile (< 600px)
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};

/**
 * Hook to check if screen is tablet (600px - 959px)
 */
export const useIsTablet = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.between('sm', 'md'));
};

/**
 * Hook to check if screen is desktop (>= 960px)
 */
export const useIsDesktop = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('md'));
};

/**
 * Hook to check if screen is large desktop (>= 1920px)
 */
export const useIsLargeDesktop = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.up('xl'));
};

/**
 * Hook to get current breakpoint
 */
export const useBreakpoint = (): Breakpoint => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));

  if (isXs) return 'xs';
  if (isSm) return 'sm';
  if (isMd) return 'md';
  if (isLg) return 'lg';
  return 'xl';
};

/**
 * Get responsive grid columns based on breakpoint
 */
export const useResponsiveColumns = (config?: {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}): number => {
  const breakpoint = useBreakpoint();
  const defaultConfig = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 };
  const columns = { ...defaultConfig, ...config };
  return columns[breakpoint];
};

/**
 * Get responsive spacing
 */
export const useResponsiveSpacing = (): number => {
  const isMobile = useIsMobile();
  return isMobile ? 2 : 3;
};

export default {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useBreakpoint,
  useResponsiveColumns,
  useResponsiveSpacing,
};
