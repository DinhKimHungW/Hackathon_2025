import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios.config';

// ==================== TYPES ====================

export type TaskType = 'LOADING' | 'UNLOADING' | 'INSPECTION' | 'MAINTENANCE';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  assigneeName?: string;
  assigneeEmail?: string;
  dueDate: string | null; // ISO string
  estimatedHours: number | null;
  actualHours: number | null;
  scheduleId: string | null;
  scheduleName?: string;
  shipVisitId: string | null;
  shipVisitName?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
}

export interface TaskFilters {
  search: string;
  type: TaskType | 'ALL';
  status: TaskStatus | 'ALL';
  priority: TaskPriority | 'ALL';
  assigneeId: string | null;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  kanbanColumns: KanbanColumn[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  type: TaskType;
  priority: TaskPriority;
  assigneeId?: string;
  dueDate?: Date;
  estimatedHours?: number;
  scheduleId?: string;
  shipVisitId?: string;
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: TaskStatus;
  actualHours?: number;
}

export interface AssignTaskDto {
  assigneeId: string;
}

export interface ReorderTaskDto {
  sourceColumnId: TaskStatus;
  destColumnId: TaskStatus;
  sourceIndex: number;
  destIndex: number;
}

// ==================== INITIAL STATE ====================

const initialKanbanColumns: KanbanColumn[] = [
  { id: 'TODO', title: 'To Do', color: '#e3f2fd', tasks: [] },
  { id: 'IN_PROGRESS', title: 'In Progress', color: '#fff3e0', tasks: [] },
  { id: 'REVIEW', title: 'Review', color: '#f3e5f5', tasks: [] },
  { id: 'DONE', title: 'Done', color: '#e8f5e9', tasks: [] },
];

const initialState: TasksState = {
  tasks: [],
  currentTask: null,
  kanbanColumns: initialKanbanColumns,
  filters: {
    search: '',
    type: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    assigneeId: null,
    dateRange: {
      start: null,
      end: null,
    },
  },
  loading: false,
  error: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
  },
};

// ==================== ASYNC THUNKS ====================

// Fetch all tasks with filters
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { tasks: TasksState };
      const { filters } = state.tasks;

      const params: Record<string, string> = {};

      if (filters.type !== 'ALL') params.type = filters.type;
      if (filters.status !== 'ALL') params.status = filters.status;
      if (filters.priority !== 'ALL') params.priority = filters.priority;
      if (filters.search) params.title = filters.search;
      if (filters.assigneeId) params.assigneeId = filters.assigneeId;
      if (filters.dateRange.start) {
        params.fromDate = filters.dateRange.start.toISOString();
      }
      if (filters.dateRange.end) {
        params.toDate = filters.dateRange.end.toISOString();
      }

      const response = await axiosInstance.get('/tasks', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

// Fetch task by ID
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/tasks/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

// Create new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (data: CreateTaskDto, { rejectWithValue }) => {
    try {
      const payload: any = {
        ...data,
        status: 'TODO', // Default status for new tasks
      };

      if (data.dueDate) payload.dueDate = data.dueDate.toISOString();

      const response = await axiosInstance.post('/tasks', payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

// Update task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: UpdateTaskDto }, { rejectWithValue }) => {
    try {
      const payload: any = { ...data };

      if (data.dueDate) payload.dueDate = data.dueDate.toISOString();

      const response = await axiosInstance.patch(`/tasks/${id}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

// Delete task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

// Assign task to user
export const assignTask = createAsyncThunk(
  'tasks/assignTask',
  async ({ taskId, userId }: { taskId: string; userId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/tasks/${taskId}`, { assigneeId: userId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign task');
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }: { taskId: string; status: TaskStatus }, { rejectWithValue }) => {
    try {
      const payload: any = { status };
      
      // If marking as DONE, set completedAt
      if (status === 'DONE') {
        payload.completedAt = new Date().toISOString();
      }

      const response = await axiosInstance.patch(`/tasks/${taskId}`, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task status');
    }
  }
);

// Reorder tasks (drag & drop in Kanban)
export const reorderTasks = createAsyncThunk(
  'tasks/reorderTasks',
  async (data: ReorderTaskDto, { rejectWithValue }) => {
    try {
      // This is optimistic update - we update UI immediately
      // Backend may have a different endpoint for bulk reordering
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reorder tasks');
    }
  }
);

// Add comment to task
export const addTaskComment = createAsyncThunk(
  'tasks/addTaskComment',
  async ({ taskId, content }: { taskId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/tasks/${taskId}/comments`, { content });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

// Fetch task comments
export const fetchTaskComments = createAsyncThunk(
  'tasks/fetchTaskComments',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

// ==================== HELPER FUNCTIONS ====================

const distributeTasksToKanban = (tasks: Task[]): KanbanColumn[] => {
  const columns: KanbanColumn[] = [
    { id: 'TODO', title: 'To Do', color: '#e3f2fd', tasks: [] },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#fff3e0', tasks: [] },
    { id: 'REVIEW', title: 'Review', color: '#f3e5f5', tasks: [] },
    { id: 'DONE', title: 'Done', color: '#e8f5e9', tasks: [] },
  ];

  tasks.forEach((task) => {
    const column = columns.find((col) => col.id === task.status);
    if (column) {
      column.tasks.push(task);
    }
  });

  return columns;
};

// ==================== SLICE ====================

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Set filters
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Reset filters
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },

    // Clear current task
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Move task between Kanban columns (optimistic update)
    moveTask: (
      state,
      action: PayloadAction<{ taskId: string; newColumnId: TaskStatus; newIndex: number }>
    ) => {
      const { taskId, newColumnId, newIndex } = action.payload;

      // Find task in current columns
      let task: Task | undefined;
      let sourceColumn: KanbanColumn | undefined;

      for (const column of state.kanbanColumns) {
        const taskIndex = column.tasks.findIndex((t) => t.id === taskId);
        if (taskIndex !== -1) {
          task = column.tasks[taskIndex];
          sourceColumn = column;
          column.tasks.splice(taskIndex, 1);
          break;
        }
      }

      if (task && sourceColumn) {
        // Update task status
        task.status = newColumnId;

        // Add to new column
        const destColumn = state.kanbanColumns.find((col) => col.id === newColumnId);
        if (destColumn) {
          destColumn.tasks.splice(newIndex, 0, task);
        }

        // Update in tasks array
        const taskArrayIndex = state.tasks.findIndex((t) => t.id === taskId);
        if (taskArrayIndex !== -1) {
          state.tasks[taskArrayIndex] = task;
        }
      }
    },

    // WebSocket real-time updates
    addTaskRealtime: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;

      // Add to Kanban column
      const column = state.kanbanColumns.find((col) => col.id === action.payload.status);
      if (column) {
        column.tasks.unshift(action.payload);
      }
    },

    updateTaskRealtime: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        const oldStatus = state.tasks[index].status;
        state.tasks[index] = action.payload;

        // If status changed, move between Kanban columns
        if (oldStatus !== action.payload.status) {
          // Remove from old column
          const oldColumn = state.kanbanColumns.find((col) => col.id === oldStatus);
          if (oldColumn) {
            oldColumn.tasks = oldColumn.tasks.filter((t) => t.id !== action.payload.id);
          }

          // Add to new column
          const newColumn = state.kanbanColumns.find((col) => col.id === action.payload.status);
          if (newColumn) {
            newColumn.tasks.unshift(action.payload);
          }
        } else {
          // Update in same column
          const column = state.kanbanColumns.find((col) => col.id === action.payload.status);
          if (column) {
            const taskIndex = column.tasks.findIndex((t) => t.id === action.payload.id);
            if (taskIndex !== -1) {
              column.tasks[taskIndex] = action.payload;
            }
          }
        }
      }

      if (state.currentTask?.id === action.payload.id) {
        state.currentTask = action.payload;
      }
    },

    removeTaskRealtime: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      state.pagination.total -= 1;

      // Remove from Kanban columns
      state.kanbanColumns.forEach((column) => {
        column.tasks = column.tasks.filter((t) => t.id !== action.payload);
      });

      if (state.currentTask?.id === action.payload) {
        state.currentTask = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
        state.kanbanColumns = distributeTasksToKanban(state.tasks);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch task by ID
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.data;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload.data);
        state.pagination.total += 1;

        // Add to Kanban column
        const column = state.kanbanColumns.find((col) => col.id === action.payload.data.status);
        if (column) {
          column.tasks.unshift(action.payload.data);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.data.id);
        if (index !== -1) {
          state.tasks[index] = action.payload.data;
        }
        if (state.currentTask?.id === action.payload.data.id) {
          state.currentTask = action.payload.data;
        }

        // Update in Kanban
        state.kanbanColumns = distributeTasksToKanban(state.tasks);
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        state.pagination.total -= 1;
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }

        // Remove from Kanban
        state.kanbanColumns.forEach((column) => {
          column.tasks = column.tasks.filter((t) => t.id !== action.payload);
        });
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Assign task
    builder.addCase(assignTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.data.id);
      if (index !== -1) {
        state.tasks[index] = action.payload.data;
      }
      if (state.currentTask?.id === action.payload.data.id) {
        state.currentTask = action.payload.data;
      }

      // Update in Kanban
      state.kanbanColumns.forEach((column) => {
        const taskIndex = column.tasks.findIndex((t) => t.id === action.payload.data.id);
        if (taskIndex !== -1) {
          column.tasks[taskIndex] = action.payload.data;
        }
      });
    });

    // Update task status
    builder.addCase(updateTaskStatus.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t.id === action.payload.data.id);
      if (index !== -1) {
        state.tasks[index] = action.payload.data;
      }
      if (state.currentTask?.id === action.payload.data.id) {
        state.currentTask = action.payload.data;
      }

      // Update Kanban
      state.kanbanColumns = distributeTasksToKanban(state.tasks);
    });
  },
});

// ==================== EXPORTS ====================

export const {
  setFilters,
  resetFilters,
  clearCurrentTask,
  clearError,
  moveTask,
  addTaskRealtime,
  updateTaskRealtime,
  removeTaskRealtime,
} = tasksSlice.actions;

export default tasksSlice.reducer;
