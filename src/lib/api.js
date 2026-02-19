import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function getClient() {
  return getSupabaseBrowserClient();
}

async function getUserId() {
  const supabase = getClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

// ─── Collections ───────────────────────────────────

export async function fetchCollections() {
  const supabase = getClient();
  const userId = await getUserId();
  if (!userId) return [];

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
  if (!userId) throw new Error('로그인이 필요합니다.');

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
  const supabase = getClient();
  const { error } = await supabase
    .from('collections')
    .delete()
    .in('id', ids);

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
  if (!userId) return { contents: [], total: 0 };

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
  if (!userId) throw new Error('로그인이 필요합니다.');

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
