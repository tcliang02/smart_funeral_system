'use client';

import { use } from 'react';
import { useParams } from 'next/navigation';
import TributePage from '../../../../pages/TributePage';

export default function TributePageRoute({ params }: { params: Promise<{ id: string }> }) {
  // Try to get id from params Promise first
  const resolvedParams = use(params);
  const idFromParams = resolvedParams?.id;
  
  // Fallback to useParams hook (for client-side navigation)
  const urlParams = useParams();
  const idFromUrl = urlParams?.id as string;
  
  // Use whichever is available
  const id = idFromParams || idFromUrl;
  
  // Debug: Log if id is missing
  if (!id) {
    console.error('TributePageRoute: id is missing', { 
      idFromParams, 
      idFromUrl, 
      resolvedParams,
      urlParams 
    });
  }
  
  return <TributePage id={id} />;
}

