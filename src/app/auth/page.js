'use client';

import { useState } from 'react';
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
      <h1 className="text-3xl font-black tracking-tight text-white">SaveBox 시작하기</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#777777]">
        별도 회원가입 없이 Google 계정 하나로 바로 시작하세요.<br />
        저장한 콘텐츠를 한 곳에서 모으고, 빠르게 재발견할 수 있어요.
      </p>

      <div className="mt-8 space-y-3">
        <GoogleMaterialButton
          onClick={handleGoogleSignup}
          disabled={isLoading}
          isLoading={isLoading}
          label="Sign in with Google"
        />
      </div>

      {errorMessage ? <p className="mt-2 text-xs font-semibold text-rose-400">{errorMessage}</p> : null}

      <div className="mt-8 rounded-[14px] border border-[#323232] bg-[#1E1E1E] p-4">
        <h3 className="text-xs font-bold text-slate-100">무료 체험 정책</h3>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-[#777777]">
          <li className="flex items-start gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#3385FF]" />
            로그인 없이 최대 <strong className="text-slate-300">5개</strong>까지 콘텐츠를 저장할 수 있어요.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#3385FF]" />
            로그인하면 저장 제한 없이 <strong className="text-slate-300">무제한</strong>으로 사용할 수 있어요.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#3385FF]" />
            무료 저장한 콘텐츠는 로그인 시 자동으로 계정에 옮겨져요.
          </li>
        </ul>
      </div>

      <p className="mt-5 text-center text-xs text-[#616161]">
        이미 사용 중이신 분도 같은 버튼으로 로그인돼요.
      </p>
    </section>
  );
}
