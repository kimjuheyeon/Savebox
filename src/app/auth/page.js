'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';
import GoogleMaterialButton from '@/components/GoogleMaterialButton';

const SOCIAL_SIGNUP_TOAST = 'Google 계정으로 다시 시도해 주세요.';
const SOCIAL_SIGNUP_DISABLED_MESSAGE = 'Google 소셜 로그인이 현재 비활성화되어 있습니다.';
const OAUTH_PROVIDER_DISABLED_PATTERN = /(provider.*not.*enabled|unsupported.*provider|provider.*disabled|지원.*되지|미활성화|비활성화)/i;

const buildAuthCallbackUrl = (mode, provider) => {
  if (typeof window === 'undefined') {
    const fallbackBase = process.env.NEXT_PUBLIC_SITE_URL || '';
    if (fallbackBase) return `${fallbackBase.replace(/\/$/, '')}/auth/callback?mode=${mode}&provider=${provider}`;
    return '/auth/callback?mode=' + mode + '&provider=' + provider;
  }

  const explicitBase = process.env.NEXT_PUBLIC_SITE_URL;
  const base = (explicitBase || window.location.origin).replace(/\/$/, '');
  return `${base}/auth/callback?mode=${mode}&provider=${provider}`;
};

export default function QuickSignupPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignup = async () => {
    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      setErrorMessage('Supabase 환경변수가 설정되지 않아 소셜 로그인을 시작할 수 없습니다.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const redirectTo = buildAuthCallbackUrl('signin', 'google');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error) {
        if (OAUTH_PROVIDER_DISABLED_PATTERN.test(error.message || '')) {
          setErrorMessage(SOCIAL_SIGNUP_DISABLED_MESSAGE);
          return;
        }
        throw new Error(error.message || SOCIAL_SIGNUP_TOAST);
      }
    } catch (error) {
      const message = error.message || SOCIAL_SIGNUP_TOAST;
      setErrorMessage(message);
      window.sessionStorage.setItem('settings-toast', message);
      router.push('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-[400px]">
      <p className="inline-flex rounded-[8px] bg-indigo-950/50 px-3 py-1 text-[11px] font-semibold text-indigo-400">
        SaveBox v1.0
      </p>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-white">SaveBox 시작하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#777777]">저장한 콘텐츠를 한 곳에서 모으고, 빠르게 재발견하세요.</p>

      <div className="mt-8 space-y-3">
        <GoogleMaterialButton
          onClick={handleGoogleSignup}
          disabled={isLoading}
          isLoading={isLoading}
          label="Sign in with Google"
        />
      </div>

      {errorMessage ? <p className="mt-2 text-xs font-semibold text-rose-400">{errorMessage}</p> : null}

      <p className="mt-6 text-center text-sm text-[#777777]">
        이미 계정이 있으신가요?{' '}
        <Link href="/auth/login" className="font-semibold text-indigo-400">
          로그인
        </Link>
      </p>
    </section>
  );
}
