/**
 * Quick Actions FAB (Floating Action Button)
 * Mobile-friendly quick actions based on user role
 */

import { useState } from 'react';
import {
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
  Assignment as AssignIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Report as ReportIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import type { UserRole } from '../types/role-based';

interface QuickActionsProps {
  userRole: UserRole;
  onAction: (action: string) => void;
  permissions: {
    canCreate: boolean;
    canExport: boolean;
    canFilter: boolean;
  };
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  userRole,
  onAction,
  permissions,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(false);

  // Define actions based on role
  const getActions = () => {
    switch (userRole) {
      case 'ADMIN':
        return [
          { icon: <AddIcon />, name: 'Tạo lịch mới', action: 'create', show: permissions.canCreate },
          { icon: <FilterIcon />, name: 'Lọc', action: 'filter', show: permissions.canFilter },
          { icon: <ExportIcon />, name: 'Xuất dữ liệu', action: 'export', show: permissions.canExport },
          { icon: <AnalyticsIcon />, name: 'Analytics', action: 'analytics', show: true },
          { icon: <RefreshIcon />, name: 'Làm mới', action: 'refresh', show: true },
        ];
      
      case 'MANAGER':
        return [
          { icon: <AddIcon />, name: 'Tạo lịch mới', action: 'create', show: permissions.canCreate },
          { icon: <AssignIcon />, name: 'Phân công', action: 'assign', show: true },
          { icon: <AnalyticsIcon />, name: 'Thống kê', action: 'analytics', show: true },
          { icon: <FilterIcon />, name: 'Lọc', action: 'filter', show: permissions.canFilter },
          { icon: <RefreshIcon />, name: 'Làm mới', action: 'refresh', show: true },
        ];
      
      case 'OPERATIONS':
        return [
          { icon: <StartIcon />, name: 'Bắt đầu', action: 'start', show: true },
          { icon: <CompleteIcon />, name: 'Hoàn thành', action: 'complete', show: true },
          { icon: <ReportIcon />, name: 'Báo cáo', action: 'report', show: true },
          { icon: <RefreshIcon />, name: 'Làm mới', action: 'refresh', show: true },
        ];
      
      case 'DRIVER':
        return [
          { icon: <MapIcon />, name: 'Xem route', action: 'viewRoute', show: true },
          { icon: <StartIcon />, name: 'Bắt đầu', action: 'start', show: true },
          { icon: <CompleteIcon />, name: 'Hoàn thành', action: 'complete', show: true },
          { icon: <ReportIcon />, name: 'Báo sự cố', action: 'report', show: true },
        ];
      
      default:
        return [
          { icon: <RefreshIcon />, name: 'Làm mới', action: 'refresh', show: true },
        ];
    }
  };

  const actions = getActions().filter(action => action.show);

  const handleAction = (action: string) => {
    setOpen(false);
    onAction(action);
  };

  // Don't show on desktop or if no actions
  if (!isMobile || actions.length === 0) {
    return null;
  }

  return (
    <SpeedDial
      ariaLabel="Quick actions"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 1000,
      }}
      icon={<SpeedDialIcon />}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
    >
      {actions.map((action) => (
        <SpeedDialAction
          key={action.action}
          icon={action.icon}
          tooltipTitle={action.name}
          tooltipOpen
          onClick={() => handleAction(action.action)}
        />
      ))}
    </SpeedDial>
  );
};
