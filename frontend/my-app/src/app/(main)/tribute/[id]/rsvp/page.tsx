'use client';

import { use } from 'react';
import ProtectedRouteNext from '../../../../../components/ProtectedRouteNext';
import TributeRSVPList from '../../../../../pages/TributeRSVPList';

export default function TributeRSVPListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <TributeRSVPList id={id} />
    </ProtectedRouteNext>
  );
}

