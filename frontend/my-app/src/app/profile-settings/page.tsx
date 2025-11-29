'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProfileSettings from '../../pages/ProfileSettings';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family', 'attendee', 'provider', 'admin'] as any}>
      <ProfileSettings />
    </ProtectedRouteNext>
  );
}

