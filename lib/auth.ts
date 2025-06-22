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

export async function isUserManagerOrAdmin() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return false;
  }
  
  // Check if user is manager or admin
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not manager/admin or error occurs, return false
  if (error || !profile || !['admin', 'manager'].includes(profile.role)) {
    return false;
  }
  
  return true;
}

export async function getCurrentUserProfile() {
  const supabase = await createClient();
  const { createAdminClient } = await import('@/utils/supabase/admin');
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Get user profile with tenant info
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('email', user.email)
    .single();
    
  if (error || !profile) {
    return null;
  }
  
  // Get fresh tenant_id data directly from profiles table using admin client
  const adminClient = createAdminClient();
  const { data: freshProfile, error: freshError } = await adminClient
    .from('profiles')
    .select('tenant_id')
    .eq('user_id', profile.user_id)
    .single();
  
  if (!freshError && freshProfile && freshProfile.tenant_id) {
    // Use fresh tenant_id if available
    return { ...profile, tenant_id: freshProfile.tenant_id };
  }
  
  return profile;
}
