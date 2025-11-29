'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Checkout from '../../../pages/Checkout';

const ALLOWED_ROLES: string[] = ['family'];

export default function CheckoutPage() {
  return (
    <ProtectedRouteNext allowedRoles={ALLOWED_ROLES}>
      <Checkout />
    </ProtectedRouteNext>
  );
}

