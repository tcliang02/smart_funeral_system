'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Orders from '../../../pages/Orders';

export default function OrdersPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <Orders />
    </ProtectedRouteNext>
  );
}

