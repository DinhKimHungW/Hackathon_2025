import { Chip, Tooltip } from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Autorenew,
  Done,
  Flight,
  Cancel,
} from '@mui/icons-material';
import type { ShipVisitStatus } from '../shipVisitsSlice';

interface StatusBadgeProps {
  status: ShipVisitStatus;
  size?: 'small' | 'medium';
  showIcon?: boolean;
}

interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactElement;
  description: string;
}

const statusConfigs: Record<ShipVisitStatus, StatusConfig> = {
  PLANNED: {
    color: '#1976d2',
    bgColor: '#e3f2fd',
    label: 'Planned',
    icon: <Schedule fontSize="small" />,
    description: 'Ship visit is scheduled and planned',
  },
  ARRIVED: {
    color: '#2e7d32',
    bgColor: '#e8f5e9',
    label: 'Arrived',
    icon: <CheckCircle fontSize="small" />,
    description: 'Ship has arrived at port',
  },
  IN_PROGRESS: {
    color: '#ed6c02',
    bgColor: '#fff4e5',
    label: 'In Progress',
    icon: <Autorenew fontSize="small" />,
    description: 'Ship visit operations are ongoing',
  },
  COMPLETED: {
    color: '#9c27b0',
    bgColor: '#f3e5f5',
    label: 'Completed',
    icon: <Done fontSize="small" />,
    description: 'All operations completed, ready to depart',
  },
  DEPARTED: {
    color: '#607d8b',
    bgColor: '#eceff1',
    label: 'Departed',
    icon: <Flight fontSize="small" />,
    description: 'Ship has departed from port',
  },
  CANCELLED: {
    color: '#d32f2f',
    bgColor: '#ffebee',
    label: 'Cancelled',
    icon: <Cancel fontSize="small" />,
    description: 'Ship visit has been cancelled',
  },
};

export default function StatusBadge({ 
  status, 
  size = 'medium',
  showIcon = true 
}: StatusBadgeProps) {
  const config = statusConfigs[status];

  if (!config) {
    return (
      <Chip
        label="Unknown"
        size={size}
        sx={{
          bgcolor: '#f5f5f5',
          color: '#9e9e9e',
          fontWeight: 500,
        }}
      />
    );
  }

  return (
    <Tooltip title={config.description} arrow>
      <Chip
        icon={showIcon ? config.icon : undefined}
        label={config.label}
        size={size}
        sx={{
          bgcolor: config.bgColor,
          color: config.color,
          fontWeight: 600,
          borderRadius: '16px',
          '& .MuiChip-icon': {
            color: config.color,
          },
          '&:hover': {
            bgcolor: config.color,
            color: '#fff',
            '& .MuiChip-icon': {
              color: '#fff',
            },
          },
          transition: 'all 0.3s ease',
        }}
      />
    </Tooltip>
  );
}
