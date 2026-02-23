export const dynamic = 'force-static';
export function generateStaticParams() { return []; }
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-auth';

// GET /api/collections/:id — 컬렉션 상세 조회
export async function GET(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: '컬렉션을 찾을 수 없습니다.' }, { status: 404 });

    return NextResponse.json({ collection: data });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// PATCH /api/collections/:id — 컬렉션 수정
export async function PATCH(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const body = await request.json();
    const updates = {};

    if (body?.name !== undefined) updates.name = String(body.name).trim();
    if (body?.description !== undefined) updates.description = body.description;
    if (body?.colorTag !== undefined) updates.color_tag = body.colorTag;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: '수정할 항목이 없습니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ collection: data, message: '컬렉션이 수정되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// DELETE /api/collections/:id — 컬렉션 삭제 (콘텐츠는 유지, collection_id → null)
export async function DELETE(request, { params }) {
  try {
    const auth = await getAuthUser(request);
    if (auth.error) return auth.error;
    const { supabase, user } = auth;

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: '컬렉션이 삭제되었습니다.' });
  } catch (error) {
    return NextResponse.json({ error: error.message || '요청 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
