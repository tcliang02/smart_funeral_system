'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManagePackages from '../../pages/ManagePackages';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function ManagePackagesPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider'] as any}>
      <ManagePackages />
    </ProtectedRouteNext>
  );
}

