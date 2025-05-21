/**
 * Auth Model Layer
 * 
 * Traditional MVC Model:
 * - Responsible purely for data operations
 * - Contains no business logic
 * - Does not handle validation (moved to controller)
 * - Interacts directly with data source (Supabase in this case)
 */

import { createClient } from '@/lib/supabase/supabaseClient';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a new user account
 */
export async function signupWithEmail(email: string, password: string) {
  // Pure data operation - no validation here (validation belongs in controller)
  const supabase = createClient();
  return await supabase.auth.signUp({ email, password });
}

/**
 * Authenticate user with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

/**
 * Log out the current user
 */
export async function logout() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string, redirectUrl: string) {
  const supabase = createClient();
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
}

/**
 * Get the current session data
 */
export async function getSession() {
  const supabase = createClient();
  return await supabase.auth.getSession();
}

/**
 * Update the current user's password
 */
export async function updateUserPassword(password: string) {
  const supabase = createClient();
  return await supabase.auth.updateUser({ password });
}

/**
 * Process authentication code from Supabase
 */
export async function processAuthCode() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  return await supabase.auth.getSession();
}

/**
 * Get user data by ID
 */
export async function getUserById(userId: string) {
  const supabase = createClient();
  return await supabase.from('users').select('*').eq('id', userId).single();
}