/**
 * Auth Model Layer
 * 
 * Traditional MVC Model:
 * - Responsible purely for authentication operations
 * - Contains no business logic
 * - Does not handle validation (moved to controller)
 * - Interacts directly with data source (Supabase in this case)
 */

import { createClient } from '@/lib/supabase/supabaseClient';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a new user account and profile
 */
export async function signupWithEmail(email: string, password: string, displayName: string = '', role: string = 'user', fullName: string = '') {
  // Pure data operation - no validation here (validation belongs in controller)
  const supabase = createClient();
  
  // Sign up the user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        display_name: displayName
      }
    }
  });
  
  // If signup was successful, create a profile record
  if (data?.user && !error) {
    // Use provided fullName or fallback to displayName if not provided
    const actualFullName = fullName.trim() ? fullName : displayName;
    
    // Create a profile record in the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        role: role,
        full_name: actualFullName
      });
      
    // If profile creation failed, return that error
    if (profileError) {
      return { data, error: profileError };
    }
  }
  
  return { data, error };
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
 * Get the current authenticated user data
 * This authenticates with Supabase Auth server instead of using local storage
 */
export async function getAuthenticatedUser() {
  const supabase = createClient();
  return await supabase.auth.getUser();
}

/**
 * Get the current session data
 * @deprecated Use getAuthenticatedUser() instead which is more secure
 * as it verifies the user with the auth server
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
 * @param code The authentication code from the URL
 */
export async function processAuthCode(code: string) {
  if (!code) {
    return { data: null, error: new Error('No authentication code provided') };
  }
  
  const supabase = createClient();
  return await supabase.auth.exchangeCodeForSession(code);
}