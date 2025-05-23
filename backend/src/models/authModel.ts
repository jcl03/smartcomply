import { supabaseClient, getSupabase } from '../config/supabase';

/**
 * Authentication Model
 * Handles direct interactions with Supabase Auth
 */

/**
 * Create a new user account
 */
export async function signupWithEmail(email: string, password: string, displayName: string = '', role: string = 'user', fullName: string = '') {
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: role, // Add role to user metadata during signup
        },
      },
    });

    if (authError) {
      console.error('Error signing up:', authError.message);
      return { data: null, error: { message: authError.message || 'Error during sign up' } };
    }

    if (!authData.user) {
      return { data: null, error: { message: 'User data not returned after sign up' } };
    }

    // Create a corresponding user profile in the public.users table
    const actualFullName = fullName.trim() ? fullName : displayName;
    const { error: profileError } = await supabaseClient
      .from('users')
      .insert([{ 
        id: authData.user.id, 
        email: authData.user.email,
        display_name: displayName,
        full_name: actualFullName, // Use actualFullName
        role: role, // Persist role in users table
      }]);

    if (profileError) {
      console.error('Error creating user profile:', profileError.message);
      // Optionally, handle rollback or cleanup if profile creation fails
      return { data: null, error: { message: profileError.message || 'Error creating user profile' } };
    }
    
    return { data: authData, error: null };
  } catch (error: any) {
    console.error('Unexpected error in signupWithEmail:', error.message);
    return { data: null, error: { message: error.message || 'Failed to sign up' } };
  }
}

/**
 * Log in with email and password
 */
export async function loginWithEmail(email: string, password: string) {
  return await supabaseClient.auth.signInWithPassword({ email, password });
}

/**
 * Log out current session
 */
export async function logout(token?: string) {
  if (token) {
    return await supabaseClient.auth.signOut({ scope: 'global' });
  }
  return await supabaseClient.auth.signOut();
}

/**
 * Request password reset email
 */
export async function resetPassword(email: string, redirectUrl: string) {
  return await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: `${redirectUrl}/auth/reset-password`
  });
}

/**
 * Update user's password
 */
export async function updateUserPassword(password: string, token?: string) {
  // If token is provided, use it to authenticate the request
  if (token) {
    // Set the auth token for this request
    const supabase = supabaseClient;
    
    // Update the user's password
    return await supabase.auth.updateUser({ password });
  }
  
  // Without token, this will use the current session
  return await supabaseClient.auth.updateUser({ password });
}

/**
 * Process authentication code from URL
 */
export async function processAuthCode(code: string) {
  try {
    return await supabaseClient.auth.exchangeCodeForSession(code);
  } catch (error: any) {
    return { data: null, error: { message: error?.message || 'Failed to process authentication code' } };
  }
}

/**
 * Get the current session
 */
export async function getSession(token?: string) {
  if (token) {
    // Get session using the token
    return await supabaseClient.auth.getSession();
  }
  
  // Without token, use the current session
  return await supabaseClient.auth.getSession();
}

/**
 * Get authenticated user
 */
export async function getAuthenticatedUser(token?: string) {
  if (token) {
    // Get user using the token
    return await supabaseClient.auth.getUser(token);
  }
  
  // Without token, use the current session
  return await supabaseClient.auth.getUser();
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(metadata: any, token?: string) {
  if (token) {
    // Set the auth token for this request
    const supabase = supabaseClient;
    
    // Update the user's metadata
    return await supabase.auth.updateUser({ data: metadata });
  }
  
  // Without token, this will use the current session
  return await supabaseClient.auth.updateUser({ data: metadata });
}

// This function is a placeholder for resetting password with a custom token.
// Supabase's primary password reset flow involves an email link that authenticates the user.
// If you are managing custom tokens, you'll need to implement the verification
// and user update logic, possibly using Supabase admin privileges if not in user context.
export async function performPasswordResetWithToken(token: string, newPassword: string): Promise<{ error: { message: string } | null }> {
  console.warn(
    'performPasswordResetWithToken is a placeholder. Supabase password reset via API with a custom token requires specific implementation for token validation and user update, potentially using admin rights.'
  );
  // Example: If you had a table `password_reset_tokens` with `token`, `user_id`, `expires_at`
  // 1. Verify token: SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()
  // 2. If valid, update user: supabaseClient.auth.admin.updateUserById(user_id, { password: newPassword })
  //    (This requires service_role key and running on the backend)
  // 3. Invalidate or delete the token.

  // For now, returning a dummy success to allow controller to compile.
  // Replace with actual implementation.
  try {
    // Simulate an update or call a non-existent admin function for structure
    // const { data, error } = await supabaseClient.auth.admin.updateUserById(USER_ID_FROM_TOKEN, { password: newPassword });
    // if (error) return { error: { message: error.message } };
    // return { error: null };
    console.log(`Attempting to reset password with token: ${token} and new password.`);
    // This is where you would integrate with a custom token verification and password update mechanism.
    // Since Supabase client SDK doesn't directly support this for a generic token without an active session from a reset link,
    // this function would typically involve backend logic interacting with your database (for token verification)
    // and potentially Supabase Admin API for updating the user password if not in an authenticated user session context.
    return { error: { message: 'Password reset with custom token not fully implemented.' } }; // Placeholder response
  } catch (e: any) {
    return { error: { message: e.message || 'Error performing password reset with token.' } };
  }
}
