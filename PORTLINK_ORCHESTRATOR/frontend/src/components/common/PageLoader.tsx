import { Box, CircularProgress, Container, Paper, Skeleton, Stack } from '@mui/material';

/**
 * Full-page loading spinner for route transitions
 */
export function PageLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
      }}
    >
      <CircularProgress size={60} thickness={4} />
    </Box>
  );
}

/**
 * Dashboard skeleton loader
 */
export function DashboardLoader() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Stats Cards Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Paper key={i} elevation={2} sx={{ p: 2, height: 120 }}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="40%" height={40} sx={{ my: 1 }} />
              <Skeleton variant="text" width="50%" height={20} />
            </Paper>
          ))}
        </Box>

        {/* Charts Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={320} />
          </Paper>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
          </Paper>
        </Box>

        {/* Table/List Row */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </Paper>
      </Stack>
    </Container>
  );
}

/**
 * List page skeleton loader
 */
export function ListPageLoader() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header with title and actions */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton variant="text" width={200} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>

        {/* Filters */}
        <Paper elevation={2} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width="25%" height={56} />
            <Skeleton variant="rectangular" width="25%" height={56} />
            <Skeleton variant="rectangular" width="25%" height={56} />
            <Skeleton variant="rectangular" width="25%" height={56} />
          </Box>
        </Paper>

        {/* List items */}
        <Paper elevation={2} sx={{ p: 2 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2, p: 2, borderBottom: '1px solid #eee' }}>
              <Skeleton variant="rectangular" width={60} height={60} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="30%" height={20} />
              </Box>
              <Skeleton variant="rectangular" width={80} height={32} />
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
}

/**
 * Form page skeleton loader
 */
export function FormPageLoader() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Skeleton variant="text" width="50%" height={40} sx={{ mb: 4 }} />
        
        {/* Form fields */}
        <Stack spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Box key={i}>
              <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={56} />
            </Box>
          ))}
        </Stack>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="rectangular" width={100} height={40} />
        </Box>
      </Paper>
    </Container>
  );
}

/**
 * Detail page skeleton loader
 */
export function DetailPageLoader() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
          <Skeleton variant="rectangular" width={120} height={40} />
        </Box>

        {/* Info cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton variant="text" width="30%" height={24} />
                <Skeleton variant="text" width="50%" height={24} />
              </Box>
            ))}
          </Paper>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} />
          </Paper>
        </Box>

        {/* Activity/Timeline */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
          {[1, 2, 3, 4].map((i) => (
            <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
            </Box>
          ))}
        </Paper>
      </Stack>
    </Container>
  );
}

export default PageLoader;
