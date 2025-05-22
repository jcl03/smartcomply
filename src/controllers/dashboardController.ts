/**
 * Dashboard Controller
 * 
 * Handles server-side session verification and data fetching for the dashboard.
 * Following MVC, this controller handles business logic separate from the view.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Verifies user is authenticated and gets user data
 * @returns User session data if authenticated, or redirects to login
 */
export async function getDashboardData() {
  const supabase = await createClient();
  
  // Get session (authentication check)
  const { data } = await supabase.auth.getSession();
  
  // Authenticate the user data by contacting the Supabase Auth server
  const { data: userData } = await supabase.auth.getUser();
  
  // If no authenticated user, redirect to login
  if (!userData.user) {
    redirect('/login');
  }
  
  // Get profile data from the profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.user.id)
    .single();
  
  // Parse user data and prepare display name
  const displayName = userData.user.user_metadata?.display_name || '';
  const fullName = profileData?.full_name || displayName;
  const role = profileData?.role || 'user';
  
  return {
    user: {
      ...userData.user,
      displayName: fullName || userData.user.email,
      role: role,
      profile: profileData || null
    }
  };
}
