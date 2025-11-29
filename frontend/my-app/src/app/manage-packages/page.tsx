'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManagePackages from '../../pages/ManagePackages';

export const dynamic = 'force-dynamic';

export default function ManagePackagesPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ManagePackages />
    </ProtectedRouteNext>
  );
}

