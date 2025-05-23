import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with anon key (for client-side operations)
export const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create Supabase admin client with service role key (for admin operations)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  : null;

// Helper function to get appropriate client based on operation
export const getSupabase = (useAdmin: boolean = false) => {
  if (useAdmin && !supabaseAdmin) {
    throw new Error('Service role key not configured for admin operations');
  }
  return useAdmin ? supabaseAdmin! : supabaseClient;
};
