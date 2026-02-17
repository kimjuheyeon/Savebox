import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json({ error: '이메일과 비밀번호를 모두 입력해 주세요.' }, { status: 400 });
    }

    if (!isEmail(email)) {
      return NextResponse.json({ error: '유효한 이메일을 입력해 주세요.' }, { status: 400 });
    }

    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      return NextResponse.json({ error: '로그인 세션을 생성하지 못했습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: data.session,
      message: '로그인에 성공했습니다.',
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
