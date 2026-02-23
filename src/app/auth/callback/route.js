export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = getSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/content`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=인증에 실패했어요. 다시 시도해 주세요.`);
}
