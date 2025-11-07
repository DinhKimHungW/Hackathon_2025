import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  addTaskRealtime,
  updateTaskRealtime,
  removeTaskRealtime,
} from './tasksSlice';
import type { Task, TaskComment } from './tasksSlice';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Custom hook for WebSocket real-time task updates
 * Connects to Socket.IO server and listens for task events
 * Automatically dispatches Redux actions when events are received
 */
export const useTaskSocket = () => {
  const dispatch = useAppDispatch();
  const { access_token } = useAppSelector((state) => state.auth);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!access_token) {
      console.log('[TaskSocket] No token, skipping connection');
      return;
    }

    console.log('[TaskSocket] Initializing connection to:', SOCKET_URL);

    // Initialize socket connection with authentication
    const socket = io(SOCKET_URL, {
      auth: {
        token: access_token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[TaskSocket] Connected successfully. Socket ID:', socket.id);
      
      // Join task room for real-time updates
      socket.emit('join:tasks');
    });

    socket.on('connect_error', (error) => {
      console.error('[TaskSocket] Connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('[TaskSocket] Disconnected. Reason:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        socket.connect();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[TaskSocket] Reconnected after', attemptNumber, 'attempts');
      
      // Rejoin task room after reconnection
      socket.emit('join:tasks');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[TaskSocket] Reconnection attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[TaskSocket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[TaskSocket] Reconnection failed after all attempts');
    });

    // ==================== TASK EVENT HANDLERS ====================

    /**
     * Handle new task created
     */
    socket.on('task:created', (task: Task) => {
      console.log('[TaskSocket] Task created:', task.id, task.title);
      dispatch(addTaskRealtime(task));
    });

    /**
     * Handle task updated
     */
    socket.on('task:updated', (task: Task) => {
      console.log('[TaskSocket] Task updated:', task.id, task.title);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task deleted
     */
    socket.on('task:deleted', (data: { id: string }) => {
      console.log('[TaskSocket] Task deleted:', data.id);
      dispatch(removeTaskRealtime(data.id));
    });

    /**
     * Handle task assigned to user
     */
    socket.on('task:assigned', (task: Task) => {
      console.log('[TaskSocket] Task assigned:', task.id, 'to', task.assigneeName);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task status changed
     */
    socket.on('task:status-changed', (task: Task) => {
      console.log('[TaskSocket] Task status changed:', task.id, 'to', task.status);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task priority changed
     */
    socket.on('task:priority-changed', (task: Task) => {
      console.log('[TaskSocket] Task priority changed:', task.id, 'to', task.priority);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task comment added
     */
    socket.on('task:comment-added', (data: { taskId: string; comment: TaskComment }) => {
      console.log('[TaskSocket] Comment added to task:', data.taskId);
      
      // Re-fetch task to get updated comment count
      // The component should handle this via fetchTaskById if task detail is open
      // Just log the event for now, don't update task state with incomplete data
    });

    /**
     * Handle task moved (Kanban drag & drop)
     */
    socket.on('task:moved', (task: Task) => {
      console.log('[TaskSocket] Task moved:', task.id, 'to', task.status);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task reordered (within same column)
     */
    socket.on('task:reordered', (data: { taskIds: string[]; columnId: string }) => {
      console.log('[TaskSocket] Tasks reordered in column:', data.columnId);
      // This could trigger a refetch or update order in state
      // For now, we'll rely on the backend to maintain order
    });

    /**
     * Handle bulk task updates
     */
    socket.on('tasks:bulk-update', (tasks: Task[]) => {
      console.log('[TaskSocket] Bulk update:', tasks.length, 'tasks');
      tasks.forEach((task) => {
        dispatch(updateTaskRealtime(task));
      });
    });

    /**
     * Handle task started
     */
    socket.on('task:started', (task: Task) => {
      console.log('[TaskSocket] Task started:', task.id, task.title);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task completed
     */
    socket.on('task:completed', (task: Task) => {
      console.log('[TaskSocket] Task completed:', task.id, task.title);
      dispatch(updateTaskRealtime(task));
    });

    /**
     * Handle task attachment added
     */
    socket.on('task:attachment-added', (data: { taskId: string; attachment: any }) => {
      console.log('[TaskSocket] Attachment added to task:', data.taskId);
      // Component should refetch task to get updated attachments
    });

    /**
     * Handle task attachment deleted
     */
    socket.on('task:attachment-deleted', (data: { taskId: string; attachmentId: string }) => {
      console.log('[TaskSocket] Attachment deleted from task:', data.taskId);
      // Component should refetch task to get updated attachments
    });

    /**
     * Handle error events from server
     */
    socket.on('error', (error: { message: string; code?: string }) => {
      console.error('[TaskSocket] Server error:', error.message, error.code);
    });

    /**
     * Handle task notifications (e.g., task assigned to you, task due soon)
     */
    socket.on('task:notification', (data: { taskId: string; type: string; message: string }) => {
      console.log('[TaskSocket] Notification:', data.type, data.message);
      
      // You could show a toast notification here
      // Example: toast.info(data.message);
    });

    // Cleanup function
    return () => {
      console.log('[TaskSocket] Cleaning up connection');
      
      if (socketRef.current) {
        // Leave task room before disconnecting
        socketRef.current.emit('leave:tasks');
        
        // Remove all event listeners
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off('disconnect');
        socketRef.current.off('reconnect');
        socketRef.current.off('reconnect_attempt');
        socketRef.current.off('reconnect_error');
        socketRef.current.off('reconnect_failed');
        socketRef.current.off('task:created');
        socketRef.current.off('task:updated');
        socketRef.current.off('task:deleted');
        socketRef.current.off('task:assigned');
        socketRef.current.off('task:status-changed');
        socketRef.current.off('task:priority-changed');
        socketRef.current.off('task:comment-added');
        socketRef.current.off('task:moved');
        socketRef.current.off('task:reordered');
        socketRef.current.off('tasks:bulk-update');
        socketRef.current.off('task:started');
        socketRef.current.off('task:completed');
        socketRef.current.off('task:attachment-added');
        socketRef.current.off('task:attachment-deleted');
        socketRef.current.off('task:notification');
        socketRef.current.off('error');
        
        // Disconnect socket
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [access_token, dispatch]);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
};

/**
 * Hook to emit task events to server
 * Use this for client-initiated actions that need to be broadcast
 */
export const useTaskEmit = () => {
  const socketRef = useRef<Socket | null>(null);
  const { access_token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (access_token) {
      socketRef.current = io(SOCKET_URL, {
        auth: { token: access_token },
        transports: ['websocket', 'polling'],
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [access_token]);

  const emitTaskAction = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      console.log('[TaskEmit] Emitting event:', event, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('[TaskEmit] Socket not connected, cannot emit:', event);
    }
  };

  return {
    emitTaskAction,
  };
};
