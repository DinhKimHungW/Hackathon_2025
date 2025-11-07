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
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Cancel as CriticalIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchEventLogs, deleteEventLog } from './eventLogsSlice';
import type { EventLog, EventSeverity, EventType } from './eventLogsSlice';

interface EventLogListProps {
  onView?: (eventLog: EventLog) => void;
  onDelete?: (eventLogId: string) => void;
}

export const EventLogList: React.FC<EventLogListProps> = ({ onView, onDelete }) => {
  const dispatch = useAppDispatch();
  const { eventLogs, loading, pagination } = useAppSelector((state) => state.eventLogs);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  useEffect(() => {
    dispatch(fetchEventLogs({ page: page + 1, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelected(eventLogs.map((e) => e.id));
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
    if (window.confirm(`Delete ${selected.length} event logs?`)) {
      await Promise.all(selected.map((id) => dispatch(deleteEventLog(id))));
      setSelected([]);
      dispatch(fetchEventLogs({ page: page + 1, limit: rowsPerPage }));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this event log?')) {
      await dispatch(deleteEventLog(id));
      if (onDelete) onDelete(id);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Time', 'Event Type', 'Severity', 'User', 'Entity', 'Description', 'IP Address'].join(','),
      ...eventLogs.map((e) =>
        [
          e.createdAt,
          e.eventType,
          e.severity,
          e.user?.username || 'System',
          e.entityType || 'N/A',
          `"${e.description.replace(/"/g, '""')}"`,
          e.ipAddress || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: EventSeverity) => {
    switch (severity) {
      case 'INFO':
        return 'info';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'CRITICAL':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity: EventSeverity) => {
    switch (severity) {
      case 'INFO':
        return <InfoIcon fontSize="small" />;
      case 'WARNING':
        return <WarningIcon fontSize="small" />;
      case 'ERROR':
        return <ErrorIcon fontSize="small" />;
      case 'CRITICAL':
        return <CriticalIcon fontSize="small" />;
      default:
        return <InfoIcon fontSize="small" />;
    }
  };

  const getEventTypeLabel = (type: EventType) => {
    const labels: Record<EventType, string> = {
      USER_LOGIN: '🔓 User Login',
      USER_LOGOUT: '🔒 User Logout',
      ASSET_UPDATE: '🔧 Asset Update',
      SCHEDULE_CREATE: '📅 Schedule Created',
      SCHEDULE_UPDATE: '📝 Schedule Updated',
      TASK_CREATE: '✅ Task Created',
      TASK_UPDATE: '📝 Task Updated',
      SIMULATION_START: '▶️ Simulation Started',
      SIMULATION_COMPLETE: '✔️ Simulation Complete',
      CONFLICT_DETECTED: '⚠️ Conflict Detected',
      CONFLICT_RESOLVED: '✅ Conflict Resolved',
      SYSTEM_ERROR: '❌ System Error',
      DATA_EXPORT: '📤 Data Export',
      DATA_IMPORT: '📥 Data Import',
    };
    return labels[type] || type;
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
              Event Logs
            </Typography>
            <Tooltip title="Export CSV">
              <IconButton onClick={handleExport}>
                <ExportIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Toolbar>

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedCount > 0 && selectedCount < eventLogs.length}
                  checked={eventLogs.length > 0 && selectedCount === eventLogs.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : eventLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No event logs found
                </TableCell>
              </TableRow>
            ) : (
              eventLogs.map((eventLog) => {
                const selected = isSelected(eventLog.id);
                return (
                  <TableRow key={eventLog.id} hover selected={selected}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected} onChange={() => handleSelect(eventLog.id)} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {format(new Date(eventLog.createdAt), 'MMM d, HH:mm:ss')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(eventLog.severity)}
                        label={eventLog.severity}
                        color={getSeverityColor(eventLog.severity) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {getEventTypeLabel(eventLog.eventType)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {eventLog.user?.username || 'System'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                        {eventLog.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap>
                        {eventLog.entityType || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {onView && (
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => onView(eventLog)}>
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDelete(eventLog.id)}>
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
        rowsPerPageOptions={[25, 50, 100, 200]}
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

export default EventLogList;
