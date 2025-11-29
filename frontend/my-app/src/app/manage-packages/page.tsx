'use client';

import { useEffect, useState } from 'react';
import ProtectedRouteNext from '../../components/ProtectedRouteNext';
import ManagePackages from '../../pages/ManagePackages';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';
export const preferredRegion = 'auto';

export default function ManagePackagesPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Prevent SSR/prerendering
  }

  return (
    <ProtectedRouteNext allowedRoles={['provider'] as any}>
      <ManagePackages />
    </ProtectedRouteNext>
  );
}

