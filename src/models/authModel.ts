import { createClient } from '@/lib/supabase/supabaseClient';
import { createBrowserClient } from '@supabase/ssr';

export async function signupWithEmail(email: string, password: string) {
  if (password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters.' } };
  }
  const supabase = createClient();
  return await supabase.auth.signUp({ email, password });
}

export async function loginWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function logout() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

export async function resetPassword(email: string) {
  const supabase = createClient();
  
  // Define the redirect URL for password reset
  // This URL should point to your domain root, and the code parameter will be appended to it
  // The code will be handled by the redirection we implemented in the home page
  const redirectTo = window.location.origin;
  
  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo
  });
}

/**
 * Verify if the current session is valid
 * Used primarily for password reset validation
 */
export async function verifySession() {
  const supabase = createClient();
  return await supabase.auth.getSession();
}

/**
 * Update the user's password
 * Used for password reset functionality
 */
export async function updateUserPassword(password: string) {
  const supabase = createClient();
  return await supabase.auth.updateUser({ 
    password: password 
  });
}

/**
 * Process authentication code
 * This model function handles the Supabase auth code processing
 */
export async function processAuthCode() {
  // Create a new Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Let Supabase process the code (this happens automatically)
  // Just getting the session will trigger Supabase's internal authentication processes
  return await supabase.auth.getSession();
}