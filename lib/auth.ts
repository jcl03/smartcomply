import { createClient } from "@/utils/supabase/server";

export async function isUserAdmin() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }
  
  // Check if user is admin
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not admin or error occurs, return false
  if (error || !profile || profile.role !== 'admin') {
    return false;
  }
  
  return true;
}
