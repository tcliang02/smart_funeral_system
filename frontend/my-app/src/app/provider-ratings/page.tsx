'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProviderRatings from '../../pages/ProviderRatings';

export default function ProviderRatingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ProviderRatings />
    </ProtectedRouteNext>
  );
}

