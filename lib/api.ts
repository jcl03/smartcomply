import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

export async function getAllUserProfilesWithRevocationStatus() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('view_user_profiles')
    .select('*');
  
  if (error) {
    console.error("Error fetching user profiles:", error);
    return [];
  }

  // Get revocation status for all users
  try {
    const adminClient = createAdminClient();
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError || !authUsers) {
      console.error("Error fetching auth users:", authError);
      return data.map(profile => ({ ...profile, isRevoked: false }));    }    // Map profiles with revocation status
    const profilesWithRevocationStatus = data.map(profile => {
      const authUser = authUsers.users.find(u => u.email === profile.email);
      let isRevoked = false;
      
      if (authUser) {
        // Check if user access is revoked based on metadata
        isRevoked = authUser.user_metadata?.revoked === true;
      }
      
      return { ...profile, isRevoked };
    });

    return profilesWithRevocationStatus;
  } catch (err) {    console.error("Error checking revocation status:", err);
    return data.map(profile => ({ ...profile, isRevoked: false }));
  }
}
