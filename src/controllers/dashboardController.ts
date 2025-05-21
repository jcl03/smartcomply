/**
 * Dashboard Controller
 * 
 * Handles server-side session verification and data fetching for the dashboard.
 * Following MVC, this controller handles business logic separate from the view.
 */

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Verifies user is authenticated and gets user data
 * @returns User session data if authenticated, or redirects to login
 */
export async function getDashboardData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  
  // Get session (authentication check)
  const { data: { session } } = await supabase.auth.getSession();
  
  // If no session, user is not authenticated
  if (!session) {
    redirect('/login');
  }
  
  // You could fetch additional user data here
  // const { data: userData } = await supabase.from('user_profiles').select('*').eq('id', session.user.id).single();
  
  return {
    user: session.user,
    // Other dashboard data could be added here
  };
}
