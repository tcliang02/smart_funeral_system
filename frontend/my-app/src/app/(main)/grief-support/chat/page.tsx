'use client';

export const dynamic = 'force-dynamic';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import AIChatbot from '../../../../pages/AIChatbot';

export default function AIChatbotPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family'] as any}>
      <AIChatbot />
    </ProtectedRouteNext>
  );
}

