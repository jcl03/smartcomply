import { createClient } from "@/utils/supabase/server";
import { UserProfile } from "@/lib/types";

export async function getUserProfile() {
  const supabase = await createClient();
  
  // First get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }
  
  // Then fetch the profile for this specific user
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('email', user.email)
    .single();
  
  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
  
  return data as UserProfile;
}

export async function getAllUserProfiles() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*');
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }
  
  return data as UserProfile[];
}
