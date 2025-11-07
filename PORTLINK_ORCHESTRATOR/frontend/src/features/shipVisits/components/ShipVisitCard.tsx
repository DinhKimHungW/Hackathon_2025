import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Skeleton,
  Tooltip,
  Divider,
  Checkbox,
} from '@mui/material';
import {
  DirectionsBoat,
  Edit,
  Visibility,
  LocationOn,
  Schedule,
  LocalShipping,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { ShipVisit } from '../shipVisitsSlice';
import StatusBadge from './StatusBadge';

interface ShipVisitCardProps {
  shipVisit: ShipVisit;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  loading?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
}

export default function ShipVisitCard({ 
  shipVisit, 
  onView, 
  onEdit, 
  loading = false,
  selected = false,
  onSelect,
  selectionMode = false,
}: ShipVisitCardProps) {
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="text" width="40%" height={24} sx={{ mt: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        border: selected ? 2 : 0,
        borderColor: selected ? 'primary.main' : 'transparent',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        cursor: 'pointer',
      }}
      onClick={() => onView(shipVisit.id)}
    >
      {/* Selection Checkbox */}
      {selectionMode && onSelect && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          <Checkbox checked={selected} />
        </Box>
      )}

      {/* Ship Icon Watermark */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          opacity: 0.1,
          fontSize: 80,
          color: '#1976d2',
        }}
      >
        <DirectionsBoat sx={{ fontSize: 80 }} />
      </Box>

      <CardContent sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {/* Ship Name & Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
              {shipVisit.shipName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              IMO: {shipVisit.imoNumber}
            </Typography>
          </Box>
          <StatusBadge status={shipVisit.status} size="small" />
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Vessel Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocalShipping sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {shipVisit.vesselType} | {shipVisit.flag}
            </Typography>
          </Box>

          {shipVisit.berthName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Berth: {shipVisit.berthName}
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              ETA: {format(new Date(shipVisit.eta), 'MMM dd, HH:mm')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ETD: {format(new Date(shipVisit.etd), 'MMM dd, HH:mm')}
            </Typography>
          </Box>
        </Box>

        {/* Cargo Info */}
        {shipVisit.cargoType && (
          <Box
            sx={{
              bgcolor: 'action.hover',
              p: 1,
              borderRadius: 1,
              mt: 2,
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              Cargo: {shipVisit.cargoType}
              {shipVisit.cargoQuantity && shipVisit.cargoUnit && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({shipVisit.cargoQuantity} {shipVisit.cargoUnit})
                </Typography>
              )}
            </Typography>
          </Box>
        )}

        {/* Purpose */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Purpose: {shipVisit.visitPurpose}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          justifyContent: 'flex-end',
          px: 2,
          pb: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking actions
      >
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onView(shipVisit.id)}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit">
          <IconButton
            size="small"
            color="secondary"
            onClick={() => onEdit(shipVisit.id)}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
