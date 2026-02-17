import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * 요청에서 인증된 사용자를 추출합니다.
 * 성공 시 { supabase, user } 반환, 실패 시 { error: NextResponse } 반환
 */
export async function getAuthUser(request) {
  const authorization = request.headers.get('authorization');
  if (!authorization) {
    return { error: NextResponse.json({ error: '토큰이 없습니다.' }, { status: 401 }) };
  }

  const [scheme, token] = authorization.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return { error: NextResponse.json({ error: '토큰이 없습니다.' }, { status: 401 }) };
  }

  const supabase = getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData?.user) {
    return { error: NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 }) };
  }

  return { supabase, user: authData.user };
}
