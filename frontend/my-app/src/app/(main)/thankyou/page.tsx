'use client';

import ProtectedRouteNext from '../../../components/ProtectedRouteNext';
import ThankYou from '../../../pages/ThankYou';

export default function ThankYouPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <ThankYou />
    </ProtectedRouteNext>
  );
}

