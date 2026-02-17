import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const normalizePayload = (user) => {
  if (!user) {
    return null;
  }

  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email,
    display_name: metadata.display_name || metadata.full_name || metadata.name || null,
    avatar_url: metadata.avatar_url || metadata.picture || null,
  };
};

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: '로그인 세션이 없습니다.' }, { status: 401 });
    }

    const payload = normalizePayload(authData.user);
    if (!payload) {
      return NextResponse.json({ error: '유효하지 않은 사용자 정보입니다.' }, { status: 400 });
    }

    const { error } = await supabase.from('profiles').upsert(payload, {
      onConflict: 'id',
    });

    if (error) {
      return NextResponse.json({ error: error.message || '사용자 정보 저장 실패' }, { status: 500 });
    }

    return NextResponse.json({ message: '사용자 정보가 동기화되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
