export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
    return NextResponse.json({ message: '로그아웃되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '로그아웃 처리 실패' }, { status: 500 });
  }
}
