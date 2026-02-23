// Web-specific Supabase client
// - No URL polyfill (browsers have native URL)
// - Uses same-origin proxy to avoid cross-origin HTTPS fetch from HTTP page
import { createClient } from '@supabase/supabase-js';

// On web, route through nginx proxy at /supabase/ to avoid cross-origin issues
const supabaseUrl =
  typeof window !== 'undefined'
    ? `${window.location.origin}/supabase`
    : process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[SUPABASE] Initializing client:', {
  url: supabaseUrl,
  keyPrefix: supabaseAnonKey?.substring(0, 20) + '...',
  urlDefined: !!supabaseUrl,
  keyDefined: !!supabaseAnonKey,
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
