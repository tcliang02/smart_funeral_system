'use client';

import TributeHome from '../../../pages/TributeHome';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

export default function TributeHomePage() {
  return <TributeHome />;
}

