'use client';

import Home from '../../pages/Home';

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic';

export default function HomePage() {
  return <Home />;
}

