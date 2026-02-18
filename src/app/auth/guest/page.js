import Link from 'next/link';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function GuestPage() {
  return (
    <section className="mx-auto mt-4 max-w-[400px]">
      <div className="rounded-[8px] border border-indigo-500/20 bg-indigo-950/30 p-5">
        <h1 className="text-2xl font-black text-white">게스트로 둘러보기</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#777777]">
          회원가입 없이 바로 시작할 수 있어요. 저장 기능은 20개까지 사용할 수 있습니다.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <Link
          href="/"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-[#3385FF] text-sm font-bold text-white hover:bg-[#2f78f0]"
        >
          <Sparkles size={16} />
          무료로 바로 사용하기
        </Link>

        <Link
          href="/auth"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] border border-indigo-500/30 bg-[#1E1E1E] text-sm font-semibold text-indigo-300 hover:bg-indigo-900"
        >
          <ShieldCheck size={16} />
          로그인/회원가입
        </Link>
      </div>

      <p className="mt-7 rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-4 text-sm text-[#777777]">
        회원가입을 하면
        <span className="font-semibold text-[#ffffff]"> 저장 개수 제한이 해제</span>되고
        <span className="font-semibold text-[#ffffff]"> 모든 기기 동기화</span>가 가능합니다.
      </p>
    </section>
  );
}
