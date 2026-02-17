import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_CLIENT_OPTIONS = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
};

export function getSupabaseAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다.');
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, ADMIN_CLIENT_OPTIONS);
}

export function getSupabaseServerClient() {
  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL가 설정되지 않았습니다.');
  }

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다.');
  }

  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, anonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        cookieStore.set({
          name,
          value,
          ...options,
        });
      },
      remove(name, options) {
        cookieStore.delete({
          name,
          ...options,
        });
      },
    },
  });
}
