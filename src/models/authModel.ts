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
 * Get the current user's profile data including data from profiles table
 */
export async function getUserProfile() {
  const supabase = createClient();
  
  // Get auth user data
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData.user) {
    return { data: null, error: userError || new Error('User not found') };
  }
  
  // Get profile data from profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .single();
  
  return { 
    data: {
      user: userData.user,
      profile: profileData
    }, 
    error: userError || profileError 
  };
}

/**
 * Update profile record in the profiles table
 */
export async function updateProfile(userId: string, profileData: any) {
  const supabase = createClient();
  
  return await supabase
    .from('profiles')
    .update(profileData)
    .eq('user_id', userId);
}

/**
 * Update user metadata including display name
 */
export async function updateUserMetadata(metadata: any) {
  const supabase = createClient();
  return await supabase.auth.updateUser({ 
    data: metadata
  });
}

/**
 * Invite a new user (admin create, profile insert, send magic link)
 */
export async function inviteUserModel(email: string, role: string) {
  // Import adminSupabase only inside the function (server-only)
  const { adminSupabase } = await import('@/lib/supabase/adminClient');
  const { createClient: createAnonClient } = await import('@/lib/supabase/supabaseClient');

  // 1. Create user in auth.users via service role key
  const { data, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { role },
  });
  const userId = data?.user?.id;
  if (createError || !userId) {
    return { error: createError || new Error('User creation failed') };
  }

  // 2. Create profile in public.profiles
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({ user_id: userId, role, full_name: '' });
  if (profileError) {
    return { error: profileError };
  }

  // 3. Send magic link for account activation
  const anon = createAnonClient();
  const { error: inviteError } = await anon.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL + '/auth/activate' },
  });
  if (inviteError) {
    return { error: inviteError };
  }

  return { data: { userId } };
}