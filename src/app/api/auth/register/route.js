import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const safeMessage = {
  missingField: '필수 입력값이 비어있습니다.',
  invalidEmail: '유효한 이메일을 입력해 주세요.',
  shortPassword: '비밀번호는 8자 이상이어야 합니다.',
};

const isEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
};

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');
    const displayName = String(body?.displayName || '').trim() || null;

    if (!email || !password) {
      return NextResponse.json({ error: safeMessage.missingField }, { status: 400 });
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: safeMessage.invalidEmail }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: safeMessage.shortPassword }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const appOrigin = new URL(request.url).origin;
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL || appOrigin}/auth/signup/verify`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      return NextResponse.json({ error: '회원가입 처리에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
      requiresEmailVerification: !data.session,
        message: data.session ? '회원가입이 완료되었습니다.' : '이메일 인증 메일이 발송되었습니다.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
