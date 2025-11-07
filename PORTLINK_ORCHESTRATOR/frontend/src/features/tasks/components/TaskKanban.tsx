import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Box, Paper, Typography, Chip, Avatar, IconButton, Tooltip, Card, CardContent, Stack } from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { moveTask, updateTaskStatus } from '../tasksSlice';
import type { Task, TaskStatus, KanbanColumn } from '../tasksSlice';

// ==================== TYPES ====================

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

// ==================== PRIORITY COLORS ====================

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'HIGH':
      return '#d32f2f'; // Red
    case 'MEDIUM':
      return '#ed6c02'; // Orange
    case 'LOW':
      return '#2e7d32'; // Green
    default:
      return '#757575';
  }
};

const getTaskTypeIcon = (type: string): string => {
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

// ==================== TASK CARD COMPONENT ====================

const TaskCard: React.FC<TaskCardProps> = ({ task, index, onEdit, onDelete }) => {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <Card
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          sx={{
            mb: 1.5,
            bgcolor: snapshot.isDragging ? 'action.hover' : 'background.paper',
            boxShadow: snapshot.isDragging ? 4 : 1,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            transition: 'all 0.2s ease',
            borderLeft: `4px solid ${getPriorityColor(task.priority)}`,
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {getTaskTypeIcon(task.type)} {task.title}
                </Typography>
                {task.description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {task.description}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                <Tooltip title="Edit Task">
                  <IconButton size="small" onClick={() => onEdit(task)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Task">
                  <IconButton size="small" color="error" onClick={() => onDelete(task.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Task Info */}
            <Stack spacing={0.5} sx={{ mt: 1.5 }}>
              {/* Priority */}
              <Chip
                label={task.priority}
                size="small"
                icon={<FlagIcon />}
                sx={{
                  height: 20,
                  bgcolor: getPriorityColor(task.priority),
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                }}
              />

              {/* Due Date */}
              {task.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarIcon sx={{ fontSize: 14, color: isOverdue ? 'error.main' : 'text.secondary' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      color: isOverdue ? 'error.main' : 'text.secondary',
                      fontWeight: isOverdue ? 600 : 400,
                    }}
                  >
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    {isOverdue && ' (Overdue)'}
                  </Typography>
                </Box>
              )}

              {/* Assignee */}
              {task.assigneeName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                    {task.assigneeName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" color="text.secondary">
                    {task.assigneeName}
                  </Typography>
                </Box>
              )}

              {/* Estimated Hours */}
              {task.estimatedHours && (
                <Typography variant="caption" color="text.secondary">
                  ⏱️ {task.estimatedHours}h estimated
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Draggable>
  );
};

// ==================== KANBAN COLUMN COMPONENT ====================

const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({ column, onEditTask, onDeleteTask }) => {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: column.color,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 600,
      }}
    >
      {/* Column Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
          {column.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {column.tasks.length} {column.tasks.length === 1 ? 'task' : 'tasks'}
        </Typography>
      </Box>

      {/* Droppable Area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              minHeight: 200,
              bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
              borderRadius: 1,
              transition: 'background-color 0.2s ease',
              p: 0.5,
            }}
          >
            {column.tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Paper>
  );
};

// ==================== MAIN KANBAN COMPONENT ====================

interface TaskKanbanProps {
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskKanban: React.FC<TaskKanbanProps> = ({ onEditTask, onDeleteTask }) => {
  const dispatch = useAppDispatch();
  const { kanbanColumns } = useAppSelector((state) => state.tasks);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const taskId = draggableId;
    const newColumnId = destination.droppableId as TaskStatus;
    const newIndex = destination.index;

    // Optimistic UI update
    dispatch(moveTask({ taskId, newColumnId, newIndex }));

    // Update status on backend
    if (destination.droppableId !== source.droppableId) {
      dispatch(updateTaskStatus({ taskId, status: newColumnId }));
    }
  };

  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2,
            minWidth: { xs: 'auto', md: 1000 },
          }}
        >
          {kanbanColumns.map((column) => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </Box>
      </DragDropContext>
    </Box>
  );
};

export default TaskKanban;
