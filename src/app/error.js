'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-[440px] px-4 py-12">
      <div className="rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-4">
        <p className="text-sm font-semibold text-rose-300">문제가 발생했어요</p>
        <h1 className="mt-2 text-xl font-black text-slate-100">페이지를 불러올 수 없습니다</h1>
        <p className="mt-2 text-sm text-[#777777]">잠시 후 다시 시도해 주세요.</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => reset()}
            className="rounded-[8px] bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="rounded-[8px] border border-[#323232] px-4 py-2 text-sm font-semibold text-[#777777]"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
