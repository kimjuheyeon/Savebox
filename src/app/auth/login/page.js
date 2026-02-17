'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';
import { Info } from 'lucide-react';

const EMAIL_REGEXP = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GOOGLE_OAUTH_FALLBACK_MESSAGE = '로그인에 실패했어요. 이메일로 가입해보세요.';
const GOOGLE_OAUTH_DISABLED_MESSAGE = 'Google 소셜 로그인이 현재 비활성화되어 있습니다.';
const buildAuthCallbackUrl = (mode, provider) => {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, '');
  return `${base}/auth/callback?mode=${mode}&provider=${provider}`;
};

const OAUTH_PROVIDER_DISABLED_PATTERN = /(provider.*not.*enabled|unsupported.*provider|provider.*disabled|지원.*되지|미활성화|비활성화)/i;

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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const prefillEmail = params.get('email');
    if (prefillEmail) setEmail(prefillEmail);
    const callbackError = params.get('error');
    if (callbackError) setHasError(callbackError);
  }, []);

  const isValidEmail = useMemo(() => EMAIL_REGEXP.test(email.trim()), [email]);
  const isValidSubmit = useMemo(() => isValidEmail && password.length >= 8, [isValidEmail, password]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isValidSubmit || isLoading) return;

    setHasError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setHasError(payload.error || '로그인에 실패했습니다.');
        return;
      }

      const supabase = getSupabaseBrowserClientSafe();
      if (!supabase) {
        setHasError('Supabase 환경변수가 설정되지 않아 로그인할 수 없습니다.');
        return;
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: payload.session.access_token,
        refresh_token: payload.session.refresh_token,
      });
      if (sessionError) {
        setHasError(sessionError.message || '로그인 세션을 설정할 수 없습니다.');
        return;
      }
      await syncCurrentUser().catch(() => null);

      router.push('/');
    } catch (error) {
      setHasError(error.message || '로그인 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      setHasError('Supabase 환경변수가 설정되지 않아 소셜 로그인을 시작할 수 없습니다.');
      return;
    }

    setHasError('');
    setIsSocialLoading(true);
    try {
      const redirectTo = buildAuthCallbackUrl('signin', 'google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        if (OAUTH_PROVIDER_DISABLED_PATTERN.test(error.message || '')) {
          setHasError(GOOGLE_OAUTH_DISABLED_MESSAGE);
          return;
        }
        setHasError(error.message || GOOGLE_OAUTH_FALLBACK_MESSAGE);
        window.sessionStorage.setItem('settings-toast', GOOGLE_OAUTH_FALLBACK_MESSAGE);
        router.push('/auth');
      }
    } catch {
      setHasError(GOOGLE_OAUTH_FALLBACK_MESSAGE);
      window.sessionStorage.setItem('settings-toast', GOOGLE_OAUTH_FALLBACK_MESSAGE);
      router.push('/auth');
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-4 max-w-[400px]">
      <p className="inline-flex rounded-[8px] bg-indigo-100 px-3 py-1 text-[11px] font-semibold text-indigo-700">
        AUTH-05
      </p>
      <h1 className="mt-3 text-2xl font-black text-slate-900">다시 만나서 반가워요</h1>
      <p className="mt-2 text-sm text-slate-600">이메일/비밀번호로 로그인해요.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3">
        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700">
          이메일 주소
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="email"
        />

        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
          비밀번호
        </label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="8자 이상"
          className="h-12 w-full rounded-[8px] border border-slate-300 px-4 text-sm outline-none ring-indigo-300 transition focus:border-indigo-500 focus:ring-1"
          autoComplete="current-password"
        />

        {hasError ? <p className="text-xs font-semibold text-rose-600">{hasError}</p> : null}

        <button
          type="submit"
          disabled={!isValidSubmit || isLoading}
          className={`mt-2 h-12 w-full rounded-[8px] text-sm font-bold ${
            isValidSubmit && !isLoading ? 'bg-indigo-600 text-white' : 'cursor-not-allowed bg-indigo-200 text-indigo-100'
          }`}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="rounded-[8px] bg-slate-50 p-3 text-xs text-slate-600">
        <p className="flex items-center gap-2 font-semibold text-slate-700">
          <Info size={14} />
          계정이 없다면
        </p>
        <Link href="/auth" className="mt-2 inline-flex font-semibold text-indigo-700">
          회원가입 화면으로 이동
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="h-px flex-1 bg-slate-200" />
          또는
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSocialLoading || isLoading}
          className={`h-12 w-full rounded-[8px] border border-slate-300 px-4 py-2 text-sm font-semibold ${
            isSocialLoading || isLoading ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700'
          }`}
        >
          {isSocialLoading ? '처리 중...' : 'Google로 로그인'}
        </button>
      </div>
    </section>
  );
}
