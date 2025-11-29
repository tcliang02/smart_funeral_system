'use client';

import { useEffect, useState } from 'react';
import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProfileSettings from '../../pages/ProfileSettings';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

export default function ProfileSettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent SSR/prerendering
  }

  return (
    <ProtectedRouteNext allowedRoles={['family', 'attendee', 'provider', 'admin'] as any}>
      <ProfileSettings />
    </ProtectedRouteNext>
  );
}

