'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import OrderServices from '../../../pages/OrderServices';

export default function ServiceProviderPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <OrderServices />
    </ProtectedRouteNext>
  );
}

