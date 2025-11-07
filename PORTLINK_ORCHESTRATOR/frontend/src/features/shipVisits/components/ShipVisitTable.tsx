import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  LinearProgress,
  Typography,
  Checkbox,
} from '@mui/material';
import { Edit, Visibility, DirectionsBoat } from '@mui/icons-material';
import { format } from 'date-fns';
import type { ShipVisit } from '../shipVisitsSlice';
import colors, { statusColors } from '@/theme/colors';

interface ShipVisitTableProps {
  shipVisits: ShipVisit[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  loading?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
  selectionMode?: boolean;
}

export default function ShipVisitTable({ 
  shipVisits, 
  onView, 
  onEdit, 
  loading,
  selectedIds = [],
  onToggleSelection,
  selectionMode = false,
}: ShipVisitTableProps) {
  const getProgress = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 10;
      case 'ARRIVED': return 30;
      case 'BERTHING': return 50;
      case 'LOADING': return 70;
      case 'UNLOADING': return 70;
      case 'DEPARTED': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <LinearProgress />
        <Box sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Loading ship visits...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            {/* Selection column */}
            {selectionMode && onToggleSelection && (
              <TableCell padding="checkbox">
                {/* Header checkbox can be added for select all */}
              </TableCell>
            )}
            <TableCell width={50}></TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                Ship Name
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                Type
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                Status
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                Berth
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                ETA
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                ETD
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant="subtitle2" fontWeight={700}>
                Progress
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2" fontWeight={700}>
                Actions
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shipVisits.map((shipVisit) => {
            const statusColor = statusColors[shipVisit.status] || colors.gray[500];
            const progress = getProgress(shipVisit.status);
            const isSelected = selectedIds.includes(shipVisit.id);

            return (
              <TableRow
                key={shipVisit.id}
                hover
                selected={isSelected}
                sx={{
                  '&:hover': {
                    bgcolor: `${statusColor}08`,
                  },
                  cursor: 'pointer',
                }}
                onClick={() => onView(shipVisit.id)}
              >
                {/* Selection Checkbox */}
                {selectionMode && onToggleSelection && (
                  <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onChange={() => onToggleSelection(shipVisit.id)}
                    />
                  </TableCell>
                )}

                {/* Icon */}
                <TableCell>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: `${statusColor}20`,
                      color: statusColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DirectionsBoat fontSize="small" />
                  </Box>
                </TableCell>

                {/* Ship Name */}
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {shipVisit.shipName}
                  </Typography>
                </TableCell>

                {/* Ship Type */}
                <TableCell>
                  <Chip
                    label={shipVisit.shipType}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1 }}
                  />
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Chip
                    label={shipVisit.status}
                    size="small"
                    sx={{
                      bgcolor: `${statusColor}20`,
                      color: statusColor,
                      fontWeight: 600,
                      borderRadius: 1,
                    }}
                  />
                </TableCell>

                {/* Berth */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {shipVisit.berth || '-'}
                  </Typography>
                </TableCell>

                {/* ETA */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {shipVisit.eta ? format(new Date(shipVisit.eta), 'MMM dd, HH:mm') : '-'}
                  </Typography>
                </TableCell>

                {/* ETD */}
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {shipVisit.etd ? format(new Date(shipVisit.etd), 'MMM dd, HH:mm') : '-'}
                  </Typography>
                </TableCell>

                {/* Progress */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        width: 80,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: `${statusColor}20`,
                        '& .MuiLinearProgress-bar': {
                          bgcolor: statusColor,
                          borderRadius: 3,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ minWidth: 32 }}>
                      {progress}%
                    </Typography>
                  </Box>
                </TableCell>

                {/* Actions */}
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="View Details" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(shipVisit.id);
                        }}
                        sx={{
                          bgcolor: `${colors.ocean[500]}20`,
                          '&:hover': { bgcolor: colors.ocean[500], color: 'white' },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(shipVisit.id);
                        }}
                        sx={{
                          bgcolor: `${colors.sunset[500]}20`,
                          '&:hover': { bgcolor: colors.sunset[500], color: 'white' },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
