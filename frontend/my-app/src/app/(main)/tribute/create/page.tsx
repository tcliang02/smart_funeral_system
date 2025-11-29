'use client';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import TributeCreate from '../../../../pages/TributeCreate';

export default function TributeCreatePage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <TributeCreate />
    </ProtectedRouteNext>
  );
}

