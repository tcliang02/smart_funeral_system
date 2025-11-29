'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import Checkout from '../../../pages/Checkout';

export default function CheckoutPage() {
  // Use type assertion to ensure TypeScript accepts the array literal
  const allowedRoles = ['family'] as string[];
  return (
    <ProtectedRouteNext allowedRoles={allowedRoles}>
      <Checkout />
    </ProtectedRouteNext>
  );
}

