'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import TributeCreate from '../../../../pages/TributeCreate';

export default function TributeCreatePage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <TributeCreate />
    </ProtectedRouteNext>
  );
}

