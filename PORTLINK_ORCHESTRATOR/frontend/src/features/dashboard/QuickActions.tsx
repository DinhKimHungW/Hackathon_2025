import { Card, CardContent, Typography, Box, alpha, useTheme } from '@mui/material';
import {
  AddCircleOutline,
  CalendarMonth,
  Warning,
  PlayCircleOutline,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import colors from '@/theme/colors';
import { scaleIn } from '@/theme/animations';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  path: string;
}

export default function QuickActions() {
  const navigate = useNavigate();
  const theme = useTheme();

  const actions: QuickAction[] = [
    {
      title: 'New Ship Arrival',
      description: 'Register incoming vessel',
      icon: <AddCircleOutline fontSize="large" />,
      color: colors.ocean[500],
      path: '/ship-visits/new',
    },
    {
      title: 'Schedule Task',
      description: 'Create new operation',
      icon: <CalendarMonth fontSize="large" />,
      color: colors.success[600],
      path: '/tasks',
    },
    {
      title: 'View Conflicts',
      description: 'Resolve scheduling issues',
      icon: <Warning fontSize="large" />,
      color: colors.error[500],
      path: '/conflicts',
    },
    {
      title: 'Run Simulation',
      description: 'Test scenarios',
      icon: <PlayCircleOutline fontSize="large" />,
      color: colors.sunset[500],
      path: '/simulation',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {actions.map((action, index) => (
          <Card
            key={action.title}
            onClick={() => navigate(action.path)}
            sx={{
              cursor: 'pointer',
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              transition: 'all 0.3s ease',
              animation: `${scaleIn} 0.3s ease ${index * 0.1}s both`,
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.palette.mode === 'light'
                  ? '0 8px 16px rgba(0,0,0,0.1)'
                  : '0 8px 16px rgba(0,0,0,0.3)',
                borderColor: action.color,
                '& .action-icon': {
                  transform: 'scale(1.1)',
                  bgcolor: action.color,
                  color: '#fff',
                },
              },
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  className="action-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(action.color, 0.1)}, ${alpha(action.color, 0.2)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.color,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {action.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {action.description}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
