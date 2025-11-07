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
  Avatar,
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
  PersonAdd as PersonAddIcon,
  Download as DownloadIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTasks, deleteTask } from './tasksSlice';
import type { Task, TaskPriority, TaskStatus, TaskType } from './tasksSlice';

// ==================== TYPES ====================

type Order = 'asc' | 'desc';
type OrderBy = 'title' | 'type' | 'status' | 'priority' | 'dueDate' | 'assigneeName';

interface HeadCell {
  id: OrderBy;
  label: string;
  sortable: boolean;
}

const headCells: HeadCell[] = [
  { id: 'title', label: 'Title', sortable: true },
  { id: 'type', label: 'Type', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'priority', label: 'Priority', sortable: true },
  { id: 'assigneeName', label: 'Assignee', sortable: true },
  { id: 'dueDate', label: 'Due Date', sortable: true },
];

// ==================== HELPER FUNCTIONS ====================

const getPriorityColor = (priority: TaskPriority): 'error' | 'warning' | 'success' | 'default' => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'success';
    default:
      return 'default';
  }
};

const getStatusColor = (status: TaskStatus): 'default' | 'info' | 'warning' | 'success' => {
  switch (status) {
    case 'TODO':
      return 'default';
    case 'IN_PROGRESS':
      return 'info';
    case 'REVIEW':
      return 'warning';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

const getTaskTypeIcon = (type: TaskType): string => {
  switch (type) {
    case 'LOADING':
      return '📦';
    case 'UNLOADING':
      return '🚛';
    case 'INSPECTION':
      return '🔍';
    case 'MAINTENANCE':
      return '🔧';
    default:
      return '📋';
  }
};

const formatEnumLabel = (value?: string | null): string => {
  if (!value) {
    return 'N/A';
  }
  return value.replace(/_/g, ' ');
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
          Tasks
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

interface TaskListProps {
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onAssignTask: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ onEditTask, onViewTask, onAssignTask }) => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('dueDate');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
    }
  }, [dispatch, isAuthenticated]);

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = tasks.map((task) => task.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (taskId: string) => {
    const selectedIndex = selected.indexOf(taskId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, taskId);
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

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(taskId));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} tasks?`)) {
      for (const taskId of selected) {
        await dispatch(deleteTask(taskId));
      }
      setSelected([]);
    }
  };

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Title', 'Type', 'Status', 'Priority', 'Assignee', 'Due Date', 'Estimated Hours'];
    const csvContent = [
      headers.join(','),
      ...tasks.map((task) =>
        [
          task.title,
          task.type,
          task.status,
          task.priority,
          task.assigneeName || 'Unassigned',
          task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : 'N/A',
          task.estimatedHours || 'N/A',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const isSelected = (taskId: string) => selected.indexOf(taskId) !== -1;

  // Sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[orderBy];
    let bValue: any = b[orderBy];

    // Handle null values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Convert dates to timestamps
    if (orderBy === 'dueDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const paginatedTasks = sortedTasks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            rowCount={tasks.length}
            onRequestSort={handleRequestSort}
          />
          <TableBody>
            {paginatedTasks.map((task) => {
              const isItemSelected = isSelected(task.id);
              const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';
              const typeLabel = formatEnumLabel(task.type);
              const statusValue = (task.status ?? 'TODO') as TaskStatus;
              const statusLabel = formatEnumLabel(statusValue);
              const statusColor = getStatusColor(statusValue);

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={task.id}
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox" onClick={() => handleClick(task.id)}>
                    <Checkbox color="primary" checked={isItemSelected} />
                  </TableCell>
                  <TableCell onClick={() => onViewTask(task)}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {getTaskTypeIcon(task.type)} {task.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{typeLabel}</TableCell>
                  <TableCell>
                    <Chip label={statusLabel} size="small" color={statusColor} />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={task.priority}
                      size="small"
                      icon={<FlagIcon />}
                      color={getPriorityColor(task.priority)}
                    />
                  </TableCell>
                  <TableCell>
                    {task.assigneeName ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          {task.assigneeName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2">{task.assigneeName}</Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.dueDate ? (
                      <Typography
                        variant="body2"
                        sx={{
                          color: isOverdue ? 'error.main' : 'text.primary',
                          fontWeight: isOverdue ? 600 : 400,
                        }}
                      >
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        {isOverdue && ' ⚠️'}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => onViewTask(task)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Task">
                        <IconButton size="small" onClick={() => onEditTask(task)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Assign Task">
                        <IconButton size="small" color="primary" onClick={() => onAssignTask(task)}>
                          <PersonAddIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Task">
                        <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
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
        count={tasks.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TaskList;
