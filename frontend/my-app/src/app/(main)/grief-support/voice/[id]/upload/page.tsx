'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../../components/ProtectedRouteNext';
import VoiceUpload from '../../../../../../pages/VoiceUpload';

export default function VoiceUploadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <VoiceUpload id={id} />
    </ProtectedRouteNext>
  );
}

