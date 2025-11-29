'use client';

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";

export default function ManagePackages() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Check if user is authenticated and is a provider
    if (!user || user.role !== 'provider') {
      router.push('/login');
      return;
    }

    // Redirect to the dashboard with packages tab active
    // Store activeTab in sessionStorage since Next.js doesn't support state prop
    sessionStorage.setItem('dashboardActiveTab', 'packages');
    router.push('/service-provider-dashboard');
  }, [user, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-medium text-gray-900">Redirecting to dashboard...</h2>
        <p className="mt-2 text-gray-600">Please wait while we redirect you to the packages section.</p>
      </div>
    </div>
  );
}
