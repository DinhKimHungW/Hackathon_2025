import { useTheme, useMediaQuery } from '@mui/material';

export interface ResponsiveHelpers {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeScreen: boolean;
  currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const useResponsive = (): ResponsiveHelpers => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  let currentBreakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  
  if (useMediaQuery(theme.breakpoints.only('xs'))) currentBreakpoint = 'xs';
  else if (useMediaQuery(theme.breakpoints.only('sm'))) currentBreakpoint = 'sm';
  else if (useMediaQuery(theme.breakpoints.only('md'))) currentBreakpoint = 'md';
  else if (useMediaQuery(theme.breakpoints.only('lg'))) currentBreakpoint = 'lg';
  else if (useMediaQuery(theme.breakpoints.only('xl'))) currentBreakpoint = 'xl';

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    currentBreakpoint,
  };
};