'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ProviderBookings from '../../pages/ProviderBookings';

export default function ProviderBookingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider'] as any}>
      <ProviderBookings />
    </ProtectedRouteNext>
  );
}

