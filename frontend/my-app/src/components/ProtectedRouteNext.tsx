'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../AuthContext';

export type UserRole = 'family' | 'provider' | 'attendee' | 'admin';

interface ProtectedRouteNextProps {
  children: ReactNode;
  // @ts-ignore - Accept any array type to handle inline literals, tuples, and arrays
  allowedRoles?: any;
}

export default function ProtectedRouteNext({ children, allowedRoles = [] }: ProtectedRouteNextProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Normalize allowedRoles to array for runtime checks
  const normalizedRoles: string[] = Array.isArray(allowedRoles) 
    ? allowedRoles.map(role => String(role))
    : allowedRoles 
      ? [String(allowedRoles)]
      : [];
  
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
    if (normalizedRoles.length > 0 && user?.role && !normalizedRoles.includes(String(user.role))) {
      console.log('Role not allowed. User role:', user?.role, 'Allowed roles:', normalizedRoles);
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, normalizedRoles, router, loading]);

  // Debug logging
  console.log('ProtectedRoute check:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    allowedRoles: normalizedRoles,
    roleMatch: user?.role ? normalizedRoles.includes(String(user.role)) : false,
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
  if (!isAuthenticated || (normalizedRoles.length > 0 && user?.role && !normalizedRoles.includes(String(user.role)))) {
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

