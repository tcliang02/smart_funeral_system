'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import VoiceHub from '../../../../pages/VoiceHub';

export default function VoiceHubPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <VoiceHub />
    </ProtectedRouteNext>
  );
}

