import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children || <Outlet />;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isFirstLogin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isFirstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

export function EmployeeRoute({ children }) {
  const { isAuthenticated, isEmployee, isFirstLogin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isFirstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  if (!isEmployee) {
    return <Navigate to="/admin" replace />;
  }

  return children || <Outlet />;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isFirstLogin, isAdmin } = useAuth();

  if (isAuthenticated && isFirstLogin) {
    return <Navigate to="/change-password" replace />;
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
