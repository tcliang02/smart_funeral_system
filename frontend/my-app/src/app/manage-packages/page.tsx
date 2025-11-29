'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManagePackages from '../../pages/ManagePackages';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function ManagePackagesPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ManagePackages />
    </ProtectedRouteNext>
  );
}

