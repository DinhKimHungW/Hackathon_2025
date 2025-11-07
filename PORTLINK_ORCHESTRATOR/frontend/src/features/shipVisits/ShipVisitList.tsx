import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Pagination,
  Alert,
  Container,
  ToggleButton,
  ToggleButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Add, Refresh, GetApp, FilterList, FilterAlt, DirectionsBoat } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  fetchShipVisits,
  setFilters,
  setPagination,
  selectShipVisits,
  selectShipVisitsLoading,
  selectShipVisitsError,
  selectShipVisitsFilters,
  selectShipVisitsPagination,
  type ShipVisit,
} from './shipVisitsSlice';
import ShipVisitCard from './components/ShipVisitCard';
import ShipVisitListItem from './components/ShipVisitListItem';
import ShipVisitTable from './components/ShipVisitTable';
import ShipVisitFilters from './components/ShipVisitFilters';
import ShipVisitFiltersAdvanced from './components/ShipVisitFiltersAdvanced';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import FilterPresetsDialog, { type FilterPreset } from './components/FilterPresetsDialog';
import ViewToggle, { type ViewMode } from '@/components/common/ViewToggle';
import EmptyState from '@/components/common/EmptyState';
import { useShipVisitSocket } from './hooks/useShipVisitSocket';
import { selectIsAuthenticated } from '../auth/authSlice';

export default function ShipVisitList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [presetsDialogOpen, setPresetsDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Check authentication status
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // WebSocket integration for real-time updates
  const { isConnected } = useShipVisitSocket({ enabled: isAuthenticated });


  const shipVisits = useAppSelector(selectShipVisits);
  const loading = useAppSelector(selectShipVisitsLoading);
  const error = useAppSelector(selectShipVisitsError);
  const filters = useAppSelector(selectShipVisitsFilters);
  const pagination = useAppSelector(selectShipVisitsPagination);

  // Fetch ship visits on mount and when filters/pagination change
  // Only fetch if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchShipVisits());
    }
  }, [dispatch, isAuthenticated, filters, pagination.page, pagination.limit]);

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setPagination({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    dispatch(fetchShipVisits());
  };

  const handleNewShipVisit = () => {
    navigate('/ship-visits/new');
  };

  const handleViewShipVisit = (id: string) => {
    navigate(`/ship-visits/${id}`);
  };

  const handleEditShipVisit = (id: string) => {
    navigate(`/ship-visits/${id}/edit`);
  };

  const handleExport = () => {
    // TODO: Implement CSV/PDF export
    console.log('Export functionality coming soon');
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    setSelectedIds(shipVisits.map((sv: ShipVisit) => sv.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement bulk delete API call
    console.log('Deleting:', selectedIds);
    setSelectedIds([]);
    setConfirmDeleteOpen(false);
  };

  const handleBulkExport = () => {
    // TODO: Implement bulk export
    const selectedVisits = shipVisits.filter((sv: ShipVisit) => selectedIds.includes(sv.id));
    console.log('Exporting:', selectedVisits);
  };

  const handleBulkStatusChange = () => {
    // TODO: Implement status change dialog
    console.log('Change status for:', selectedIds);
  };

  const handleBulkAssignBerth = () => {
    // TODO: Implement berth assignment dialog
    console.log('Assign berth for:', selectedIds);
  };

  // Filter presets handlers
  const handleApplyPreset = (preset: FilterPreset) => {
    // Map preset filters to Redux filter format
    const reduxFilters: Partial<typeof filters> = {
      search: preset.filters.search || '',
      dateRange: preset.filters.dateRange || { start: null, end: null },
      // Note: status/shipType/berth arrays not yet supported in Redux
      // Will need to update shipVisitsSlice to support multi-select
    };
    dispatch(setFilters(reduxFilters));
    setPresetsDialogOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Ship Visits
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1" color="text.secondary">
                Manage all ship arrivals and departures
              </Typography>
              {isConnected && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: 'success.lighter',
                    border: '1px solid',
                    borderColor: 'success.light',
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.5 },
                      },
                    }}
                  />
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    Live
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ViewToggle view={viewMode} onChange={setViewMode} />

            <ToggleButtonGroup
              value={useAdvancedFilters ? 'advanced' : 'basic'}
              exclusive
              onChange={(_, value) => {
                if (value !== null) {
                  setUseAdvancedFilters(value === 'advanced');
                }
              }}
              size="small"
            >
              <ToggleButton value="basic">
                <FilterList fontSize="small" sx={{ mr: 0.5 }} />
                Basic
              </ToggleButton>
              <ToggleButton value="advanced">
                <FilterAlt fontSize="small" sx={{ mr: 0.5 }} />
                Advanced
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={handleExport}
            >
              Export
            </Button>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleNewShipVisit}
            >
              New Ship Visit
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters */}
      {useAdvancedFilters ? (
        <ShipVisitFiltersAdvanced
          filters={filters}
          onFilterChange={handleFilterChange}
          onOpenPresets={() => setPresetsDialogOpen(true)}
        />
      ) : (
        <ShipVisitFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.length}
        totalCount={shipVisits.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkAssignBerth={handleBulkAssignBerth}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(setFilters({ ...filters }))}>
          {error}
        </Alert>
      )}

      {/* Ship Visits - Grid/List/Table View */}
      {loading && shipVisits.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="body1" color="text.secondary">
            Loading ship visits...
          </Typography>
        </Box>
      ) : shipVisits.length === 0 ? (
        <EmptyState
          type={filters.search || filters.status !== 'ALL' ? 'no-results' : 'no-data'}
          icon={<DirectionsBoat />}
          title={filters.search || filters.status !== 'ALL' 
            ? 'No ship visits found' 
            : 'No ship visits yet'}
          description={filters.search || filters.status !== 'ALL'
            ? 'Try adjusting your filters to see more results'
            : 'Create your first ship visit to get started managing port operations'}
          action={filters.search || filters.status !== 'ALL' ? undefined : {
            label: 'Create Ship Visit',
            onClick: handleNewShipVisit,
            icon: <Add />
          }}
          secondaryAction={filters.search || filters.status !== 'ALL' ? {
            label: 'Clear Filters',
            onClick: () => dispatch(setFilters({ search: '', status: 'ALL' }))
          } : undefined}
        />
      ) : (
        <>
          {/* Grid View */}
          {viewMode === 'grid' && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {shipVisits.map((shipVisit: ShipVisit) => (
                <ShipVisitCard
                  key={shipVisit.id}
                  shipVisit={shipVisit}
                  onView={handleViewShipVisit}
                  onEdit={handleEditShipVisit}
                  loading={loading}
                  selected={selectedIds.includes(shipVisit.id)}
                  onSelect={() => handleToggleSelection(shipVisit.id)}
                  selectionMode={selectedIds.length > 0}
                />
              ))}
            </Box>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Box>
              {shipVisits.map((shipVisit: ShipVisit) => (
                <ShipVisitListItem
                  key={shipVisit.id}
                  shipVisit={shipVisit}
                  onView={handleViewShipVisit}
                  onEdit={handleEditShipVisit}
                  selected={selectedIds.includes(shipVisit.id)}
                  onSelect={() => handleToggleSelection(shipVisit.id)}
                  selectionMode={selectedIds.length > 0}
                />
              ))}
            </Box>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <ShipVisitTable
              shipVisits={shipVisits}
              onView={handleViewShipVisit}
              onEdit={handleEditShipVisit}
              loading={loading}
              selectedIds={selectedIds}
              onToggleSelection={handleToggleSelection}
              selectionMode={selectedIds.length > 0}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}

          {/* Results Summary */}
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ mt: 2 }}
          >
            Showing {(pagination.page - 1) * pagination.limit + 1} -{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} ship visits
          </Typography>
        </>
      )}

      {/* Filter Presets Dialog */}
      <FilterPresetsDialog
        open={presetsDialogOpen}
        onClose={() => setPresetsDialogOpen(false)}
        currentFilters={filters}
        onApplyPreset={handleApplyPreset}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedIds.length} ship visit
            {selectedIds.length === 1 ? '' : 's'}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
