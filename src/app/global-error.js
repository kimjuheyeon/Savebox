'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="mx-auto w-full max-w-[440px] px-4 py-12">
          <div className="rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-4">
            <p className="text-sm font-semibold text-rose-300">서비스 오류가 발생했습니다</p>
            <h1 className="mt-2 text-xl font-black text-slate-100">요청을 처리하지 못했습니다</h1>
            <p className="mt-2 text-sm text-[#777777]">브라우저를 새로고침해 보시거나 홈으로 이동해 주세요.</p>
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
      </body>
    </html>
  );
}
