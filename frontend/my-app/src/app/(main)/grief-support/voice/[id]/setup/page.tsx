'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../../components/ProtectedRouteNext';
import VoiceManagement from '../../../../../../pages/VoiceManagement';

export default function VoiceManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <VoiceManagement id={id} />
    </ProtectedRouteNext>
  );
}

