'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Payment from '../../../pages/Payment';

export default function PaymentPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <Payment />
    </ProtectedRouteNext>
  );
}

