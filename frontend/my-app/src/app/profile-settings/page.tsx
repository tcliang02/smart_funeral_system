'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProfileSettings from '../../pages/ProfileSettings';

export default function ProfileSettingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family', 'attendee', 'provider', 'admin']}>
      <ProfileSettings />
    </ProtectedRouteNext>
  );
}

