import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

const extractAccessToken = (request) => {
  const authorization = request.headers.get('authorization');
  if (!authorization) return null;
  const [type, token] = authorization.split(' ');
  if (type?.toLowerCase() !== 'bearer') return null;
  return token || null;
};

export async function GET(request) {
  try {
    const supabase = getSupabaseServerClient();
    const token = extractAccessToken(request);
    const { data: authData, error: authError } = token
      ? await supabase.auth.getUser(token)
      : await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, display_name, avatar_url, created_at, updated_at')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({ user: authData.user, profile: profile || null });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
