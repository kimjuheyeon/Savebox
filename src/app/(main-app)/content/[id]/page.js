import { Suspense } from 'react';
import { MOCK_CONTENTS } from '@/lib/prototypeData';
import ContentDetailClient from './ContentDetailClient';

export function generateStaticParams() {
  return MOCK_CONTENTS.map((item) => ({ id: item.id }));
}

export default function ContentDetailPage({ params }) {
  return (
    <Suspense fallback={null}>
      <ContentDetailClient params={params} />
    </Suspense>
  );
}
