'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../../components/ProtectedRouteNext';
import VoiceSettings from '../../../../../../pages/VoiceSettings';

export default function VoiceSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <VoiceSettings id={id} />
    </ProtectedRouteNext>
  );
}

