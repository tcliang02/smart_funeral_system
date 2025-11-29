'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProviderBookings from '../../pages/ProviderBookings';

export default function ProviderBookingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ProviderBookings />
    </ProtectedRouteNext>
  );
}

