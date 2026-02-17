import { createBrowserClient } from '@supabase/ssr';

let _browserClient = null;

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, key };
}

export function getSupabaseBrowserClient() {
  const { url, key } = getEnv();
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }

  if (!_browserClient) {
    _browserClient = createBrowserClient(url, key);
  }
  return _browserClient;
}

export function getSupabaseBrowserClientSafe() {
  const { url, key } = getEnv();
  if (!url || !key) {
    return null;
  }

  if (!_browserClient) {
    _browserClient = createBrowserClient(url, key);
  }
  return _browserClient;
}
