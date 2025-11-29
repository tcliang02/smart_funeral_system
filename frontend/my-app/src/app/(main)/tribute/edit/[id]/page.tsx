'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../components/ProtectedRouteNext';
import EditTribute from '../../../../../pages/EditTribute';

export default function EditTributePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <EditTribute id={id} />
    </ProtectedRouteNext>
  );
}

