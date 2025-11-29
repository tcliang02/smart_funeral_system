'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProviderRatings from '../../pages/ProviderRatings';

export default function ProviderRatingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider'] as any}>
      <ProviderRatings />
    </ProtectedRouteNext>
  );
}

