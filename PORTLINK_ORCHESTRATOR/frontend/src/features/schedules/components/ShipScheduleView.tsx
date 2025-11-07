/**
 * Ship Schedule View Component
 * Hiển thị lịch trình cho tàu/operations - thông tin cập bến và hoạt động
 */

import { Box, Card, CardContent, Typography, Chip, Stack, Divider, useTheme, useMediaQuery, LinearProgress } from '@mui/material';
import {
  DirectionsBoat as ShipIcon,
  Schedule as ScheduleIcon,
  Anchor as AnchorIcon,
  LocalShipping as CargoIcon,
  Engineering as ServiceIcon,
  Place as LocationIcon,
} from '@mui/icons-material';
import { format, differenceInHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { Schedule } from '../types';
import type { ShipScheduleDetails } from '../types/role-based';

interface ShipScheduleViewProps {
  schedules: Schedule[];
  onScheduleClick?: (schedule: Schedule) => void;
}

export const ShipScheduleView: React.FC<ShipScheduleViewProps> = ({
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
        return 'Chờ cập bến';
      case 'SCHEDULED':
        return 'Đã lên lịch';
      case 'IN_PROGRESS':
        return 'Đang neo đậu';
      case 'COMPLETED':
        return 'Đã rời bến';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // Mock ship details - sẽ được thay thế bằng data thực từ API
  const getShipDetails = (schedule: Schedule): ShipScheduleDetails => {
    const stayDuration = differenceInHours(
      new Date(schedule.endTime),
      new Date(schedule.startTime)
    );

    return {
      vesselName: schedule.shipVisit?.vesselName || 'Chưa xác định',
      vesselIMO: schedule.shipVisit?.vesselIMO || 'N/A',
      voyageNumber: schedule.shipVisit?.voyageNumber || 'N/A',
      berthingInfo: {
        berthLocation: schedule.berthName || schedule.shipVisit?.assignedBerth || 'Bến chưa xác định',
        arrivalTime: schedule.startTime,
        departureTime: schedule.endTime,
        estimatedStayDuration: stayDuration * 60, // convert to minutes
      },
      cargoOperations: schedule.tasks?.map((task, idx) => ({
        id: task.id,
        type: idx % 3 === 0 ? 'LOADING' : idx % 3 === 1 ? 'UNLOADING' : 'TRANSHIPMENT',
        containerCount: 50 + idx * 10,
        cargoType: 'Container',
        startTime: task.startTime,
        endTime: task.endTime,
        status: task.status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
      })) || [],
      portServices: {
        pilotRequired: schedule.resources?.pilotRequired || false,
        pilotName: schedule.resources?.pilotName,
        tugboatCount: schedule.resources?.tugboatCount || 0,
        mooringServices: true,
      },
      specialRequirements: schedule.notes ? [schedule.notes] : [],
    };
  };

  const getOperationTypeText = (type: string) => {
    switch (type) {
      case 'LOADING':
        return 'Bốc hàng';
      case 'UNLOADING':
        return 'Dỡ hàng';
      case 'TRANSHIPMENT':
        return 'Trung chuyển';
      default:
        return type;
    }
  };

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
              Không có lịch trình tàu
            </Typography>
          </CardContent>
        </Card>
      ) : (
        schedules.map((schedule) => {
          const shipDetails = getShipDetails(schedule);
          const completionPercentage = schedule.completionPercentage || 0;
          
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
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <ShipIcon color="primary" />
                      <Typography variant={isMobile ? "subtitle1" : "h6"}>
                        {shipDetails.vesselName}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip
                        label={getStatusText(schedule.status)}
                        color={getStatusColor(schedule.status)}
                        size="small"
                      />
                      <Chip
                        label={`IMO: ${shipDetails.vesselIMO}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`Voyage: ${shipDetails.voyageNumber}`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Box>
                </Box>

                {/* Progress bar nếu đang thực hiện */}
                {schedule.status === 'IN_PROGRESS' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tiến độ
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {completionPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={completionPercentage} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Thông tin cập bến */}
                <Stack spacing={2}>
                  {/* Bến neo đậu */}
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <AnchorIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Thông tin cập bến
                      </Typography>
                    </Stack>
                    <Box sx={{ 
                      p: 1.5, 
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Vị trí bến
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <LocationIcon fontSize="small" />
                            <Typography variant="body2" fontWeight={600}>
                              {shipDetails.berthingInfo.berthLocation}
                            </Typography>
                          </Stack>
                        </Box>
                        
                        <Divider />
                        
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                          <Box sx={{ flex: 1, minWidth: 150 }}>
                            <Typography variant="caption" color="text.secondary">
                              Thời gian cập bến
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(shipDetails.berthingInfo.arrivalTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ flex: 1, minWidth: 150 }}>
                            <Typography variant="caption" color="text.secondary">
                              Thời gian rời bến
                            </Typography>
                            <Typography variant="body2">
                              {format(new Date(shipDetails.berthingInfo.departureTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </Typography>
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Thời gian neo đậu dự kiến
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary">
                            {Math.floor(shipDetails.berthingInfo.estimatedStayDuration / 60)}h {shipDetails.berthingInfo.estimatedStayDuration % 60}m
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>

                  {/* Dịch vụ cảng */}
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                      <ServiceIcon fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary">
                        Dịch vụ cảng
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {shipDetails.portServices.pilotRequired && (
                        <Chip
                          label={`Hoa tiêu: ${shipDetails.portServices.pilotName || 'Chưa phân công'}`}
                          size="small"
                          color="info"
                        />
                      )}
                      {shipDetails.portServices.tugboatCount > 0 && (
                        <Chip
                          label={`${shipDetails.portServices.tugboatCount} Tàu lai dắt`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {shipDetails.portServices.mooringServices && (
                        <Chip
                          label="Dịch vụ neo đậu"
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Hoạt động hàng hóa */}
                  {shipDetails.cargoOperations.length > 0 && (
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                        <CargoIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Hoạt động hàng hóa
                        </Typography>
                      </Stack>
                      <Stack spacing={1}>
                        {shipDetails.cargoOperations.map((operation) => (
                          <Box 
                            key={operation.id}
                            sx={{ 
                              p: 1.5, 
                              bgcolor: 'background.default',
                              borderRadius: 1,
                              borderLeft: 4,
                              borderColor: operation.status === 'COMPLETED' ? 'success.main' : 
                                           operation.status === 'IN_PROGRESS' ? 'primary.main' : 'grey.300',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {getOperationTypeText(operation.type)}
                              </Typography>
                              <Chip
                                label={getStatusText(operation.status)}
                                size="small"
                                color={getStatusColor(operation.status)}
                              />
                            </Box>
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Typography variant="caption">
                                📦 {operation.containerCount} container
                              </Typography>
                              <Typography variant="caption">
                                🏷️ {operation.cargoType}
                              </Typography>
                              <Typography variant="caption">
                                ⏰ {format(new Date(operation.startTime), 'HH:mm')} - {format(new Date(operation.endTime), 'HH:mm')}
                              </Typography>
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Yêu cầu đặc biệt */}
                  {shipDetails.specialRequirements && shipDetails.specialRequirements.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Yêu cầu đặc biệt
                      </Typography>
                      <Box sx={{ 
                        p: 1.5, 
                        bgcolor: 'warning.lighter',
                        borderRadius: 1,
                        mt: 0.5,
                      }}>
                        {shipDetails.specialRequirements.map((req, idx) => (
                          <Typography key={idx} variant="body2">
                            • {req}
                          </Typography>
                        ))}
                      </Box>
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
