'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';

const syncCurrentUser = async () => {
  const response = await fetch('/api/auth/sync-user', { method: 'POST' });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    return {
      ok: false,
      message: payload?.error || '로그인 후 사용자 정보를 저장하지 못했습니다.',
    };
  }
  return { ok: true };
};

const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isValidEmail = useMemo(() => EMAIL_REGEXP.test(email.trim()), [email]);
  const isValidPassword = useMemo(() => password.length >= 8, [password]);
  const isValidSubmit = useMemo(
    () => isValidEmail && isValidPassword && password === passwordConfirm,
    [isValidEmail, isValidPassword, password, passwordConfirm],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidSubmit || isLoading) return;
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          displayName: displayName.trim(),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setErrorMessage(payload.error || '회원가입 요청에 실패했습니다.');
        setIsLoading(false);
        return;
      }

      if (payload.session) {
        const supabase = getSupabaseBrowserClientSafe();
        if (!supabase) {
          setErrorMessage('Supabase 환경변수가 설정되지 않아 세션을 저장할 수 없습니다.');
          return;
        }
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: payload.session.access_token,
          refresh_token: payload.session.refresh_token,
        });
        if (sessionError) {
          setErrorMessage(sessionError.message || '로그인 세션을 설정할 수 없습니다.');
          return;
        }
        await syncCurrentUser().catch(() => null);
        router.push('/');
        return;
      }

      if (payload.requiresEmailVerification) {
        router.push(`/auth/signup/verify?email=${encodeURIComponent(email.trim())}`);
        return;
      }

      setErrorMessage('예상치 못한 응답입니다. 잠시 후 다시 시도해 주세요.');
    } catch (error) {
      setErrorMessage(error.message || '회원가입 요청 중 알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-4 max-w-[400px]">
      <h1 className="text-2xl font-black text-slate-900">이메일로 시작</h1>
      <p className="mt-2 text-sm text-slate-700">이메일 주소와 비밀번호로 가입을 진행해요.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        <label htmlFor="displayName" className="block text-sm font-semibold text-slate-700">
          이름 (선택)
        </label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          placeholder="닉네임"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="name"
        />

        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          이메일 주소
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="email"
        />

        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="8자 이상"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="new-password"
        />

        <label htmlFor="passwordConfirm" className="block text-sm font-semibold text-slate-700">
          비밀번호 확인
        </label>
        <input
          id="passwordConfirm"
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          placeholder="비밀번호 재입력"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="new-password"
        />

        {errorMessage ? <p className="text-sm font-semibold text-rose-600">{errorMessage}</p> : null}

        <button
          type="submit"
          disabled={!isValidSubmit || isLoading}
          className={`mt-2 h-12 w-full rounded-[8px] text-sm font-bold ${
            isValidSubmit && !isLoading
              ? 'bg-indigo-600 text-white'
              : 'cursor-not-allowed bg-indigo-200 text-indigo-100'
          }`}
        >
          {isLoading ? '가입 처리중...' : '다음'}
        </button>
      </form>

      <p className="mt-6 text-xs text-slate-500">
        이미 입력한 주소로 가입이 진행 중이면 계속 진행할 수 있어요.
      </p>
    </section>
  );
}
