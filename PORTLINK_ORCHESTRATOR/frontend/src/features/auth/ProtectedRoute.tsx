import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAppSelector } from '@store/hooks';
import { selectIsAuthenticated, selectAuthLoading, selectUserRole } from './authSlice';

interface ProtectedRouteProps {
  allowedRoles?: Array<'ADMIN' | 'MANAGER' | 'OPERATIONS' | 'DRIVER'>;
}

/**
 * Protected Route Component
 * Protects routes from unauthorized access
 * Supports role-based access control (RBAC)
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const userRole = useAppSelector(selectUserRole);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render protected content
  return <Outlet />;
}
