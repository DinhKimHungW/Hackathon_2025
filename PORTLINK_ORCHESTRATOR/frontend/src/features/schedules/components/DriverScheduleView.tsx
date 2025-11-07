/**
 * Driver Schedule View Component
 * Hiển thị lịch làm việc cho tài xế - giống như thời khóa biểu
 */

import { Box, Card, CardContent, Typography, Chip, Stack, Divider, useTheme, useMediaQuery } from '@mui/material';
import {
  LocalShipping as TruckIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  AccountTree as RouteIcon,
  Widgets as ContainerIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Schedule } from '../types';
import type { DriverScheduleDetails } from '../types/role-based';

interface DriverScheduleViewProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
}

export const DriverScheduleView: React.FC<DriverScheduleViewProps> = ({
  schedules,
  onScheduleClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SCHEDULED':
        return 'info';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Mock driver details - sẽ được thay thế bằng data thực từ API
  const getDriverDetails = (schedule: Schedule): DriverScheduleDetails => ({
    driverId: 'DRV001',
    driverName: 'Nguyễn Văn A',
    vehicleId: 'VEH001',
    vehicleNumber: '79C-12345',
    workDetails: {
      gateNumber: schedule.berthName || 'Cổng 1',
      operationType: 'PICKUP',
      loadingZone: 'Khu vực A',
      unloadingZone: 'Khu vực B',
    },
    containers: [
      {
        id: 'CNT001',
        containerNumber: 'MSCU1234567',
        size: '40FT',
        type: 'DRY',
        weight: 20000,
        isEmpty: false,
        pickupLocation: 'Bến A',
        deliveryLocation: 'Kho B',
      },
    ],
    route: {
      origin: 'Cảng Hải Phòng',
      destination: 'Kho Hàng Nội Địa',
      waypoints: [],
      estimatedDistance: 15,
      estimatedDuration: 45,
    },
    workShift: {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
  });

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 2,
      p: { xs: 1, sm: 2 },
    }}>
      {schedules.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              Không có lịch làm việc
            </Typography>
          </CardContent>
        </Card>
      ) : (
        schedules.map((schedule) => {
          const driverDetails = getDriverDetails(schedule);
          
          return (
            <Card
              key={schedule.id}
              sx={{
                cursor: onScheduleClick ? 'pointer' : 'default',
                transition: 'all 0.2s',
                '&:hover': onScheduleClick ? {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                } : {},
              }}
              onClick={() => onScheduleClick?.(schedule)}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1,
                }}>
                  <Box>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
                      {schedule.name}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={getStatusText(schedule.status)}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                      <Chip
                        icon={<ScheduleIcon />}
                        label={format(new Date(schedule.startTime), 'HH:mm', { locale: vi })}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Thông tin chi tiết */}
                <Stack spacing={2}>
                  {/* Thời gian */}
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Thời gian làm việc
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(schedule.startTime), 'dd/MM/yyyy HH:mm', { locale: vi })} - {' '}
                      {format(new Date(schedule.endTime), 'HH:mm', { locale: vi })}
                    </Typography>
                  </Box>

                  {/* Xe và cổng */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TruckIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Số xe
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {driverDetails.vehicleNumber}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocationIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cổng/Công
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {driverDetails.workDetails.gateNumber}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Container info */}
                  {driverDetails.containers.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <ContainerIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Container
                        </Typography>
                      </Stack>
                      {driverDetails.containers.map((container) => (
                        <Box 
                          key={container.id}
                          sx={{ 
                            p: 1.5, 
                            bgcolor: 'background.default',
                            borderRadius: 1,
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2" fontWeight={600}>
                            {container.containerNumber}
                          </Typography>
                          <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                            <Chip label={container.size} size="small" />
                            <Chip label={container.type} size="small" />
                            <Chip 
                              label={`${container.weight.toLocaleString()} kg`} 
                              size="small" 
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Route */}
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <RouteIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Tuyến đường
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}>
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Điểm đi
                          </Typography>
                          <Typography variant="body2">
                            {driverDetails.route.origin}
                          </Typography>
                        </Box>
                        <Divider />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Điểm đến
                          </Typography>
                          <Typography variant="body2">
                            {driverDetails.route.destination}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                          <Typography variant="caption">
                            📏 {driverDetails.route.estimatedDistance} km
                          </Typography>
                          <Typography variant="caption">
                            ⏱️ ~{driverDetails.route.estimatedDuration} phút
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Notes */}
                  {schedule.notes && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Ghi chú
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        p: 1.5, 
                        bgcolor: 'warning.lighter',
                        borderRadius: 1,
                        mt: 0.5,
                      }}>
                        {schedule.notes}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })
      )}
    </Box>
  );
};
