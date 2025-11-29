'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '../AuthContext';

// UserRole definition
export type UserRole = 'family' | 'provider' | 'attendee' | 'admin';

interface ProtectedRouteNextProps {
  children: ReactNode;
  // @ts-ignore - Explicitly allow ANY type to prevent TypeScript errors with inline arrays
  // This fixes "Type 'string' is not assignable to type 'never'" errors
  allowedRoles?: any; 
}

export default function ProtectedRouteNext({ children, allowedRoles = [] }: ProtectedRouteNextProps) {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  // Runtime normalization: Ensure allowedRoles is always a string array
  const normalizedRoles: string[] = Array.isArray(allowedRoles) 
    ? allowedRoles.map(r => String(r)) 
    : allowedRoles 
      ? [String(allowedRoles)] 
      : [];

  useEffect(() => {
    if (loading) {
      setIsChecking(true);
      return;
    }

    setIsChecking(false);

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
      return;
    }

    if (normalizedRoles.length > 0 && user?.role && !normalizedRoles.includes(String(user.role))) {
      console.log('Role not allowed. User role:', user?.role, 'Allowed roles:', normalizedRoles);
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, normalizedRoles, router, loading]);

  if (loading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || (normalizedRoles.length > 0 && user?.role && !normalizedRoles.includes(String(user.role)))) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
