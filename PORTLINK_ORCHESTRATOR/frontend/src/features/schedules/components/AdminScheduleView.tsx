/**
 * Admin Schedule View Component
 * Giao diện quản lý lịch trình tối ưu cho Admin
 */

import { useState, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Tooltip,
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
  ViewModule as CardViewIcon,
  ViewList as ListViewIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, differenceInHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Schedule } from '../types';

interface AdminScheduleViewProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
  onFilterChange?: (entityType: string, entityId?: string) => void;
}

type ViewMode = 'dashboard' | 'grouped' | 'table';
type GroupBy = 'ship' | 'berth' | 'status' | 'date';

export const AdminScheduleView: React.FC<AdminScheduleViewProps> = ({
  schedules,
  onScheduleClick,
  onFilterChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const [groupBy, setGroupBy] = useState<GroupBy>('ship');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Calculate statistics
  const stats = {
    total: schedules.length,
    active: schedules.filter(s => s.status === 'IN_PROGRESS').length,
    completed: schedules.filter(s => s.status === 'COMPLETED').length,
    pending: schedules.filter(s => s.status === 'PENDING' || s.status === 'SCHEDULED').length,
    cancelled: schedules.filter(s => s.status === 'CANCELLED').length,
  };

  // Group schedules
  const groupedSchedules = useMemo(() => {
    const groups: Record<string, Schedule[]> = {};
    
    schedules.forEach(schedule => {
      let key = 'Khác';
      
      switch (groupBy) {
        case 'ship':
          key = schedule.shipVisit?.vesselName || 'Không có tàu';
          break;
        case 'berth':
          key = schedule.berthName || 'Chưa phân bến';
          break;
        case 'status':
          key = schedule.status;
          break;
        case 'date':
          key = format(new Date(schedule.startTime), 'dd/MM/yyyy', { locale: vi });
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(schedule);
    });
    
    return groups;
  }, [schedules, groupBy]);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusColor = (status: string): 'warning' | 'primary' | 'success' | 'error' | 'default' => {
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'PENDING': 'Chờ xử lý',
      'SCHEDULED': 'Đã lên lịch',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return labels[status] || status;
  };

  const getGroupIcon = () => {
    switch (groupBy) {
      case 'ship': return <ShipIcon />;
      case 'berth': return <BerthIcon />;
      case 'status': return <ScheduleIcon />;
      case 'date': return <TimeIcon />;
      default: return <DashboardIcon />;
    }
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {/* Header với view controls */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Quản lý Lịch trình Toàn cảng
          </Typography>
          
          {/* View Mode Tabs */}
          <Tabs 
            value={viewMode} 
            onChange={(_, v) => setViewMode(v)}
            sx={{ minHeight: 40 }}
          >
            <Tab 
              value="dashboard" 
              label={!isMobile ? "Tổng quan" : undefined}
              icon={<DashboardIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 1 }}
            />
            <Tab 
              value="grouped" 
              label={!isMobile ? "Theo nhóm" : undefined}
              icon={<CardViewIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 1 }}
            />
            <Tab 
              value="table" 
              label={!isMobile ? "Bảng" : undefined}
              icon={<ListViewIcon />}
              iconPosition="start"
              sx={{ minHeight: 40, py: 1 }}
            />
          </Tabs>
        </Stack>

        {/* Group By Controls - Show only in grouped/table view */}
        {(viewMode === 'grouped' || viewMode === 'table') && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<ShipIcon />}
              label="Theo tàu"
              onClick={() => setGroupBy('ship')}
              color={groupBy === 'ship' ? 'primary' : 'default'}
              variant={groupBy === 'ship' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<BerthIcon />}
              label="Theo bến"
              onClick={() => setGroupBy('berth')}
              color={groupBy === 'berth' ? 'primary' : 'default'}
              variant={groupBy === 'berth' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<ScheduleIcon />}
              label="Theo trạng thái"
              onClick={() => setGroupBy('status')}
              color={groupBy === 'status' ? 'primary' : 'default'}
              variant={groupBy === 'status' ? 'filled' : 'outlined'}
            />
            <Chip
              icon={<TimeIcon />}
              label="Theo ngày"
              onClick={() => setGroupBy('date')}
              color={groupBy === 'date' ? 'primary' : 'default'}
              variant={groupBy === 'date' ? 'filled' : 'outlined'}
            />
          </Box>
        )}
      </Box>

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <>
          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={2.4}>
              <Card sx={{ bgcolor: 'primary.lighter', height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Tổng lịch trình</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                    <Chip icon={<ScheduleIcon />} label="Tổng số" size="small" color="primary" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={2.4}>
              <Card sx={{ bgcolor: 'info.lighter', height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Đang thực hiện</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.active}</Typography>
                    <Chip icon={<TrendingUpIcon />} label={`${stats.total > 0 ? ((stats.active/stats.total)*100).toFixed(0) : 0}%`} size="small" color="info" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={2.4}>
              <Card sx={{ bgcolor: 'success.lighter', height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Hoàn thành</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.completed}</Typography>
                    <Chip icon={<CheckCircleIcon />} label={`${stats.total > 0 ? ((stats.completed/stats.total)*100).toFixed(0) : 0}%`} size="small" color="success" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={2.4}>
              <Card sx={{ bgcolor: 'warning.lighter', height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Chờ xử lý</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.pending}</Typography>
                    <Chip icon={<WarningIcon />} label="Pending" size="small" color="warning" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={6} md={2.4}>
              <Card sx={{ bgcolor: 'error.lighter', height: '100%' }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">Đã hủy</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.cancelled}</Typography>
                    <Chip icon={<CancelIcon />} label="Cancelled" size="small" color="error" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Schedules in Dashboard */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Lịch trình gần đây</Typography>
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
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: 'primary.main',
                          transform: 'translateX(4px)',
                        },
                      }}
                      onClick={() => onScheduleClick?.(schedule)}
                    >
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ flex: 1, minWidth: 200 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {schedule.operation || schedule.name}
                            </Typography>
                            {schedule.shipVisit && (
                              <Typography variant="caption" color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <ShipIcon fontSize="small" />
                                {schedule.shipVisit.vesselName}
                              </Typography>
                            )}
                          </Box>
                          
                          <Chip
                            label={getStatusLabel(schedule.status)}
                            size="small"
                            color={getStatusColor(schedule.status)}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip
                            icon={<TimeIcon />}
                            label={format(new Date(schedule.startTime), 'dd/MM HH:mm', { locale: vi })}
                            size="small"
                            variant="outlined"
                          />
                          {schedule.berthName && (
                            <Chip
                              icon={<BerthIcon />}
                              label={schedule.berthName}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {schedule.completionPercentage !== undefined && schedule.status === 'IN_PROGRESS' && (
                            <Chip
                              label={`${schedule.completionPercentage}%`}
                              size="small"
                              color="info"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Grouped View */}
      {viewMode === 'grouped' && (
        <Stack spacing={2}>
          {Object.entries(groupedSchedules).map(([groupKey, groupSchedules]) => (
            <Card key={groupKey}>
              <CardContent sx={{ p: 0 }}>
                {/* Group Header */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'primary.light',
                    },
                  }}
                  onClick={() => toggleGroup(groupKey)}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {getGroupIcon()}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{groupKey}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {groupSchedules.length} lịch trình
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Badge badgeContent={groupSchedules.filter(s => s.status === 'IN_PROGRESS').length} color="primary">
                      <Chip label="Đang chạy" size="small" />
                    </Badge>
                    <IconButton size="small">
                      {expandedGroups.has(groupKey) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>
                </Box>

                {/* Group Content */}
                <Collapse in={expandedGroups.has(groupKey)}>
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      {groupSchedules.map((schedule) => (
                        <Grid item xs={12} sm={6} md={4} key={schedule.id}>
                          <Card 
                            sx={{ 
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: '2px solid',
                              borderColor: 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                                transform: 'translateY(-4px)',
                                boxShadow: 4,
                              },
                            }}
                            onClick={() => onScheduleClick?.(schedule)}
                          >
                            <CardContent>
                              <Stack spacing={1.5}>
                                {/* Status Badge */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Chip
                                    label={getStatusLabel(schedule.status)}
                                    size="small"
                                    color={getStatusColor(schedule.status)}
                                  />
                                  {schedule.completionPercentage !== undefined && schedule.status === 'IN_PROGRESS' && (
                                    <Typography variant="caption" fontWeight={600} color="primary">
                                      {schedule.completionPercentage}%
                                    </Typography>
                                  )}
                                </Box>

                                {/* Title */}
                                <Typography variant="subtitle2" fontWeight={600} noWrap>
                                  {schedule.operation || schedule.name}
                                </Typography>

                                {/* Ship Info */}
                                {schedule.shipVisit && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <ShipIcon fontSize="small" color="primary" />
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {schedule.shipVisit.vesselName}
                                    </Typography>
                                  </Box>
                                )}

                                {/* Time & Location */}
                                <Divider />
                                <Stack spacing={0.5}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" color="action" />
                                    <Typography variant="caption">
                                      {format(new Date(schedule.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </Typography>
                                  </Box>
                                  {schedule.berthName && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <BerthIcon fontSize="small" color="action" />
                                      <Typography variant="caption">{schedule.berthName}</Typography>
                                    </Box>
                                  )}
                                </Stack>

                                {/* Progress Bar for IN_PROGRESS */}
                                {schedule.status === 'IN_PROGRESS' && schedule.completionPercentage !== undefined && (
                                  <LinearProgress 
                                    variant="determinate" 
                                    value={schedule.completionPercentage} 
                                    sx={{ height: 6, borderRadius: 3 }}
                                  />
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.lighter' }}>
                <TableCell><strong>Lịch trình</strong></TableCell>
                <TableCell><strong>Tàu</strong></TableCell>
                <TableCell><strong>Bến</strong></TableCell>
                <TableCell><strong>Thời gian</strong></TableCell>
                <TableCell><strong>Tiến độ</strong></TableCell>
                <TableCell><strong>Trạng thái</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedSchedules).map(([groupKey, groupSchedules]) => (
                <>
                  <TableRow 
                    key={`group-${groupKey}`}
                    sx={{ 
                      bgcolor: 'action.hover',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.selected' },
                    }}
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <TableCell colSpan={6}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <IconButton size="small">
                          {expandedGroups.has(groupKey) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        {getGroupIcon()}
                        <Typography variant="subtitle1" fontWeight={600}>
                          {groupKey}
                        </Typography>
                        <Chip label={`${groupSchedules.length} lịch trình`} size="small" />
                      </Stack>
                    </TableCell>
                  </TableRow>
                  
                  {expandedGroups.has(groupKey) && groupSchedules.map((schedule) => (
                    <TableRow 
                      key={schedule.id}
                      hover
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                      onClick={() => onScheduleClick?.(schedule)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {schedule.operation || schedule.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.shipVisit ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <ShipIcon fontSize="small" color="primary" />
                            <Typography variant="body2">
                              {schedule.shipVisit.vesselName}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {schedule.berthName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {format(new Date(schedule.startTime), 'dd/MM HH:mm', { locale: vi })}
                        </Typography>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {differenceInHours(new Date(schedule.endTime), new Date(schedule.startTime))}h
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {schedule.completionPercentage !== undefined ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={schedule.completionPercentage} 
                              sx={{ flex: 1, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption" fontWeight={600}>
                              {schedule.completionPercentage}%
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(schedule.status)}
                          size="small"
                          color={getStatusColor(schedule.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {schedules.length === 0 && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 8 }}>
              Không có lịch trình nào
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
