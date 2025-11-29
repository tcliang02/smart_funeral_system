'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import OrderServices from '../../../pages/OrderServices';

export default function OrderServicesPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <OrderServices />
    </ProtectedRouteNext>
  );
}

