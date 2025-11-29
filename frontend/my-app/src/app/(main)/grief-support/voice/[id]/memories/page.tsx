'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../../components/ProtectedRouteNext';
import MemoryCollection from '../../../../../../pages/MemoryCollection';

export default function MemoryCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <MemoryCollection id={id} />
    </ProtectedRouteNext>
  );
}

