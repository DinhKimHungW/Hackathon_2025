import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { ThemeModeProvider } from '@/theme/ThemeModeProvider';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ToastProvider from '@/components/common/ToastProvider';
import OfflineBanner from '@/components/common/OfflineBanner';
import { 
  PageLoader, 
  DashboardLoader, 
  ListPageLoader, 
  FormPageLoader, 
  DetailPageLoader 
} from '@/components/common/PageLoader';
import './App.css';

// Eager load critical components (needed immediately)
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@features/auth/ProtectedRoute';

// Lazy load route components (loaded on-demand)
const Login = lazy(() => import('@features/auth/Login'));
const Unauthorized = lazy(() => import('@features/auth/Unauthorized'));
const Dashboard = lazy(() => import('@features/dashboard/Dashboard'));
const ShipVisitList = lazy(() => import('@features/shipVisits/ShipVisitList'));
const ShipVisitDetail = lazy(() => import('@features/shipVisits/ShipVisitDetail'));
const ShipVisitForm = lazy(() => import('@features/shipVisits/ShipVisitForm'));
const SchedulesPage = lazy(() => import('@features/schedules/SchedulesPage'));
const TasksPage = lazy(() => import('@features/tasks/TasksPage'));
const AssetsPage = lazy(() => import('@features/assets/AssetsPage'));
const ConflictsPage = lazy(() => import('@features/conflicts/ConflictsPage'));
const EventLogsPage = lazy(() => import('@features/eventLogs/EventLogsPage'));
const SimulationPage = lazy(() => import('@features/simulation/SimulationPage'));
const PortMapPage = lazy(() => import('@features/portMap/PortMapPage'));
const ChatbotPage = lazy(() => import('@features/chatbot/ChatbotPage'));
const Settings = lazy(() => import('@features/settings/Settings'));
const Profile = lazy(() => import('@features/profile/Profile'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeModeProvider>
        <CssBaseline />
        <OfflineBanner />
        <ToastProvider>
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Routes>
              {/* Public Routes (without layout) */}
              <Route path="/login" element={
                <Suspense fallback={<PageLoader />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/unauthorized" element={
                <Suspense fallback={<PageLoader />}>
                  <Unauthorized />
                </Suspense>
              } />

              {/* Protected Routes (with MainLayout) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  
                  <Route path="dashboard" element={
                    <Suspense fallback={<DashboardLoader />}>
                      <Dashboard />
                    </Suspense>
                  } />

                  {/* Ship Visits */}
                  <Route path="ship-visits" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <ShipVisitList />
                    </Suspense>
                  } />
                  <Route path="ship-visits/new" element={
                    <Suspense fallback={<FormPageLoader />}>
                      <ShipVisitForm />
                    </Suspense>
                  } />
                  <Route path="ship-visits/:id" element={
                    <Suspense fallback={<DetailPageLoader />}>
                      <ShipVisitDetail />
                    </Suspense>
                  } />
                  <Route path="ship-visits/:id/edit" element={
                    <Suspense fallback={<FormPageLoader />}>
                      <ShipVisitForm />
                    </Suspense>
                  } />

                  {/* TODO: Add other routes (Schedules, Tasks, Assets, Conflicts, etc.) */}
                  <Route path="schedules" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <SchedulesPage />
                    </Suspense>
                  } />
                  
                  <Route path="tasks" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <TasksPage />
                    </Suspense>
                  } />
                  
                  <Route path="assets" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <AssetsPage />
                    </Suspense>
                  } />
                  
                  <Route path="conflicts" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <ConflictsPage />
                    </Suspense>
                  } />
                  
                  <Route path="simulation" element={
                    <Suspense fallback={<PageLoader />}>
                      <SimulationPage />
                    </Suspense>
                  } />
                  
                  <Route path="port-map" element={
                    <Suspense fallback={<PageLoader />}>
                      <PortMapPage />
                    </Suspense>
                  } />
                  
                  <Route path="event-logs" element={
                    <Suspense fallback={<ListPageLoader />}>
                      <EventLogsPage />
                    </Suspense>
                  } />
                  
                  <Route path="chatbot" element={
                    <Suspense fallback={<PageLoader />}>
                      <ChatbotPage />
                    </Suspense>
                  } />
                  
                  {/* Settings & Profile */}
                  <Route path="settings" element={
                    <Suspense fallback={<PageLoader />}>
                      <Settings />
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<PageLoader />}>
                      <Profile />
                    </Suspense>
                  } />
                </Route>
              </Route>

              {/* 404 Not Found - Redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </SnackbarProvider>
        </ToastProvider>
      </ThemeModeProvider>
    </ErrorBoundary>
  );
}

export default App;
