import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: UserRole | UserRole[];
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const allowed = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    // admin can access manager routes
    const effectiveRole = user.role === 'admin' ? 'manager' : user.role;
    if (!allowed.includes(effectiveRole as UserRole)) {
      if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
      return <Navigate to="/manager/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
