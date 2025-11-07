import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  DirectionsBoat,
  LocationOn,
  CalendarToday,
  Anchor,
  Flight,
  LocalShipping,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchShipVisitById,
  deleteShipVisit,
  clearCurrentShipVisit,
} from './shipVisitsSlice';
import { selectIsAuthenticated } from '../auth/authSlice';
import StatusBadge from './components/StatusBadge';
import ShipVisitTimeline from './components/ShipVisitTimeline';
import { useShipVisitSocket } from './hooks/useShipVisitSocket';
import { format } from 'date-fns';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ship-visit-tabpanel-${index}`}
      aria-labelledby={`ship-visit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ShipVisitDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Check authentication status
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const { currentShipVisit, loading, error } = useAppSelector(
    (state) => state.shipVisits
  );

  // WebSocket integration for real-time updates
  useShipVisitSocket({ enabled: isAuthenticated });

  useEffect(() => {
    if (id && isAuthenticated) {
      dispatch(fetchShipVisitById(id));
    }

    return () => {
      dispatch(clearCurrentShipVisit());
    };
  }, [dispatch, id, isAuthenticated]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    if (currentShipVisit) {
      navigate(`/ship-visits/${currentShipVisit.id}/edit`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentShipVisit) {
      await dispatch(deleteShipVisit(currentShipVisit.id));
      setDeleteDialogOpen(false);
      navigate('/ship-visits');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleBack = () => {
    navigate('/ship-visits');
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Ship Visits
        </Button>
      </Box>
    );
  }

  if (!currentShipVisit) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Ship visit not found
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={handleBack}
        >
          Back to Ship Visits
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {currentShipVisit.shipName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            IMO: {currentShipVisit.imoNumber}
          </Typography>
        </Box>
        <StatusBadge status={currentShipVisit.status} size="medium" showIcon />
        <Button
          variant="outlined"
          startIcon={<Edit />}
          onClick={handleEdit}
          sx={{ mr: 1 }}
        >
          Edit
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<Delete />}
          onClick={handleDeleteClick}
        >
          Delete
        </Button>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="ship visit tabs"
          >
            <Tab label="Overview" id="ship-visit-tab-0" />
            <Tab label="Timeline" id="ship-visit-tab-1" />
            <Tab label="Cargo" id="ship-visit-tab-2" />
            <Tab label="Documents" id="ship-visit-tab-3" />
          </Tabs>
        </Box>

        {/* Tab Panel 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsBoat />
              Ship Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Ship Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.shipName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  IMO Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.imoNumber}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Vessel Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.vesselType || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Flag
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.flag || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Gross Tonnage
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.grossTonnage?.toLocaleString() || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
              <CalendarToday />
              Visit Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Purpose
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.visitPurpose || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Berth
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight="medium">
                    {currentShipVisit.berthName || 'Not Assigned'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusBadge status={currentShipVisit.status} size="small" showIcon />
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ETA (Estimated Time of Arrival)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Anchor fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight="medium">
                    {currentShipVisit.eta
                      ? format(new Date(currentShipVisit.eta), 'PPp')
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  ETD (Estimated Time of Departure)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Flight fontSize="small" color="action" />
                  <Typography variant="body1" fontWeight="medium">
                    {currentShipVisit.etd
                      ? format(new Date(currentShipVisit.etd), 'PPp')
                      : 'N/A'}
                  </Typography>
                </Box>
              </Box>
              {currentShipVisit.actualArrival && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Actual Arrival Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    {format(new Date(currentShipVisit.actualArrival), 'PPp')}
                  </Typography>
                </Box>
              )}
              {currentShipVisit.actualDeparture && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Actual Departure Time
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="info.main">
                    {format(new Date(currentShipVisit.actualDeparture), 'PPp')}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </TabPanel>

        {/* Tab Panel 2: Timeline */}
        <TabPanel value={tabValue} index={1}>
          <CardContent>
            <ShipVisitTimeline
              events={[
                {
                  id: '1',
                  timestamp: currentShipVisit.createdAt,
                  status: 'PLANNED',
                  description: 'Ship visit created',
                  isSystemEvent: true,
                },
                ...(currentShipVisit.actualArrival
                  ? [
                      {
                        id: '2',
                        timestamp: currentShipVisit.actualArrival,
                        status: 'ARRIVED' as const,
                        description: 'Ship arrived at berth',
                        isSystemEvent: false,
                        user: {
                          id: currentShipVisit.createdBy || 'system',
                          name: 'Port Officer',
                        },
                      },
                    ]
                  : []),
                ...(currentShipVisit.actualDeparture
                  ? [
                      {
                        id: '3',
                        timestamp: currentShipVisit.actualDeparture,
                        status: 'DEPARTED' as const,
                        description: 'Ship departed from berth',
                        isSystemEvent: false,
                        user: {
                          id: currentShipVisit.createdBy || 'system',
                          name: 'Port Officer',
                        },
                      },
                    ]
                  : []),
              ]}
              shipVisitId={currentShipVisit.id}
            />
          </CardContent>
        </TabPanel>

        {/* Tab Panel 3: Cargo */}
        <TabPanel value={tabValue} index={2}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalShipping />
              Cargo Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Cargo Type
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.cargoType || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {currentShipVisit.cargoQuantity
                    ? `${currentShipVisit.cargoQuantity.toLocaleString()} ${
                        currentShipVisit.cargoUnit || ''
                      }`
                    : 'N/A'}
                </Typography>
              </Box>
              {currentShipVisit.specialNotes && (
                <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary">
                    Special Notes
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {currentShipVisit.specialNotes}
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </TabPanel>

        {/* Tab Panel 4: Documents */}
        <TabPanel value={tabValue} index={3}>
          <CardContent>
            <Alert severity="info">
              Document upload feature will be implemented in future phases
            </Alert>
          </CardContent>
        </TabPanel>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Delete Ship Visit</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the ship visit for{' '}
            <strong>{currentShipVisit?.shipName}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShipVisitDetail;
