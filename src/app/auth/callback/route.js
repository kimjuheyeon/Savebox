import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const mode = searchParams.get('mode') || 'signin';

  // OAuth 에러가 있으면 로그인 페이지로 리디렉트
  if (error || errorDescription) {
    const dest = new URL('/auth/login', origin);
    dest.searchParams.set('error', errorDescription || error || '로그인에 실패했어요.');
    return NextResponse.redirect(dest);
  }

  // code가 없으면 에러
  if (!code) {
    const dest = new URL('/auth/login', origin);
    dest.searchParams.set('error', '인증 코드가 없습니다.');
    return NextResponse.redirect(dest);
  }

  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
        },
      },
    },
  );

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession 에러:', exchangeError.message);
    const dest = new URL('/auth/login', origin);
    dest.searchParams.set('error', `로그인 처리 실패: ${exchangeError.message}`);
    return NextResponse.redirect(dest);
  }

  // 프로필 동기화 (실패해도 로그인은 진행)
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      const metadata = userData.user.user_metadata || {};
      await supabase.from('profiles').upsert(
        {
          id: userData.user.id,
          email: userData.user.email,
          display_name: metadata.display_name || metadata.full_name || metadata.name || null,
          avatar_url: metadata.avatar_url || metadata.picture || null,
        },
        { onConflict: 'id' },
      );
    }
  } catch (syncError) {
    console.error('[auth/callback] 프로필 동기화 실패:', syncError.message);
  }

  // mode에 따라 리디렉트
  if (mode === 'link') {
    return NextResponse.redirect(new URL('/settings', origin));
  }

  return NextResponse.redirect(new URL('/', origin));
}
