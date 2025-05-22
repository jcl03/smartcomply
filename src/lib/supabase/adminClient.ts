import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// Only run this code on the server
if (typeof window !== 'undefined') {
  throw new Error('adminClient.ts should only be imported on the server');
}

const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
if (!serviceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin Supabase client');
}

export const adminSupabase = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey
);
