import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const parseToken = (request) => {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const [scheme, token] = authorization.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : null;
};

const parseProfilePayload = async (request) => {
  const body = await request.json();
  return {
    display_name: body?.displayName || body?.display_name || null,
    avatar_url: body?.avatarUrl || body?.avatar_url || null,
  };
};

export async function GET(request) {
  try {
    const token = parseToken(request);
    if (!token) return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 401 });

    const supabase = getSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data || null });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const token = parseToken(request);
    if (!token) return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 401 });

    const payload = await parseProfilePayload(request);
    const supabase = getSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const updates = {
      display_name: payload.display_name ?? null,
      avatar_url: payload.avatar_url ?? null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: authData.user.id, ...updates, updated_at: new Date().toISOString() }, { onConflict: 'id' })
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ profile: data, message: '프로필이 업데이트되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
