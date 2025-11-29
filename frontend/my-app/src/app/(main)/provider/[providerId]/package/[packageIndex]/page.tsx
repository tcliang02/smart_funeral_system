'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../../components/ProtectedRouteNext';
import PackageDetails from '../../../../../../pages/PackageDetails';

export default function ProviderPackageDetailsPage({ params }: { params: Promise<{ providerId: string; packageIndex: string }> }) {
  const { providerId, packageIndex } = use(params);
  // PackageDetails expects packageId, so we'll need to handle this differently
  // For now, pass providerId and packageIndex - PackageDetails will need to be updated
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <PackageDetails packageId={packageIndex} />
    </ProtectedRouteNext>
  );
}

