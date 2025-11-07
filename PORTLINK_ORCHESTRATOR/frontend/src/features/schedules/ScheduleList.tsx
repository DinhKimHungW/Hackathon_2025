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
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchSchedules, deleteSchedule } from './schedulesSlice';
import type { Schedule, ScheduleStatus, ScheduleType } from './types/index';

// ==================== TYPES ====================

type Order = 'asc' | 'desc';
type OrderBy = 'name' | 'type' | 'status' | 'startTime' | 'endTime';

interface HeadCell {
  id: OrderBy;
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'name', label: 'Schedule Name', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'startTime', label: 'Start Time', sortable: true },
  { id: 'endTime', label: 'End Time', sortable: true },
];

// ==================== HELPER FUNCTIONS ====================

const getStatusColor = (
  status: ScheduleStatus
): 'default' | 'primary' | 'success' | 'error' | 'info' | 'warning' => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SCHEDULED':
      return 'primary';
    case 'IN_PROGRESS':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

const getTypeIcon = (type: ScheduleType): string => {
  switch (type) {
    case 'SHIP_ARRIVAL':
      return '🚢';
    case 'MAINTENANCE':
      return '🔧';
    case 'PORT_OPERATION':
      return '⚓';
    default:
      return '📅';
  }
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
          Schedules
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

interface ScheduleListProps {
  onEditSchedule: (schedule: Schedule) => void;
  onViewSchedule: (schedule: Schedule) => void;
  onStartSchedule: (schedule: Schedule) => void;
  onCompleteSchedule: (schedule: Schedule) => void;
  onCancelSchedule: (schedule: Schedule) => void;
}

export const ScheduleList: React.FC<ScheduleListProps> = ({
  onEditSchedule,
  onViewSchedule,
  onStartSchedule,
  onCompleteSchedule,
  onCancelSchedule,
}) => {
  const dispatch = useAppDispatch();
  const { schedules, loading } = useAppSelector((state) => state.schedules);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const scheduleItems = Array.isArray(schedules) ? schedules : [];

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('startTime');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchSchedules());
    }
  }, [dispatch, isAuthenticated]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
  const newSelected = scheduleItems.map((schedule) => schedule.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (scheduleId: string) => {
    const selectedIndex = selected.indexOf(scheduleId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, scheduleId);
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

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      await dispatch(deleteSchedule(scheduleId));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} schedules?`)) {
      for (const scheduleId of selected) {
        await dispatch(deleteSchedule(scheduleId));
      }
      setSelected([]);
    }
  };

  const handleExport = () => {
    const headers = ['Name', 'Type', 'Status', 'Start Time', 'End Time', 'Berth', 'Ship Visit', 'Recurrence'];
    const csvContent = [
      headers.join(','),
      ...scheduleItems.map((schedule) =>
        [
          schedule.name,
          schedule.type,
          schedule.status,
          format(new Date(schedule.startTime), 'yyyy-MM-dd HH:mm'),
          format(new Date(schedule.endTime), 'yyyy-MM-dd HH:mm'),
          schedule.berthName || 'N/A',
          schedule.shipVisitName || 'N/A',
          schedule.recurrence,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedules-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const isSelected = (scheduleId: string) => selected.indexOf(scheduleId) !== -1;

  // Sort schedules
  const sortedSchedules = [...scheduleItems].sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    // Handle null values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Convert dates to timestamps
    if (orderBy === 'startTime' || orderBy === 'endTime') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedSchedules = sortedSchedules.slice(
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
            rowCount={scheduleItems.length}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedSchedules.map((schedule) => {
              const scheduleType =
                typeof schedule.type === 'string' ? schedule.type : 'PORT_OPERATION';
              const scheduleStatus =
                typeof schedule.status === 'string' ? schedule.status : 'SCHEDULED';
              const description =
                typeof schedule.description === 'string' ? schedule.description : '';
              const displayType = scheduleType.replace(/_/g, ' ');
              const isItemSelected = isSelected(schedule.id);
              const isPast = new Date(schedule.endTime) < new Date();

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={schedule.id}
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox" onClick={() => handleClick(schedule.id)}>
                    <Checkbox color="primary" checked={isItemSelected} />
                  </TableCell>
                  <TableCell onClick={() => onViewSchedule(schedule)}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getTypeIcon(scheduleType)} {schedule.name}
                    </Typography>
                    {description && (
                      <Typography variant="caption" color="text.secondary">
                        {description.substring(0, 50)}
                        {description.length > 50 ? '...' : ''}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{displayType}</TableCell>
                  <TableCell>
                    <Chip
                      label={scheduleStatus}
                      size="small"
                      color={getStatusColor(scheduleStatus)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(schedule.startTime), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(schedule.startTime), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: isPast && scheduleStatus !== 'COMPLETED' ? 'error.main' : 'text.primary',
                      }}
                    >
                      {format(new Date(schedule.endTime), 'MMM d, yyyy')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(schedule.endTime), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onViewSchedule(schedule)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Schedule">
                        <IconButton size="small" onClick={() => onEditSchedule(schedule)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {scheduleStatus === 'SCHEDULED' && (
                        <Tooltip title="Start Schedule">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onStartSchedule(schedule)}
                          >
                            <PlayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {scheduleStatus === 'IN_PROGRESS' && (
                        <Tooltip title="Complete Schedule">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onCompleteSchedule(schedule)}
                          >
                            <CompleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(scheduleStatus === 'SCHEDULED' || scheduleStatus === 'IN_PROGRESS') && (
                        <Tooltip title="Cancel Schedule">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onCancelSchedule(schedule)}
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Schedule">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteSchedule(schedule.id)}
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
  count={scheduleItems.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ScheduleList;
