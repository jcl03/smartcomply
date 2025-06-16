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

export async function getAuditById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      audit_data,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        status,
        date_created,
        compliance:compliance_id (
          id,
          name,
          description
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching audit:", error);
    return null;
  }

  return data;
}

export async function getUserAudits(userId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        compliance:compliance_id (
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user audits:", error);
    return [];
  }

  return data;
}

export async function getAllAudits() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        compliance:compliance_id (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching all audits:", error);
    return [];
  }

  return data;
}
