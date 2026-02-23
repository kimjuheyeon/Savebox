export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient, getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    const { data: userResult, error: userError } = await supabase.auth.getUser();

    if (userError || !userResult?.user) {
      return NextResponse.json({ error: '로그인 세션이 없습니다.' }, { status: 401 });
    }

    const admin = getSupabaseAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(userResult.user.id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message || '계정 삭제 실패' }, { status: 500 });
    }

    return NextResponse.json({ message: '계정이 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
