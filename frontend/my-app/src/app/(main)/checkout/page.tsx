'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Checkout from '../../../pages/Checkout';

export default function CheckoutPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <Checkout />
    </ProtectedRouteNext>
  );
}

