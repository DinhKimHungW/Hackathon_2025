import { useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
  Box,
  useTheme,
  Container,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'ship-visits': 'Ship Visits',
  schedules: 'Schedules',
  tasks: 'Tasks',
  assets: 'Assets',
  conflicts: 'Conflicts',
  simulation: 'Simulation',
  'event-logs': 'Event Logs',
  chatbot: 'AI Assistant',
  settings: 'Settings',
  profile: 'Profile',
  new: 'Create New',
  edit: 'Edit',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const theme = useTheme();

  const pathnames = location.pathname.split('/').filter((x) => x);

  // Hide breadcrumbs on dashboard (root)
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', path: '/dashboard' },
  ];

  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathnames.length - 1;
    
    breadcrumbs.push({
      label: routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      path: isLast ? undefined : currentPath,
    });
  });

  return (
    <Container maxWidth="xl" sx={{ px: 0, mb: 2 }}>
      <Box>
      <MuiBreadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          py: 1,
          px: 2,
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          if (isLast) {
            return (
              <Typography
                key={index}
                color="text.primary"
                fontWeight={600}
                fontSize="0.875rem"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                {breadcrumb.label}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              component={RouterLink}
              to={breadcrumb.path!}
              underline="hover"
              color="inherit"
              fontSize="0.875rem"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {isFirst && <HomeIcon sx={{ fontSize: 16 }} />}
              {breadcrumb.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
      </Box>
    </Container>
  );
}
