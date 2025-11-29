'use client';

import ProtectedRouteNext from '../../../../components/ProtectedRouteNext';
import AIChatbot from '../../../../pages/AIChatbot';

export default function AIChatbotPage() {
  return (
    <ProtectedRouteNext allowedRoles={['family']}>
      <AIChatbot />
    </ProtectedRouteNext>
  );
}

