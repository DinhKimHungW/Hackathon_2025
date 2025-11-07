import { Card, CardContent, Typography, Box, Skeleton, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { pulse } from '@/theme/animations';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color?: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
  suffix?: string;
  gradient?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  icon,
  color = '#667eea',
  subtitle,
  trend,
  loading = false,
  suffix = '',
  gradient,
  sparklineData,
  onClick,
}: StatCardProps) {
  const theme = useTheme();

  if (loading) {
    return (
      <Card 
        elevation={0}
        sx={{ 
          height: '100%',
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={24} />
          <Skeleton variant="text" width="40%" height={48} sx={{ my: 1 }} />
          <Skeleton variant="text" width="80%" height={20} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        background: gradient || (theme.palette.mode === 'light' 
          ? '#ffffff'
          : theme.palette.background.paper),
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.palette.mode === 'light'
            ? '0 12px 24px rgba(0,0,0,0.1)'
            : '0 12px 24px rgba(0,0,0,0.3)',
          borderColor: color,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Icon and Title */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            fontWeight={600}
            sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.75rem' }}
          >
            {title}
          </Typography>
          
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.2)})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: color,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Value */}
        <Box sx={{ mb: 1.5 }}>
          <Typography 
            variant="h3" 
            fontWeight={700}
            sx={{ 
              color: color,
              fontSize: { xs: '2rem', md: '2.5rem' },
              lineHeight: 1,
            }}
          >
            {value}
            {suffix && (
              <Typography 
                component="span" 
                variant="h5" 
                color="text.secondary"
                sx={{ ml: 0.5, fontSize: '1.25rem', fontWeight: 600 }}
              >
                {suffix}
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Subtitle and Trend */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: sparklineData ? 2 : 0 }}>
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.8rem' }}
            >
              {subtitle}
            </Typography>
          )}

          {trend && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: trend.isPositive 
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: trend.isPositive
                  ? theme.palette.success.main
                  : theme.palette.error.main,
              }}
            >
              {trend.isPositive ? (
                <TrendingUp fontSize="small" />
              ) : (
                <TrendingDown fontSize="small" />
              )}
              <Typography variant="caption" fontWeight={600}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Sparkline (Simple bars) */}
        {sparklineData && sparklineData.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.5, height: 32 }}>
            {sparklineData.map((val, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  height: `${(val / Math.max(...sparklineData)) * 100}%`,
                  minHeight: 4,
                  bgcolor: alpha(color, 0.3),
                  borderRadius: 0.5,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: color,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
