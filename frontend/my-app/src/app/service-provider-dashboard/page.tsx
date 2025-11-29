'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ServiceProviderDashboard from '../../pages/ServiceProviderDashboard';

export default function ServiceProviderDashboardPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ServiceProviderDashboard />
    </ProtectedRouteNext>
  );
}

