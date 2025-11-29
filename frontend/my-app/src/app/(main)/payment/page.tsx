'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Payment from '../../../pages/Payment';

export default function PaymentPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <Payment />
    </ProtectedRouteNext>
  );
}

