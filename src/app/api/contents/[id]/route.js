export const dynamic = 'force-static';
export function generateStaticParams() { return []; }
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/contents/:id — 콘텐츠 상세 조회
export async function GET(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('contents')
      .select('*, collection:collections(id, name, color_tag)')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다.' }, { status: 404 });

    return NextResponse.json({ content: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH /api/contents/:id — 콘텐츠 수정
export async function PATCH(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const body = await request.json();
    const updates = {};

    if (body?.title !== undefined) updates.title = String(body.title).trim();
    if (body?.url !== undefined) updates.url = String(body.url).trim();
    if (body?.thumbnailUrl !== undefined) updates.thumbnail_url = body.thumbnailUrl;
    if (body?.memo !== undefined) updates.memo = body.memo;
    if (body?.source !== undefined) updates.source = body.source;
    if (body?.colorTag !== undefined) updates.color_tag = body.colorTag;
    if (body?.collectionId !== undefined) updates.collection_id = body.collectionId || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contents')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select('*, collection:collections(id, name, color_tag)')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ content: data, message: '콘텐츠가 수정되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE /api/contents/:id — 콘텐츠 삭제
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { error } = await supabase
      .from('contents')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: '콘텐츠가 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
