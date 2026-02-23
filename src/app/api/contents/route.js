export const dynamic = 'force-static';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/contents — 콘텐츠 목록 조회
// 쿼리 파라미터: collectionId, source, q (검색), limit, offset
export async function GET(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');
    const source = searchParams.get('source');
    const q = searchParams.get('q');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('contents')
      .select('*, collection:collections(id, name, color_tag)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (collectionId) query = query.eq('collection_id', collectionId);
    if (source) query = query.eq('source', source);
    if (q) query = query.or(`title.ilike.%${q}%,memo.ilike.%${q}%`);

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ contents: data || [], total: count });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// POST /api/contents — 새 콘텐츠 저장
export async function POST(request) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const body = await request.json();
    const title = String(body?.title || '').trim();
    const url = String(body?.url || '').trim();

    if (!title) {
      return NextResponse.json({ error: '제목을 입력해주세요.' }, { status: 400 });
    }
    if (!url) {
      return NextResponse.json({ error: 'URL을 입력해주세요.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contents')
      .insert({
        user_id: user.id,
        title,
        url,
        thumbnail_url: body?.thumbnailUrl || null,
        memo: body?.memo || null,
        source: body?.source || 'Other',
        color_tag: body?.colorTag || null,
        collection_id: body?.collectionId || null,
      })
      .select('*, collection:collections(id, name, color_tag)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ content: data, message: '콘텐츠가 저장되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
