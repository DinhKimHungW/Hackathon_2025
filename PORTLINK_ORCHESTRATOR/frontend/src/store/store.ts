import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import kpiReducer from '../features/dashboard/kpiSlice';
import shipVisitsReducer from '../features/shipVisits/shipVisitsSlice';
import schedulesReducer from '../features/schedules/schedulesSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import assetsReducer from '../features/assets/assetsSlice';
import conflictsReducer from '../features/conflicts/conflictsSlice';
import eventLogsReducer from '../features/eventLogs/eventLogsSlice';
import simulationReducer from '../features/simulation/simulationSlice';
import chatbotReducer from '../features/chatbot/chatbotSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    kpi: kpiReducer,
    shipVisits: shipVisitsReducer,
    schedules: schedulesReducer,
    tasks: tasksReducer,
    assets: assetsReducer,
    conflicts: conflictsReducer,
    eventLogs: eventLogsReducer,
    simulation: simulationReducer,
    chatbot: chatbotReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
        // Ignore Date objects in schedules and tasks state
        ignoredPaths: [
          'schedules.selectedDate',
          'schedules.filters.dateRange.start',
          'schedules.filters.dateRange.end',
          'tasks.filters.dateRange.start',
          'tasks.filters.dateRange.end'
        ],
      },
    }),
  devTools: import.meta.env.DEV, // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
