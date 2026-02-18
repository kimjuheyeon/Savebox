'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[440px] px-4 py-12">
      <div className="rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-4">
        <h1 className="text-xl font-black text-slate-100">요청한 페이지를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-[#777777]">주소가 변경됐거나 삭제되었을 수 있어요.</p>
        <Link href="/" className="mt-4 inline-flex rounded-[8px] bg-[#3385FF] px-4 py-2 text-sm font-semibold text-white">
          홈으로
        </Link>
      </div>
    </main>
  );
}
