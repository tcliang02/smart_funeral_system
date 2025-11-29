'use client';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import VoiceHub from '../../../../pages/VoiceHub';

export default function VoiceHubPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <VoiceHub />
    </ProtectedRouteNext>
  );
}

