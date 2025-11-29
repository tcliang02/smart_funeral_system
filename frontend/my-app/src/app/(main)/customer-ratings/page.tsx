'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import CustomerRatings from '../../../pages/CustomerRatings';

export default function CustomerRatingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <CustomerRatings />
    </ProtectedRouteNext>
  );
}

