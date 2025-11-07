import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  Typography,
  Checkbox,
  Toolbar,
  Tooltip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Build as MaintenanceIcon,
  PlayArrow as ActivateIcon,
  Pause as DeactivateIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAssets, deleteAsset } from './assetsSlice';
import type { Asset, AssetStatus, AssetType } from './assetsSlice';

// ==================== TYPES ====================

type Order = 'asc' | 'desc';
type OrderBy = 'assetCode' | 'name' | 'type' | 'status' | 'location' | 'utilizationRate';

interface HeadCell {
  id: OrderBy;
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'assetCode', label: 'Asset Code', sortable: true },
  { id: 'name', label: 'Name', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'location', label: 'Location', sortable: true },
  { id: 'utilizationRate', label: 'Utilization', sortable: true },
];

// ==================== HELPER FUNCTIONS ====================

const getStatusColor = (status: AssetStatus): 'success' | 'primary' | 'warning' | 'default' => {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'IN_USE':
      return 'primary';
    case 'MAINTENANCE':
      return 'warning';
    case 'OFFLINE':
      return 'default';
    default:
      return 'default';
  }
};

const getTypeIcon = (type: AssetType): string => {
  switch (type) {
    case 'CRANE':
      return '🏗️';
    case 'TRUCK':
      return '🚛';
    case 'REACH_STACKER':
      return '🏋️';
    case 'FORKLIFT':
      return '🏴';
    case 'YARD_TRACTOR':
      return '🚜';
    case 'OTHER':
      return '🔧';
    default:
      return '📦';
  }
};

const isMaintenanceDue = (asset: Asset): boolean => {
  if (!asset.nextMaintenanceDate) return false;
  const dueDate = new Date(asset.nextMaintenanceDate);
  const now = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilDue <= 7; // Due within 7 days
};

// ==================== TABLE HEAD COMPONENT ====================

interface EnhancedTableHeadProps {
  numSelected: number;
  order: Order;
  orderBy: OrderBy;
  rowCount: number;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRequestSort: (property: OrderBy) => void;
}

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = ({
  numSelected,
  order,
  orderBy,
  rowCount,
  onSelectAllClick,
  onRequestSort,
}) => {
  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} sortDirection={orderBy === headCell.id ? order : false}>
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={() => onRequestSort(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
  );
};

// ==================== TOOLBAR COMPONENT ====================

interface EnhancedTableToolbarProps {
  numSelected: number;
  onDeleteSelected: () => void;
  onExport: () => void;
}

const EnhancedTableToolbar: React.FC<EnhancedTableToolbarProps> = ({
  numSelected,
  onDeleteSelected,
  onExport,
}) => {
  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
          Assets
        </Typography>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={onDeleteSelected} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Export to CSV">
          <IconButton onClick={onExport}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

// ==================== MAIN COMPONENT ====================

interface AssetListProps {
  onEditAsset: (asset: Asset) => void;
  onViewAsset: (asset: Asset) => void;
  onMaintenanceAsset: (asset: Asset) => void;
  onActivateAsset: (asset: Asset) => void;
  onDeactivateAsset: (asset: Asset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  onEditAsset,
  onViewAsset,
  onMaintenanceAsset,
  onActivateAsset,
  onDeactivateAsset,
}) => {
  const dispatch = useAppDispatch();
  const { assets, loading } = useAppSelector((state) => state.assets);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('assetCode');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAssets({}));
    }
  }, [dispatch, isAuthenticated]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = assets.map((asset) => asset.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (assetId: string) => {
    const selectedIndex = selected.indexOf(assetId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, assetId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await dispatch(deleteAsset(assetId));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} assets?`)) {
      for (const assetId of selected) {
        await dispatch(deleteAsset(assetId));
      }
      setSelected([]);
    }
  };

  const handleExport = () => {
    const headers = ['Asset Code', 'Name', 'Type', 'Status', 'Location', 'Capacity', 'Utilization Rate', 'Last Maintenance', 'Next Maintenance'];
    const csvContent = [
      headers.join(','),
      ...assets.map((asset) =>
        [
          asset.assetCode,
          asset.name,
          asset.type,
          asset.status,
          asset.location || 'N/A',
          asset.capacity ? `${asset.capacity} ${asset.capacityUnit || ''}` : 'N/A',
          asset.utilizationRate ? `${asset.utilizationRate}%` : 'N/A',
          asset.lastMaintenanceDate ? format(new Date(asset.lastMaintenanceDate), 'yyyy-MM-dd') : 'N/A',
          asset.nextMaintenanceDate ? format(new Date(asset.nextMaintenanceDate), 'yyyy-MM-dd') : 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const isSelected = (assetId: string) => selected.indexOf(assetId) !== -1;

  // Sort assets
  const sortedAssets = [...assets].sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    // Handle null values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedAssets = sortedAssets.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%' }}>
      <EnhancedTableToolbar
        numSelected={selected.length}
        onDeleteSelected={handleDeleteSelected}
        onExport={handleExport}
      />
      <TableContainer>
        <Table>
          <EnhancedTableHead
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            rowCount={assets.length}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedAssets.map((asset) => {
              const isItemSelected = isSelected(asset.id);
              const maintenanceDue = isMaintenanceDue(asset);

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={asset.id}
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox" onClick={() => handleClick(asset.id)}>
                    <Checkbox color="primary" checked={isItemSelected} />
                  </TableCell>
                  <TableCell onClick={() => onViewAsset(asset)}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {asset.assetCode}
                    </Typography>
                    {maintenanceDue && (
                      <Chip
                        icon={<WarningIcon />}
                        label="Maintenance Due"
                        size="small"
                        color="warning"
                        sx={{ mt: 0.5 }}
                      />
                    )}
                  </TableCell>
                  <TableCell onClick={() => onViewAsset(asset)}>
                    <Typography variant="body2">
                      {getTypeIcon(asset.type)} {asset.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={asset.type.replace('_', ' ')}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={asset.status} size="small" color={getStatusColor(asset.status)} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{asset.location || '-'}</Typography>
                  </TableCell>
                  <TableCell>
                    {asset.utilizationRate !== null ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={asset.utilizationRate}
                          sx={{ width: 60, height: 8, borderRadius: 1 }}
                          color={
                            asset.utilizationRate > 80
                              ? 'success'
                              : asset.utilizationRate > 50
                              ? 'primary'
                              : 'warning'
                          }
                        />
                        <Typography variant="caption">{asset.utilizationRate}%</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onViewAsset(asset)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Asset">
                        <IconButton size="small" onClick={() => onEditAsset(asset)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {asset.status === 'AVAILABLE' && (
                        <Tooltip title="Set to Maintenance">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => onMaintenanceAsset(asset)}
                          >
                            <MaintenanceIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {asset.status === 'OFFLINE' && (
                        <Tooltip title="Activate Asset">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onActivateAsset(asset)}
                          >
                            <ActivateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(asset.status === 'AVAILABLE' || asset.status === 'IN_USE') && (
                        <Tooltip title="Deactivate Asset">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDeactivateAsset(asset)}
                          >
                            <DeactivateIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Asset">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteAsset(asset.id)}
                        >
                          <DeleteIcon fontSize="small" />
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
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={assets.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default AssetList;
