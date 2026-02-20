'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ShareExtension from '@/components/ShareExtension';

function ShareExtensionWithParams() {
  const searchParams = useSearchParams();
  const sharedUrl = searchParams?.get?.('url') || searchParams?.get?.('text') || '';
  const sharedTitle = searchParams?.get?.('title') || '';

  return <ShareExtension sharedUrl={sharedUrl} sharedTitle={sharedTitle} />;
}

export default function ShareExtensionPage() {
  return (
    <Suspense fallback={null}>
      <ShareExtensionWithParams />
    </Suspense>
  );
}
