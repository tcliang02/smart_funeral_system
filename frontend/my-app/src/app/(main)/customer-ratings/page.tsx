'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import CustomerRatings from '../../../pages/CustomerRatings';

export default function CustomerRatingsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <CustomerRatings />
    </ProtectedRouteNext>
  );
}

