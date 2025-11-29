'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManageAddons from '../../pages/ManageAddons';

export default function ManageAddonsPage() {
  return (
    <ProtectedRouteNext allowedRoles={['provider'] as any}>
      <ManageAddons />
    </ProtectedRouteNext>
  );
}

