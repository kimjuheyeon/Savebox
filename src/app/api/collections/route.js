export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/collections — 컬렉션 목록 조회
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('collections')
      .select('*, contents:contents(count)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const collections = (data || []).map((col) => ({
      ...col,
      item_count: col.contents?.[0]?.count ?? 0,
      contents: undefined,
    }));

    return NextResponse.json({ collections });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/collections — 새 컬렉션 생성
export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const body = await request.json();
    const name = String(body?.name || '').trim();

    if (!name) {
      return NextResponse.json({ error: '컬렉션 이름을 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        name,
        description: body?.description || null,
        color_tag: body?.colorTag || 'Blue',
        is_system: false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ collection: data, message: '컬렉션이 생성되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
