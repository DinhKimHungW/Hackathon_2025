/**
 * Admin Schedule View Component
 * Dashboard với overview, analytics và multi-entity filtering
 */

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery,
  ToggleButton,
  ToggleButtonGroup,
  LinearProgress,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Cancel as CancelIcon,
  DirectionsBoat as ShipIcon,
  LocalShipping as TruckIcon,
  Anchor as BerthIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Schedule } from '../types';

interface AdminScheduleViewProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
  onFilterChange?: (entityType: string, entityId?: string) => void;
}

type EntityFilterType = 'ALL' | 'SHIPS' | 'DRIVERS' | 'BERTHS' | 'PERSONNEL';

export const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  schedules,
  onScheduleClick,
  onFilterChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [entityFilter, setEntityFilter] = useState<EntityFilterType>('ALL');

  // Calculate statistics
  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.status === 'IN_PROGRESS').length,
    completed: schedules.filter(s => s.status === 'COMPLETED').length,
    pending: schedules.filter(s => s.status === 'PENDING' || s.status === 'SCHEDULED').length,
    cancelled: schedules.filter(s => s.status === 'CANCELLED').length,
  };

  // Calculate performance metrics
  const completionRate = stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : '0';
  const activeRate = stats.total > 0 ? (stats.active / stats.total * 100).toFixed(1) : '0';

  // Mock resource allocation data
  const resourceStats = {
    berths: {
      total: 12,
      occupied: 8,
      available: 4,
      maintenance: 0,
    },
    vehicles: {
      total: 50,
      busy: 32,
      idle: 15,
      maintenance: 3,
    },
    personnel: {
      total: 150,
      assigned: 98,
      available: 45,
      offDuty: 7,
    },
  };

  const handleEntityFilterChange = (filter: EntityFilterType) => {
    setEntityFilter(filter);
    onFilterChange?.(filter.toLowerCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SCHEDULED':
        return 'warning';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      {/* Header với entity filter */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon color="primary" />
          Dashboard Quản lý Lịch trình
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          <ToggleButtonGroup
            value={entityFilter}
            exclusive
            onChange={(_, value) => value && handleEntityFilterChange(value)}
            aria-label="entity filter"
            size={isMobile ? 'small' : 'medium'}
            sx={{ flexWrap: 'wrap' }}
          >
            <ToggleButton value="ALL">
              <DashboardIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isMobile && 'Tất cả'}
            </ToggleButton>
            <ToggleButton value="SHIPS">
              <ShipIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isMobile && 'Tàu'}
            </ToggleButton>
            <ToggleButton value="DRIVERS">
              <TruckIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isMobile && 'Xe'}
            </ToggleButton>
            <ToggleButton value="BERTHS">
              <BerthIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isMobile && 'Bến'}
            </ToggleButton>
            <ToggleButton value="PERSONNEL">
              <PeopleIcon sx={{ mr: { xs: 0, sm: 1 } }} />
              {!isMobile && 'Nhân sự'}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Total Schedules */}
        <Grid item xs={6} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: 'primary.lighter' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Tổng lịch trình
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
                <Chip
                  icon={<ScheduleIcon />}
                  label="Tổng số"
                  size="small"
                  color="primary"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Schedules */}
        <Grid item xs={6} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: 'info.lighter' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Đang thực hiện
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.active}
                </Typography>
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`${activeRate}%`}
                  size="small"
                  color="info"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Completed */}
        <Grid item xs={6} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: 'success.lighter' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Hoàn thành
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.completed}
                </Typography>
                <Chip
                  icon={<CheckCircleIcon />}
                  label={`${completionRate}%`}
                  size="small"
                  color="success"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Pending */}
        <Grid item xs={6} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: 'warning.lighter' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Chờ xử lý
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.pending}
                </Typography>
                <Chip
                  icon={<WarningIcon />}
                  label="Pending"
                  size="small"
                  color="warning"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Cancelled */}
        <Grid item xs={6} sm={6} md={2.4}>
          <Card sx={{ height: '100%', bgcolor: 'error.lighter' }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  Đã hủy
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.cancelled}
                </Typography>
                <Chip
                  icon={<CancelIcon />}
                  label="Cancelled"
                  size="small"
                  color="error"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resource Allocation */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Berths */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BerthIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Bến cảng</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tình trạng sử dụng
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Tỷ lệ sử dụng</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {((resourceStats.berths.occupied / resourceStats.berths.total) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(resourceStats.berths.occupied / resourceStats.berths.total) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${resourceStats.berths.occupied} Đang dùng`} size="small" color="primary" />
                  <Chip label={`${resourceStats.berths.available} Trống`} size="small" variant="outlined" />
                  {resourceStats.berths.maintenance > 0 && (
                    <Chip label={`${resourceStats.berths.maintenance} Bảo trì`} size="small" color="warning" />
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicles */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <TruckIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Phương tiện</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Xe tải/Container
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Đang hoạt động</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {((resourceStats.vehicles.busy / resourceStats.vehicles.total) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(resourceStats.vehicles.busy / resourceStats.vehicles.total) * 100}
                    color="success"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${resourceStats.vehicles.busy} Đang dùng`} size="small" color="success" />
                  <Chip label={`${resourceStats.vehicles.idle} Sẵn sàng`} size="small" variant="outlined" />
                  <Chip label={`${resourceStats.vehicles.maintenance} Bảo trì`} size="small" color="warning" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Personnel */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <PeopleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6">Nhân sự</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Nhân viên cảng
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Đã phân công</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {((resourceStats.personnel.assigned / resourceStats.personnel.total) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(resourceStats.personnel.assigned / resourceStats.personnel.total) * 100}
                    color="info"
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label={`${resourceStats.personnel.assigned} Đã giao`} size="small" color="info" />
                  <Chip label={`${resourceStats.personnel.available} Sẵn sàng`} size="small" variant="outlined" />
                  <Chip label={`${resourceStats.personnel.offDuty} Nghỉ`} size="small" />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Schedules */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lịch trình gần đây
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {schedules.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
              Không có lịch trình
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {schedules.slice(0, 10).map((schedule) => (
                <Box
                  key={schedule.id}
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      transform: 'translateX(4px)',
                    },
                  }}
                  onClick={() => onScheduleClick?.(schedule)}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 200 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {schedule.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(schedule.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </Typography>
                    </Box>
                    
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={schedule.status}
                        size="small"
                        color={getStatusColor(schedule.status)}
                      />
                      {schedule.type && (
                        <Chip
                          label={schedule.type}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {schedule.berthName && (
                        <Chip
                          icon={<BerthIcon />}
                          label={schedule.berthName}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
