'use client';

import ProtectedRouteNext from '../../../../../components/ProtectedRouteNext';
import PackageSelectionPage from '../../../../../pages/PackageSelectionPage';

export default function PackageSelectionPageRoute({ params }: { params: { providerId: string } }) {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <PackageSelectionPage />
    </ProtectedRouteNext>
  );
}

