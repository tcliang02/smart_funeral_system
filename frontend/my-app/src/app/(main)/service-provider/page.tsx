'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import OrderServices from '../../../pages/OrderServices';

export default function ServiceProviderPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <OrderServices />
    </ProtectedRouteNext>
  );
}

