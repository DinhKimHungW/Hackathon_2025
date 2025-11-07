import React, { useRef, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  Chip,
  Collapse,
  Grid,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Edit,
  Delete,
  PlayArrow,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { format } from 'date-fns';
import type { Schedule, Task } from '../types';
import { ResourceUtilizationBar } from './ResourceUtilizationBar';
import { TimelinePreview } from './TimelinePreview';

interface EnhancedScheduleListProps {
  schedules: Schedule[];
  selectedIds: string[];
  onSelect: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEditSchedule: (schedule: Schedule) => void;
  onDeleteSchedule: (id: string) => void;
  onStartSchedule: (schedule: Schedule) => void;
  onCompleteSchedule: (schedule: Schedule) => void;
  onCancelSchedule: (schedule: Schedule) => void;
}

export const EnhancedScheduleList: React.FC<EnhancedScheduleListProps> = ({
  schedules,
  selectedIds,
  onSelect,
  onSelectAll,
  onEditSchedule,
  onDeleteSchedule,
  onStartSchedule,
  onCompleteSchedule,
  onCancelSchedule,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleExpand = (scheduleId: string) => {
    setExpandedId(expandedId === scheduleId ? null : scheduleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#ff9800';
      case 'SCHEDULED':
        return '#2196f3';
      case 'IN_PROGRESS':
        return '#4caf50';
      case 'COMPLETED':
        return '#9e9e9e';
      case 'CANCELLED':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  const calculateTasksCompletion = (tasks: Task[]) => {
    if (!tasks?.length) return 0;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    return (completed / tasks.length) * 100;
  };

  const calculateResourceUtilization = (tasks: Task[]) => {
    if (!tasks?.length) return 0;
    const totalHours = tasks.reduce((sum, task) => {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);
    
    // This is a simplified calculation - in reality you'd want to consider
    // resource capacity and overlap
    return Math.min((totalHours / (24 * 7)) * 100, 100);
  };

  return (
    <TableContainer component={Paper} ref={tableContainerRef}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedIds.length > 0 && selectedIds.length < schedules.length}
                checked={selectedIds.length === schedules.length}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </TableCell>
            <TableCell />
            <TableCell>Schedule Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell>Resource Utilization</TableCell>
            <TableCell>Timeline</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {schedules.map((schedule) => {
            const isExpanded = expandedId === schedule.id;
            const isSelected = selectedIds.includes(schedule.id);
            const tasksCompletion = calculateTasksCompletion(schedule.tasks);
            const resourceUtilization = calculateResourceUtilization(schedule.tasks);

            return (
              <React.Fragment key={schedule.id}>
                <TableRow hover selected={isSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      onChange={(e) => onSelect(schedule.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleExpand(schedule.id)}>
                      {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {schedule.operation || 'Untitled Schedule'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {schedule.notes || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={schedule.type?.replace(/_/g, ' ')} 
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={schedule.status}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(schedule.status),
                        color: '#fff',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ResourceUtilizationBar 
                      value={tasksCompletion} 
                      color={getStatusColor(schedule.status)}
                      showLabel
                      height={8}
                    />
                  </TableCell>
                  <TableCell>
                    <ResourceUtilizationBar
                      value={resourceUtilization}
                      color="#1976d2"
                      showLabel
                      height={8}
                    />
                  </TableCell>
                  <TableCell>
                    <TimelinePreview
                      startTime={schedule.startTime}
                      endTime={schedule.endTime}
                      tasks={schedule.tasks}
                      width={120}
                      height={24}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {schedule.status === 'SCHEDULED' && (
                        <Tooltip title="Start Schedule">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => onStartSchedule(schedule)}
                          >
                            <PlayArrow fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {schedule.status === 'IN_PROGRESS' && (
                        <Tooltip title="Complete Schedule">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onCompleteSchedule(schedule)}
                          >
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {['SCHEDULED', 'IN_PROGRESS'].includes(schedule.status) && (
                        <Tooltip title="Cancel Schedule">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => onCancelSchedule(schedule)}
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit Schedule">
                        <IconButton
                          size="small"
                          onClick={() => onEditSchedule(schedule)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Schedule">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => onDeleteSchedule(schedule.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>

                {/* Expanded Details */}
                <TableRow>
                  <TableCell colSpan={9} sx={{ py: 0, borderBottom: 0 }}>
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Box sx={{ py: 2 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Tasks
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Task Name</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell>Start Time</TableCell>
                                  <TableCell>End Time</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {schedule.tasks?.map((task) => (
                                  <TableRow key={task.id}>
                                    <TableCell>{task.taskName}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={task.status}
                                        size="small"
                                        sx={{
                                          bgcolor: getStatusColor(task.status),
                                          color: '#fff',
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {format(new Date(task.startTime), 'MMM d, HH:mm')}
                                    </TableCell>
                                    <TableCell>
                                      {format(new Date(task.endTime), 'MMM d, HH:mm')}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" gutterBottom>
                              Timeline
                            </Typography>
                            <TimelinePreview
                              startTime={schedule.startTime}
                              endTime={schedule.endTime}
                              tasks={schedule.tasks}
                              width={500}
                              height={100}
                              showLabels
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};