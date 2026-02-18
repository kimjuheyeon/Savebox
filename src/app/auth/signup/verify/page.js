'use client';

import { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const COUNTDOWN_SECONDS = 60;

export default function VerifyPage() {
  const router = useRouter();
  const [email, setEmail] = useState('입력한 이메일');
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromQuery = params.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const handleResend = () => {
    setSeconds(COUNTDOWN_SECONDS);
  };

  const handleOpenLogin = () => {
    router.push(`/auth/login?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="mx-auto mt-4 max-w-[400px]">
      <div className="mb-6 flex items-center gap-2 rounded-[8px] bg-emerald-950/50 border border-emerald-800 px-3 py-3 text-emerald-400">
        <MailCheck size={18} />
        인증 메일 발송 완료
      </div>

      <h1 className="text-2xl font-black text-white">이메일 인증 기다리기</h1>
      <p className="mt-2 text-sm text-[#777777]">
        <span className="font-semibold text-[#ffffff]">{email}</span>로 인증 링크를 보냈습니다.
      </p>

      <div className="mt-6 rounded-[8px] border border-[#323232] bg-[#1E1E1E] p-4">
        <p className="mb-3 text-sm text-[#777777]">
          링크를 열어 회원가입을 완료하면 로그인 화면으로 자동 이동됩니다.
        </p>
        <p className="text-xs font-semibold text-[#616161]">
          재전송 가능까지 {seconds > 0 ? `${seconds}초` : '지금'}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={handleResend}
          disabled={seconds > 0}
          className={`h-12 w-full rounded-[8px] border text-sm font-semibold ${
            seconds > 0
              ? 'cursor-not-allowed border-[#323232] bg-[#1E1E1E] text-[#616161]'
              : 'border-indigo-500/30 bg-[#1E1E1E] text-indigo-300 hover:bg-indigo-900'
          }`}
        >
          이메일 다시 보내기
        </button>

        <button
          onClick={handleOpenLogin}
          className="h-12 w-full rounded-[8px] bg-[#3385FF] text-sm font-bold text-white hover:bg-[#2f78f0]"
        >
          로그인 화면으로 이동
        </button>

        <Link
          href="/"
          className="block h-12 w-full rounded-[8px] bg-[#1E1E1E] py-3 text-center text-sm font-semibold text-[#777777] hover:bg-[#1E1E1E]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </section>
  );
}
