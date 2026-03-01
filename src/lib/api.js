import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getGuestContents, addGuestContent, updateGuestContent, removeGuestContent, clearGuestContents, getGuestCollections, addGuestCollection, removeGuestCollection, clearGuestCollections } from '@/lib/guestStorage';

function getClient() {
  return getSupabaseBrowserClient();
}

let _cachedUserId = undefined;

async function getUserId() {
  if (_cachedUserId !== undefined) return _cachedUserId;
  const supabase = getClient();
  const { data: { session } } = await supabase.auth.getSession();
  _cachedUserId = session?.user?.id || null;
  return _cachedUserId;
}

export function clearUserIdCache() {
  _cachedUserId = undefined;
}

let _migrationPromise = null;
let _migrationDone = false;

export async function migrateGuestData() {
  if (_migrationDone) return;
  if (_migrationPromise) return _migrationPromise;
  _migrationPromise = _doMigrate().finally(() => { _migrationPromise = null; });
  return _migrationPromise;
}

async function _doMigrate() {
  const supabase = getClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return; // 비로그인이면 스킵 (promise 초기화됨, 다음에 재시도)

  // 캐시를 로그인 유저로 갱신
  _cachedUserId = session.user.id;
  const userId = session.user.id;

  const guestCols = getGuestCollections();
  const guestItems = getGuestContents();

  if (guestCols.length === 0 && guestItems.length === 0) {
    _migrationDone = true;
    return;
  }

  const idMap = {}; // guest_col_xxx → real DB UUID

  // 1) 컬렉션을 하나씩 insert하여 확실하게 ID 매핑
  if (guestCols.length > 0) {
    clearGuestCollections();
    for (const gc of guestCols) {
      const { data, error } = await supabase
        .from('collections')
        .insert({
          user_id: userId,
          name: gc.name,
          description: gc.description || null,
          color_tag: gc.color_tag || 'Blue',
          is_system: false,
        })
        .select('id')
        .single();
      console.log('[Migration] collection insert:', gc.id, gc.name, '→', data?.id, error?.message);
      if (!error && data) {
        idMap[gc.id] = data.id;
      }
    }
  }

  console.log('[Migration] idMap:', JSON.stringify(idMap));
  console.log('[Migration] guestItems:', JSON.stringify(guestItems.map(i => ({ id: i.id, collection_id: i.collection_id }))));

  // 2) 컨텐츠 마이그레이션 (collection_id 매핑 적용)
  if (guestItems.length > 0) {
    clearGuestContents();
    const rows = guestItems.map((item) => ({
      user_id: userId,
      title: item.title,
      url: item.url,
      thumbnail_url: item.thumbnail_url || null,
      memo: item.memo || null,
      source: item.source || 'Other',
      collection_id: item.collection_id ? (idMap[item.collection_id] || null) : null,
    }));
    console.log('[Migration] content rows collection_ids:', rows.map(r => r.collection_id));
    const { error: contentError } = await supabase.from('contents').insert(rows);
    console.log('[Migration] content insert error:', contentError?.message || 'none');
  }

  _migrationDone = true;
}

// ─── Collections ───────────────────────────────────

export async function fetchCollections() {
  const supabase = getClient();
  const userId = await getUserId();
  if (!userId) {
    const cols = getGuestCollections();
    const items = getGuestContents();
    return cols.map((col) => ({
      ...col,
      item_count: items.filter((i) => i.collection_id === col.id).length,
    }));
  }

  const { data, error } = await supabase
    .from('collections')
    .select('*, contents:contents(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return (data || []).map((col) => ({
    ...col,
    item_count: col.contents?.[0]?.count ?? 0,
    contents: undefined,
  }));
}

export async function createCollection({ name, description, colorTag }) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!userId) return addGuestCollection({ name, description });

  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description: description || null,
      color_tag: colorTag || 'Blue',
      is_system: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCollection(id, updates) {
  const supabase = getClient();
  const dbUpdates = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.colorTag !== undefined) dbUpdates.color_tag = updates.colorTag;

  const { data, error } = await supabase
    .from('collections')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCollections(ids) {
  const guestIds = ids.filter((id) => typeof id === 'string' && id.startsWith('guest_col_'));
  const dbIds = ids.filter((id) => !guestIds.includes(id));

  guestIds.forEach((id) => removeGuestCollection(id));

  if (dbIds.length === 0) return;
  const supabase = getClient();
  const { error } = await supabase
    .from('collections')
    .delete()
    .in('id', dbIds);

  if (error) throw error;
}

export async function deleteContentsInCollections(collectionIds) {
  const supabase = getClient();
  const { error } = await supabase
    .from('contents')
    .delete()
    .in('collection_id', collectionIds);

  if (error) throw error;
}

// ─── Contents ──────────────────────────────────────

export async function fetchContents({ collectionId, source, q, limit = 50, offset = 0 } = {}) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!userId) {
    let items = getGuestContents();
    if (collectionId) items = items.filter((i) => i.collection_id === collectionId);
    if (source) items = items.filter((i) => i.source === source);
    if (q) items = items.filter((i) => (i.title || '').includes(q) || (i.memo || '').includes(q));
    return { contents: items, total: items.length };
  }

  let query = supabase
    .from('contents')
    .select('*, collection:collections(id, name, color_tag)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (collectionId) query = query.eq('collection_id', collectionId);
  if (source) query = query.eq('source', source);
  if (q) query = query.or(`title.ilike.%${q}%,memo.ilike.%${q}%`);

  const { data, error, count } = await query;

  if (error) throw error;
  return { contents: data || [], total: count };
}

export async function fetchContent(id) {
  if (typeof id === 'string' && id.startsWith('guest_')) {
    const items = getGuestContents();
    const item = items.find((i) => i.id === id);
    if (item && item.collection_id) {
      const cols = getGuestCollections();
      item.collection = cols.find((c) => c.id === item.collection_id) || null;
    }
    return item || null;
  }
  const supabase = getClient();
  const { data, error } = await supabase
    .from('contents')
    .select('*, collection:collections(id, name, color_tag)')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createContent({ title, url, thumbnailUrl, memo, source, colorTag, collectionId }) {
  const supabase = getClient();
  const userId = await getUserId();
  if (!userId) {
    return addGuestContent({
      title,
      url,
      thumbnail_url: thumbnailUrl || null,
      memo: memo || null,
      source: source || 'Other',
      collection_id: collectionId || null,
    });
  }

  const { data, error } = await supabase
    .from('contents')
    .insert({
      user_id: userId,
      title,
      url,
      thumbnail_url: thumbnailUrl || null,
      memo: memo || null,
      source: source || 'Other',
      color_tag: colorTag || null,
      collection_id: collectionId || null,
    })
    .select('*, collection:collections(id, name, color_tag)')
    .single();

  if (error) throw error;
  return data;
}

export async function updateContent(id, updates) {
  if (typeof id === 'string' && id.startsWith('guest_')) {
    const guestUpdates = {};
    if (updates.title !== undefined) guestUpdates.title = updates.title;
    if (updates.url !== undefined) guestUpdates.url = updates.url;
    if (updates.thumbnailUrl !== undefined) guestUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.memo !== undefined) guestUpdates.memo = updates.memo;
    if (updates.source !== undefined) guestUpdates.source = updates.source;
    if (updates.collectionId !== undefined) guestUpdates.collection_id = updates.collectionId || null;
    const updated = updateGuestContent(id, guestUpdates);
    if (!updated) throw new Error('게스트 콘텐츠를 찾을 수 없습니다.');
    if (updated.collection_id) {
      const cols = getGuestCollections();
      updated.collection = cols.find((c) => c.id === updated.collection_id) || null;
    }
    return updated;
  }

  const supabase = getClient();
  const dbUpdates = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.url !== undefined) dbUpdates.url = updates.url;
  if (updates.thumbnailUrl !== undefined) dbUpdates.thumbnail_url = updates.thumbnailUrl;
  if (updates.memo !== undefined) dbUpdates.memo = updates.memo;
  if (updates.source !== undefined) dbUpdates.source = updates.source;
  if (updates.colorTag !== undefined) dbUpdates.color_tag = updates.colorTag;
  if (updates.collectionId !== undefined) dbUpdates.collection_id = updates.collectionId || null;

  const { data, error } = await supabase
    .from('contents')
    .update(dbUpdates)
    .eq('id', id)
    .select('*, collection:collections(id, name, color_tag)')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteContent(id) {
  if (typeof id === 'string' && id.startsWith('guest_')) {
    removeGuestContent(id);
    return;
  }
  const supabase = getClient();
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAllContents() {
  const userId = await getUserId();
  if (!userId) throw new Error('로그인이 필요합니다.');

  const supabase = getClient();
  const { error } = await supabase
    .from('contents')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
