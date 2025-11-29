'use client';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManageAddons from '../../pages/ManageAddons';

export default function ManageAddonsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider']}>
      <ManageAddons />
    </ProtectedRouteNext>
  );
}

