'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClientSafe } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClientSafe();
    if (!supabase) {
      router.replace('/auth?error=Supabase 환경변수가 설정되지 않았습니다.');
      return;
    }

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.replace('/content');
      }
    });

    // URL에 code가 있으면 exchangeCodeForSession 시도
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace('/auth?error=인증에 실패했어요. 다시 시도해 주세요.');
        } else {
          router.replace('/content');
        }
      });
    } else {
      // PKCE flow: hash fragment 처리 (Supabase가 자동으로 처리)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/content');
        } else {
          router.replace('/auth?error=인증에 실패했어요. 다시 시도해 주세요.');
        }
      });
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121212]">
      <p className="text-sm text-slate-400">로그인 처리 중...</p>
    </main>
  );
}
