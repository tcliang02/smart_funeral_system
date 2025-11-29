'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Checkout from '../../../pages/Checkout';

export default function CheckoutPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as const}>
      <Checkout />
    </ProtectedRouteNext>
  );
}

