'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Checkout from '../../../pages/Checkout';

export default function CheckoutPage() {
  const allowedRoles: string[] = ['family'];
  return (
    <ProtectedRouteNext allowedRoles={allowedRoles}>
      <Checkout />
    </ProtectedRouteNext>
  );
}

