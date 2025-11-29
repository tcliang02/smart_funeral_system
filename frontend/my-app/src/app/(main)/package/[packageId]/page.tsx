'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import PackageDetails from '../../../../pages/PackageDetails';

export default function PackageDetailsPage({ params }: { params: Promise<{ packageId: string }> }) {
  const { packageId } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <PackageDetails packageId={packageId} />
    </ProtectedRouteNext>
  );
}

