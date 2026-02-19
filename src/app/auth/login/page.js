'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';
import GoogleMaterialButton from '@/components/GoogleMaterialButton';

const GOOGLE_OAUTH_FALLBACK_MESSAGE = '로그인에 실패했어요. Google로 다시 시도해 주세요.';
const GOOGLE_OAUTH_DISABLED_MESSAGE = 'Google 소셜 로그인이 현재 비활성화되어 있습니다.';
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

const OAUTH_PROVIDER_DISABLED_PATTERN = /(provider.*not.*enabled|unsupported.*provider|provider.*disabled|지원.*되지|미활성화|비활성화)/i;

export default function LoginPage() {
  const router = useRouter();
  const [hasError, setHasError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const callbackError = params.get('error');
    if (callbackError) setHasError(callbackError);
  }, []);

  const handleGoogleLogin = async () => {
    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      setHasError('Supabase 환경변수가 설정되지 않아 소셜 로그인을 시작할 수 없습니다.');
      return;
    }

    setHasError('');
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-6 max-w-[400px]">
      <h1 className="text-3xl font-black tracking-tight text-white">다시 만나서 반가워요</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#777777]">Google 계정으로 로그인해요.</p>

      <div className="mt-8 space-y-3">
        <GoogleMaterialButton
          onClick={handleGoogleLogin}
          disabled={isLoading}
          isLoading={isLoading}
          label="Sign in with Google"
        />
      </div>

      {hasError ? <p className="mt-2 text-xs font-semibold text-rose-400">{hasError}</p> : null}

      <p className="mt-6 text-center text-sm text-[#777777]">
        계정이 없으신가요?{' '}
        <Link href="/auth" className="font-semibold text-[#3385FF]">
          회원가입
        </Link>
      </p>
    </section>
  );
}
