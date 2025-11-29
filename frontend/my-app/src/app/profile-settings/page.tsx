'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProfileSettings from '../../pages/ProfileSettings';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family', 'attendee', 'provider', 'admin'] as any}>
      <ProfileSettings />
    </ProtectedRouteNext>
  );
}

