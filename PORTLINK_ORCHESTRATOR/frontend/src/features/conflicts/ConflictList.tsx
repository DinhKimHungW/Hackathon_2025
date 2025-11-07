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
  IconButton,
  Chip,
  Checkbox,
  Toolbar,
  Typography,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ResolveIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  GetApp as ExportIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchConflicts, deleteConflict, resolveConflict } from './conflictsSlice';
import type { Conflict, ConflictSeverity, ConflictType } from './conflictsSlice';

interface ConflictListProps {
  onView?: (conflict: Conflict) => void;
  onResolve?: (conflictId: string) => void;
  onDelete?: (conflictId: string) => void;
}

export const ConflictList: React.FC<ConflictListProps> = ({ onView, onResolve, onDelete }) => {
  const dispatch = useAppDispatch();
  const { conflicts, loading, pagination } = useAppSelector((state) => state.conflicts);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    dispatch(fetchConflicts({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(conflicts.map((c) => c.id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selected.length} conflicts?`)) {
      await Promise.all(selected.map((id) => dispatch(deleteConflict(id))));
      setSelected([]);
      dispatch(fetchConflicts({ page: page + 1, limit: rowsPerPage }));
    }
  };

  const handleResolve = async (id: string) => {
    await dispatch(resolveConflict({ id }));
    if (onResolve) onResolve(id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this conflict?')) {
      await dispatch(deleteConflict(id));
      if (onDelete) onDelete(id);
    }
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'Severity', 'Description', 'Conflict Time', 'Resolved', 'Created At'].join(','),
      ...conflicts.map((c) =>
        [
          c.id,
          c.conflictType,
          c.severity,
          `"${c.description.replace(/"/g, '""')}"`,
          c.conflictTime,
          c.resolved ? 'Yes' : 'No',
          c.createdAt,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conflicts-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'LOW':
        return 'info';
      case 'MEDIUM':
        return 'warning';
      case 'HIGH':
        return 'error';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: ConflictSeverity) => {
    switch (severity) {
      case 'LOW':
        return <InfoIcon fontSize="small" />;
      case 'MEDIUM':
        return <WarningIcon fontSize="small" />;
      case 'HIGH':
        return <ErrorIcon fontSize="small" />;
      case 'CRITICAL':
        return <ErrorIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getTypeLabel = (type: ConflictType) => {
    switch (type) {
      case 'RESOURCE_OVERLAP':
        return '🔧 Resource Overlap';
      case 'TIME_OVERLAP':
        return '⏰ Time Overlap';
      case 'LOCATION_OVERLAP':
        return '📍 Location Overlap';
      case 'CAPACITY_EXCEEDED':
        return '📊 Capacity Exceeded';
      default:
        return type;
    }
  };

  const isSelected = (id: string) => selected.includes(id);
  const selectedCount = selected.length;

  return (
    <Paper>
      {/* Toolbar */}
      <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
        {selectedCount > 0 ? (
          <>
            <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1">
              {selectedCount} selected
            </Typography>
            <Tooltip title="Delete">
              <IconButton onClick={handleBulkDelete}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <>
            <Typography sx={{ flex: '1 1 100%' }} variant="h6">
              Conflicts
            </Typography>
            <Tooltip title="Export CSV">
              <IconButton onClick={handleExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>

      {/* Critical Conflicts Alert */}
      {conflicts.some((c) => c.severity === 'CRITICAL' && !c.resolved) && (
        <Alert severity="error" sx={{ m: 2 }}>
          <strong>Critical Conflicts Detected!</strong> Immediate attention required for{' '}
          {conflicts.filter((c) => c.severity === 'CRITICAL' && !c.resolved).length} critical conflicts.
        </Alert>
      )}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedCount > 0 && selectedCount < conflicts.length}
                  checked={conflicts.length > 0 && selectedCount === conflicts.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Conflict Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : conflicts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No conflicts found
                </TableCell>
              </TableRow>
            ) : (
              conflicts.map((conflict) => {
                const selected = isSelected(conflict.id);
                return (
                  <TableRow key={conflict.id} hover selected={selected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected} onChange={() => handleSelect(conflict.id)} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(conflict.severity)}
                        label={conflict.severity}
                        color={getSeverityColor(conflict.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{getTypeLabel(conflict.conflictType)}</TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {conflict.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{format(new Date(conflict.conflictTime), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      {conflict.resolved ? (
                        <Chip label="Resolved" color="success" size="small" />
                      ) : (
                        <Chip label="Unresolved" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => onView(conflict)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {!conflict.resolved && (
                          <Tooltip title="Resolve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleResolve(conflict.id)}
                            >
                              <ResolveIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(conflict.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={pagination.total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default ConflictList;
