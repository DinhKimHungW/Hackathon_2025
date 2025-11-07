import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CompleteIcon,
  PersonAdd as ReassignIcon,
  AttachFile as AttachmentIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchTaskById,
  addTaskComment,
  fetchTaskComments,
} from './tasksSlice';
import type { Task, TaskComment, TaskStatus, TaskPriority } from './tasksSlice';

// ==================== TYPES ====================

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// ==================== HELPER FUNCTIONS ====================

const getPriorityColor = (priority: TaskPriority): 'error' | 'warning' | 'success' => {
  switch (priority) {
    case 'HIGH':
      return 'error';
    case 'MEDIUM':
      return 'warning';
    case 'LOW':
      return 'success';
    default:
      return 'success';
  }
};

const getStatusColor = (status: TaskStatus): 'default' | 'primary' | 'warning' | 'info' | 'success' => {
  switch (status) {
    case 'TODO':
      return 'default';
    case 'IN_PROGRESS':
      return 'primary';
    case 'REVIEW':
      return 'warning';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

const getTaskTypeIcon = (type: string): string => {
  switch (type) {
    case 'LOADING':
      return '📦';
    case 'UNLOADING':
      return '🚚';
    case 'INSPECTION':
      return '🔍';
    case 'MAINTENANCE':
      return '🔧';
    default:
      return '📋';
  }
};

// ==================== TAB PANEL COMPONENT ====================

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

interface TaskDetailModalProps {
  open: boolean;
  taskId: string | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
  onReassign: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  open,
  taskId,
  onClose,
  onEdit,
  onDelete,
  onComplete,
  onReassign,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useAppDispatch();
  const { currentTask } = useAppSelector((state) => state.tasks);

  const [tabValue, setTabValue] = useState(0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  useEffect(() => {
    if (open && taskId) {
      dispatch(fetchTaskById(taskId));
      loadComments(taskId);
    }
  }, [open, taskId, dispatch]);

  const loadComments = async (id: string) => {
    setLoadingComments(true);
    try {
      const result = await dispatch(fetchTaskComments(id)).unwrap();
      setComments(result);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !taskId) return;

    try {
      await dispatch(addTaskComment({ taskId, content: comment })).unwrap();
      setComment('');
      loadComments(taskId);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClose = () => {
    setTabValue(0);
    setComment('');
    onClose();
  };

  if (!currentTask) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  const isOverdue =
    currentTask.dueDate &&
    new Date(currentTask.dueDate) < new Date() &&
    currentTask.status !== 'DONE';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { minHeight: fullScreen ? '100%' : '600px' },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {getTaskTypeIcon(currentTask.type)} {currentTask.title}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {/* Header Info */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={currentTask.status} size="small" color={getStatusColor(currentTask.status)} />
          <Chip label={currentTask.priority} size="small" color={getPriorityColor(currentTask.priority)} />
          <Chip label={currentTask.type.replace('_', ' ')} size="small" variant="outlined" />
          {isOverdue && <Chip label="⚠️ OVERDUE" size="small" color="error" />}
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Overview" />
          <Tab label="Timeline" />
          <Tab label="Activity" />
        </Tabs>

        {/* Tab 1: Overview */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
            {/* Left Column */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body2" paragraph>
                {currentTask.description || 'No description provided'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Assignee
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {currentTask.assigneeName?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="body2">{currentTask.assigneeName || 'Unassigned'}</Typography>
                  {currentTask.assigneeEmail && (
                    <Typography variant="caption" color="text.secondary">
                      {currentTask.assigneeEmail}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Related To
              </Typography>
              {currentTask.scheduleName && (
                <Typography variant="body2">📅 Schedule: {currentTask.scheduleName}</Typography>
              )}
              {currentTask.shipVisitName && (
                <Typography variant="body2">🚢 Ship Visit: {currentTask.shipVisitName}</Typography>
              )}
              {!currentTask.scheduleName && !currentTask.shipVisitName && (
                <Typography variant="body2" color="text.secondary">
                  Not linked to any schedule or ship visit
                </Typography>
              )}
            </Box>

            {/* Right Column */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Due Date
              </Typography>
              <Typography
                variant="body2"
                paragraph
                sx={{ color: isOverdue ? 'error.main' : 'text.primary' }}
              >
                {currentTask.dueDate
                  ? format(new Date(currentTask.dueDate), 'MMM d, yyyy HH:mm')
                  : 'No due date set'}
                {isOverdue && ' (Overdue)'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Time Tracking
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Estimated: {currentTask.estimatedHours || 'N/A'} hours
                </Typography>
                <Typography variant="body2">
                  Actual: {currentTask.actualHours || 'N/A'} hours
                </Typography>
                {currentTask.estimatedHours && currentTask.actualHours && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        currentTask.actualHours > currentTask.estimatedHours
                          ? 'error.main'
                          : 'success.main',
                    }}
                  >
                    {currentTask.actualHours > currentTask.estimatedHours
                      ? `+${currentTask.actualHours - currentTask.estimatedHours} hours over estimate`
                      : `${currentTask.estimatedHours - currentTask.actualHours} hours under estimate`}
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Attachments
              </Typography>
              {currentTask.attachments && currentTask.attachments.length > 0 ? (
                <List dense>
                  {currentTask.attachments.map((attachment, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                          <AttachmentIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ cursor: 'pointer', color: 'primary.main' }}>
                            {attachment}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No attachments
                </Typography>
              )}
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 2: Timeline */}
        <TabPanel value={tabValue} index={1}>
          <List>
            {currentTask.createdAt && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'info.main' }}>📝</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Task Created"
                  secondary={format(new Date(currentTask.createdAt), 'MMM d, yyyy HH:mm')}
                />
              </ListItem>
            )}

            {currentTask.startedAt && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>▶️</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Task Started"
                  secondary={format(new Date(currentTask.startedAt), 'MMM d, yyyy HH:mm')}
                />
              </ListItem>
            )}

            {currentTask.completedAt && (
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'success.main' }}>✅</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Task Completed"
                  secondary={format(new Date(currentTask.completedAt), 'MMM d, yyyy HH:mm')}
                />
              </ListItem>
            )}

            {!currentTask.startedAt && !currentTask.completedAt && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                No timeline events yet
              </Typography>
            )}
          </List>
        </TabPanel>

        {/* Tab 3: Activity (Comments) */}
        <TabPanel value={tabValue} index={2}>
          {loadingComments ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : (
            <>
              <List sx={{ maxHeight: 300, overflow: 'auto', mb: 2 }}>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar>{comment.authorName?.charAt(0) || 'U'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{comment.authorName || 'Unknown'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(comment.createdAt), 'MMM d, HH:mm')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {comment.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No comments yet
                  </Typography>
                )}
              </List>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  <SendIcon />
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Press Ctrl+Enter to send
              </Typography>
            </>
          )}
        </TabPanel>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button startIcon={<EditIcon />} onClick={() => onEdit(currentTask)}>
            Edit
          </Button>
          {currentTask.status !== 'DONE' && (
            <Button startIcon={<CompleteIcon />} color="success" onClick={() => onComplete(currentTask.id)}>
              Complete
            </Button>
          )}
          <Button startIcon={<ReassignIcon />} onClick={() => onReassign(currentTask)}>
            Reassign
          </Button>
        </Box>
        <Button startIcon={<DeleteIcon />} color="error" onClick={() => onDelete(currentTask.id)}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailModal;
