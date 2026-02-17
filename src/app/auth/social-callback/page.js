'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SocialCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qs = searchParams?.toString();
    const nextPath = `/auth/callback${qs ? `?${qs}` : ''}`;
    router.replace(nextPath);
  }, [router, searchParams]);

  return null;
}

export default function SocialCallbackPage() {
  return (
    <Suspense fallback={null}>
      <SocialCallbackInner />
    </Suspense>
  );
}
