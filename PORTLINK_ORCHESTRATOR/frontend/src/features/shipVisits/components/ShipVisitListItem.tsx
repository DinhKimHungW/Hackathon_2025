import { memo, useCallback, useMemo } from 'react';
import {
  Paper,
  Box,
  Typography,
  Chip,
  IconButton,
  Avatar,
  LinearProgress,
  Tooltip,
  Checkbox,
} from '@mui/material';
import {
  DirectionsBoat,
  Edit,
  Visibility,
  Schedule,
  Anchor,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { ShipVisit } from '../shipVisitsSlice';
import colors, { statusColors } from '@/theme/colors';

interface ShipVisitListItemProps {
  shipVisit: ShipVisit;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  selected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
}

function ShipVisitListItem({ 
  shipVisit, 
  onView, 
  onEdit,
  selected = false,
  onSelect,
  selectionMode = false,
}: ShipVisitListItemProps) {
  // Memoize status color lookup
  const statusColor = useMemo(
    () => statusColors[shipVisit.status] || colors.gray[500],
    [shipVisit.status]
  );

  // Memoize progress calculation
  const progress = useMemo(() => {
    // Cast to string to allow matching legacy status values that are
    // not part of the current ShipVisitStatus union.
    const s = shipVisit.status as string;
    switch (s) {
      case 'PLANNED':
      case 'SCHEDULED':
        return 10;
      case 'ARRIVED':
        return 30;
      case 'BERTHING':
      case 'IN_PROGRESS':
        return 50;
      case 'LOADING':
      case 'UNLOADING':
        return 70;
      case 'COMPLETED':
      case 'DEPARTED':
        return 100;
      case 'CANCELLED':
        return 0;
      default:
        return 0;
    }
  }, [shipVisit.status]);

  // Stable callbacks to prevent child re-renders
  const handleView = useCallback(() => {
    onView(shipVisit.id);
  }, [onView, shipVisit.id]);

  const handleEdit = useCallback(() => {
    onEdit(shipVisit.id);
  }, [onEdit, shipVisit.id]);

  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.();
  }, [onSelect]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        border: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: statusColor,
          boxShadow: 2,
          transform: 'translateX(4px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Selection Checkbox */}
        {selectionMode && onSelect && (
          <Checkbox
            checked={selected}
            onChange={onSelect}
            onClick={handleSelectClick}
          />
        )}

        {/* Ship Icon */}
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: `${statusColor}20`,
            color: statusColor,
          }}
        >
          <DirectionsBoat fontSize="large" />
        </Avatar>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Header Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h6" fontWeight={600} noWrap>
              {shipVisit.shipName}
            </Typography>
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
            <Chip
              label={shipVisit.shipType ?? shipVisit.vesselType}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          </Box>

          {/* Info Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Anchor fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {shipVisit.berth ?? shipVisit.berthName ?? 'No berth assigned'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Schedule fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {shipVisit.eta ? format(new Date(shipVisit.eta), 'MMM dd, HH:mm') : 'No ETA'}
              </Typography>
            </Box>
            {shipVisit.etd && (
              <Typography variant="body2" color="text.secondary">
                → {format(new Date(shipVisit.etd), 'MMM dd, HH:mm')}
              </Typography>
            )}
          </Box>

          {/* Progress Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                bgcolor: `${statusColor}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: statusColor,
                  borderRadius: 3,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {progress}%
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details" arrow>
            <IconButton
              size="small"
              onClick={handleView}
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
              onClick={handleEdit}
              sx={{
                bgcolor: `${colors.sunset[500]}20`,
                '&:hover': { bgcolor: colors.sunset[500], color: 'white' },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
}

// Export memoized version - only re-renders when props change
export default memo(ShipVisitListItem);
