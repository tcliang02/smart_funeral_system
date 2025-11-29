import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { logger } from "@/lib/logger";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Debug logging (development only)
  logger.debug('ProtectedRoute check', {
    isAuthenticated,
    userRole: user?.role,
    allowedRoles,
    roleMatch: allowedRoles.length === 0 || allowedRoles.includes(user?.role)
  });

  // 🧱 If not logged in, redirect to login page
  if (!isAuthenticated) {
    logger.debug('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // 🧱 If logged in but not allowed (role check)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    logger.warn('Role not allowed', { userRole: user?.role, allowedRoles });
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Authorized
  logger.debug('Access granted');
  return children;
}
