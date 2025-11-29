'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../components/ProtectedRouteNext';
import ProviderAvailabilityPage from '../../../../../pages/ProviderAvailabilityPage';

export default function ProviderAvailabilityPageRoute({ params }: { params: Promise<{ providerId: string }> }) {
  const { providerId } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <ProviderAvailabilityPage providerId={providerId} />
    </ProtectedRouteNext>
  );
}

