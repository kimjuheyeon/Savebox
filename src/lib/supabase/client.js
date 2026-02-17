import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClientSafe() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
