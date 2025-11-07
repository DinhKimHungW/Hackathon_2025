import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'table' | 'card' | 'list' | 'dashboard' | 'form';
  rows?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'table',
  rows = 5,
}) => {
  switch (variant) {
    case 'table':
      return (
        <Box>
          {/* Table Header */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Skeleton variant="rectangular" width="5%" height={40} />
            <Skeleton variant="rectangular" width="20%" height={40} />
            <Skeleton variant="rectangular" width="20%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="15%" height={40} />
            <Skeleton variant="rectangular" width="10%" height={40} />
          </Box>
          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <Skeleton variant="rectangular" width="5%" height={52} />
              <Skeleton variant="rectangular" width="20%" height={52} />
              <Skeleton variant="rectangular" width="20%" height={52} />
              <Skeleton variant="rectangular" width="15%" height={52} />
              <Skeleton variant="rectangular" width="15%" height={52} />
              <Skeleton variant="rectangular" width="15%" height={52} />
              <Skeleton variant="rectangular" width="10%" height={52} />
            </Box>
          ))}
        </Box>
      );

    case 'card':
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {Array.from({ length: rows }).map((_, index) => (
            <Card key={index}>
              <CardContent>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Skeleton variant="rounded" width={80} height={36} />
                  <Skeleton variant="rounded" width={80} height={36} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      );

    case 'list':
      return (
        <Box>
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
              </Box>
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>
          ))}
        </Box>
      );

    case 'dashboard':
      return (
        <Box>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent>
                  <Skeleton variant="text" width="70%" height={24} />
                  <Skeleton variant="text" width="50%" height={48} sx={{ mt: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
                </CardContent>
              </Card>
            ))}
          </Box>
          {/* Chart */}
          <Card>
            <CardContent>
              <Skeleton variant="text" width="30%" height={32} />
              <Skeleton variant="rectangular" height={300} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Box>
      );

    case 'form':
      return (
        <Box>
          {Array.from({ length: rows }).map((_, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Skeleton variant="text" width="20%" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" height={56} />
            </Box>
          ))}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
            <Skeleton variant="rounded" width={100} height={44} />
            <Skeleton variant="rounded" width={100} height={44} />
          </Box>
        </Box>
      );

    default:
      return null;
  }
};

export default SkeletonLoader;
