/**
 * User Management Model Layer
 * 
 * Traditional MVC Model:
 * - Responsible purely for data operations related to user management
 * - Contains no business logic
 * - Does not handle validation (moved to controller)
 * - Interacts directly with data source (Supabase in this case)
 */

import { createClient } from '@/lib/supabase/supabaseClient';

/**
 * Get the current user's profile data including data from profiles table
 */
export async function getUserProfile() {
  const supabase = createClient();
  
  // Get authenticated user data from server instead of local storage
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
export async function inviteUser(email: string, role: string) {
  // Import adminSupabase only inside the function (server-only)
  const { adminSupabase } = await import('@/lib/supabase/adminClient');
  
  // 1. Create user in auth.users via service role key
  const { data, error: createError } = await adminSupabase.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { role },
  });
  const userId = data?.user?.id;
  if (createError || !userId) {
    console.error('Error creating user:', createError);
    return { error: createError || new Error('User creation failed') };
  }
  // 2. Create profile in public.profiles
  const { error: profileError } = await adminSupabase
    .from('profiles')
    .insert({ user_id: userId, role, full_name: '' });
  if (profileError) {
    return { error: profileError };
  }

  // 3. Send magic link for account activation using the admin client
  // This avoids browser client issues in server environments
  const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_BASE_URL + '/auth/activate',
    data: { role }
  });
  
  if (inviteError) {
    return { error: inviteError };
  }

  return { data: { userId } };
}
