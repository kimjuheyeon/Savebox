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

    // implicit flow: 토큰이 hash fragment에 포함됨 (#access_token=...)
    // Supabase 클라이언트가 자동으로 hash를 감지하여 세션 설정
    const hash = window.location.hash;
    const code = new URLSearchParams(window.location.search).get('code');

    if (hash && hash.includes('access_token')) {
      // implicit flow — Supabase가 hash에서 자동으로 세션 복원
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/content');
        } else {
          // hash 파싱에 시간이 걸릴 수 있으므로 auth state change 대기
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              router.replace('/content');
            }
          });
          // 5초 타임아웃
          setTimeout(() => {
            subscription.unsubscribe();
            router.replace('/auth?error=인증에 실패했어요. 다시 시도해 주세요.');
          }, 5000);
        }
      });
    } else if (code) {
      // PKCE flow (로컬 서버) — route.js가 처리하지만 fallback
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace('/auth?error=인증에 실패했어요. 다시 시도해 주세요.');
        } else {
          router.replace('/content');
        }
      });
    } else {
      // 세션이 이미 있는지 확인
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
