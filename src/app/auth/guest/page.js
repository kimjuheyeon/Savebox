import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function GuestPage() {
  return (
    <section className="mx-auto mt-4 max-w-[400px]">
      <div className="rounded-[8px] border border-indigo-200 bg-indigo-50 p-5">
        <h1 className="text-2xl font-black text-slate-900">게스트로 둘러보기</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          회원가입 없이 바로 시작할 수 있어요. 저장 기능은 20개까지 사용할 수 있습니다.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-indigo-600 text-sm font-bold text-white"
        >
          <Sparkles size={16} />
          무료로 바로 사용하기
        </Link>

        <Link
          href="/auth"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-indigo-300 bg-white text-sm font-semibold text-indigo-700"
        >
          <ShieldCheck size={16} />
          로그인/회원가입
        </Link>
      </div>

      <p className="mt-7 rounded-[8px] border border-slate-200 bg-white p-4 text-sm text-slate-600">
        회원가입을 하면
        <span className="font-semibold text-slate-800"> 저장 개수 제한이 해제</span>되고
        <span className="font-semibold text-slate-800"> 모든 기기 동기화</span>가 가능합니다.
      </p>
    </section>
  );
}
