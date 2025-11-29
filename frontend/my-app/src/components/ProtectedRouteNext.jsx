'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function ProtectedRouteNext({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Always call hooks first - no early returns before hooks
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    // 🧱 If not logged in, redirect to login page
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    // 🧱 If logged in but not allowed (role check)
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
      console.log('Role not allowed. User role:', user?.role, 'Allowed roles:', allowedRoles);
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, allowedRoles, router, loading]);

  // Debug logging
  console.log('ProtectedRoute check:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    allowedRoles,
    roleMatch: allowedRoles.includes(user?.role),
    loading,
    isChecking
  });

  // Show loading state while checking auth
  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated || (allowedRoles.length > 0 && !allowedRoles.includes(user?.role))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ✅ Authorized
  console.log('Access granted!');
  return <>{children}</>;
}

