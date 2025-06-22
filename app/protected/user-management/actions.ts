"use server";

import { createClient } from "@/utils/supabase/server";
import { isUserAdmin, isUserManagerOrAdmin, getCurrentUserProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { refreshUserSession } from "@/lib/session-utils";

// Force recompilation - fixed clean metadata approach

export async function updateUserRole(formData: FormData) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized: Admin access required" };
  }
    const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as string;
  const tenantId = formData.get("tenant_id") as string; // Optional tenant assignment
  
  if (!userId || !newRole) {
    return { error: "User ID and role are required" };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // Get current user to check if they're trying to change their own role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unable to verify current user" };
  }
  
  // Get current user's profile to compare IDs
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('view_user_profiles')
    .select('id')
    .eq('email', user.email)
    .single();
    
  if (profileError || !currentUserProfile) {
    console.error("Error getting current user profile:", profileError);
    return { error: "Unable to verify current user" };
  }
  
  // Prevent admins from changing their own role (ensure string comparison)
  if (String(currentUserProfile.id) === String(userId)) {
    return { error: "You cannot change your own role" };
  }

  try {
    console.log("updateUserRole called with userId:", userId, "newRole:", newRole);
    
    // First get the user_id from the view_user_profiles table
    const { data: targetUser, error: targetUserError } = await supabase
      .from('view_user_profiles')
      .select('user_id, email, role')
      .eq('id', userId)
      .single();
    
    if (targetUserError || !targetUser) {
      console.error("Error getting target user:", targetUserError);
      return { error: "User not found" };
    }
    
    console.log("Target user found:", targetUser);
    
    // Check current profile data before update (using admin client to bypass RLS)
    const { data: beforeUpdate, error: beforeError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', targetUser.user_id);
      console.log("Profile before update (admin client):", beforeUpdate, "Error:", beforeError);
      // Validation: Non-admin users must have a tenant assignment
    if (newRole !== 'admin') {
      const currentProfile = beforeUpdate?.[0];
      // Check if user currently has tenant OR if tenant is being provided in the update
      if (!currentProfile?.tenant_id && !tenantId) {
        console.error("Validation failed: Non-admin user requires tenant assignment");
        return { 
          error: `Cannot assign role "${newRole}" to a user without a tenant. Please assign a tenant first, or choose the admin role for system-wide access.` 
        };
      }
      console.log("Validation passed: Non-admin user has tenant assignment:", currentProfile?.tenant_id || tenantId);
    }
    
    // Prepare update data: handle both role and tenant changes
    const updateData: { role: string; tenant_id?: number | null } = { role: newRole };
    
    if (newRole === 'admin') {
      // Admin role: clear tenant assignment
      updateData.tenant_id = null;
      console.log("Admin role selected - will clear tenant assignment");
    } else if (tenantId) {
      // Non-admin role with tenant provided: set tenant
      updateData.tenant_id = parseInt(tenantId);
      console.log("Non-admin role selected - will set tenant to:", tenantId);
    }
    // If non-admin role and no tenant provided, leave existing tenant unchanged
    
    // Try update with regular client first
    const { error: regularError, data: regularData, count: regularCount } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', targetUser.user_id)
      .select();
    
    console.log("Regular client update result:", {
      error: regularError,
      data: regularData,
      count: regularCount,
      rowsAffected: regularData?.length || 0
    });
    
    // If regular client fails or updates 0 rows, try with admin client
    let finalError = regularError;
    let finalData = regularData;
    
    if (regularError || !regularData || regularData.length === 0) {
      console.log("Regular client failed, trying admin client...");
        const { error: adminError, data: adminData, count: adminCount } = await adminClient
        .from('profiles')
        .update(updateData)
        .eq('user_id', targetUser.user_id)
        .select();
      
      console.log("Admin client update result:", {
        error: adminError,
        data: adminData,
        count: adminCount,
        rowsAffected: adminData?.length || 0
      });
      
      finalError = adminError;
      finalData = adminData;
    }
    
    if (finalError) {
      console.error("Error updating user role:", finalError);
      return { error: `Failed to update user role: ${finalError.message}` };
    }
    
    // Check if any rows were actually updated
    if (!finalData || finalData.length === 0) {
      console.error("No rows were updated even with admin client - possible data issue");
      
      // Try to get more info about the profile using admin client
      const { data: profileCheck, error: profileCheckError } = await adminClient
        .from('profiles')
        .select('*')
        .eq('user_id', targetUser.user_id);
      
      console.log("Profile check after failed update (admin):", profileCheck, "Error:", profileCheckError);
      
      return { error: "No rows were updated. The profile may not exist in the profiles table." };
    }
    
    // Verify the update actually happened using admin client
    const { data: afterUpdate, error: afterError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('user_id', targetUser.user_id);
    
    console.log("Profile after update (admin client):", afterUpdate, "Error:", afterError);
    
    console.log(`Successfully updated role for user ${targetUser.user_id} (${targetUser.email}) from ${targetUser.role} to ${newRole}`);
    if (newRole === 'admin') {
      console.log("Tenant assignment cleared for admin user");
    }
    
    // Revalidate the relevant pages and cache
    revalidatePath("/protected/user-management", "page");
    revalidatePath(`/protected/user-management/${userId}/edit`, "page");
    revalidatePath("/protected/user-management", "layout");
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating user role:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function inviteUser(formData: FormData) {
  // Check if the current user is a manager or admin
  const isManagerOrAdmin = await isUserManagerOrAdmin();
  if (!isManagerOrAdmin) {
    redirect("/protected");
  }
  
  // Get current user profile to check role and tenant
  const currentUserProfile = await getCurrentUserProfile();
  if (!currentUserProfile) {
    return { error: "Unable to verify current user profile" };
  }
  
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
  const tenant_id = formData.get("tenant_id") as string;
  
  if (!email || !role) {
    return { error: "Email and role are required" };
  }
  
  // Additional validation for managers
  if (currentUserProfile.role === 'manager') {
    // Managers cannot create admin users
    if (role === 'admin') {
      return { error: "Managers cannot create admin users" };
    }
    
    // Managers can only assign users to their own tenant
    if (role !== 'admin' && (!tenant_id || parseInt(tenant_id) !== currentUserProfile.tenant_id)) {
      return { error: "Managers can only invite users to their own tenant" };
    }
  }
  
  // Tenant is only required for non-admin users
  if (role !== 'admin' && !tenant_id) {
    return { error: "Tenant is required for non-admin users" };
  }
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // 1. Send invitation email (this creates the user and sends invitation in one step)
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: { role }
    });
    
    if (inviteError) {
      console.error("Error sending invite:", inviteError);
      // Provide more specific error messages
      if (inviteError.message?.includes('Database error')) {
        return { error: "Database error: Unable to send invitation. Please check your Supabase configuration." };
      } else if (inviteError.message?.includes('Invalid token')) {
        return { error: "Authentication error: Invalid service role key." };
      } else if (inviteError.status === 422 && inviteError.code === 'email_exists') {
        return { error: "A user with this email address has already been registered. Please use a different email or ask the user to reset their password." };
      } else {
        return { error: `Failed to send invitation: ${inviteError.message || 'Unknown error'}` };
      }
    }
    
    // 2. Create profile in profiles table using the invited user's ID
    if (inviteData?.user?.id) {      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          user_id: inviteData.user.id, 
          role,
          full_name: '',
          tenant_id: tenant_id ? parseInt(tenant_id) : null
        });
        
      if (profileError) {
        console.error("Error creating profile:", profileError);
        return { error: "Invitation sent but failed to create user profile" };
      }
    }
    
    // Revalidate the user management page
    revalidatePath("/protected/user-management");
    
    return { success: true };  } catch (err) {
    console.error("Unexpected error inviting user:", err);
    
    // Check if it's an admin client configuration error
    if (err instanceof Error && err.message.includes('Missing environment variables')) {
      return { error: "Server configuration error: Missing Supabase service role key" };
    }
    
    return { error: "An unexpected error occurred" };
  }
}

export async function resendActivation(formData: FormData | { email: string }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  // Handle both FormData and direct object format
  let email: string;
  if (formData instanceof FormData) {
    email = formData.get("email") as string;
  } else {
    email = formData.email;
  }
    if (!email) {
    return { error: "Email is required" };
  }
  const supabase = await createClient();
  
  try {
    // First get the user ID for this email
    const { data: userData, error: userError } = await supabase
      .from('view_user_profiles')
      .select('id')
      .eq('email', email)
      .single();
      
    if (userError || !userData) {
      console.error("Error finding user:", userError);
      return { error: "Could not find user with this email" };
    }

    // Use signInWithOtp to send magic link to existing users
    const { error: magicLinkError } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: false, // Don't create new user since they already exist
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/invite/${userData.id}`,
      }
    });
    
    if (magicLinkError) {
      console.error("Error sending magic link:", magicLinkError);
      return { error: magicLinkError?.message || "Failed to send activation email" };
    }
    
    // Revalidate the user management page
    revalidatePath("/protected/user-management");
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error resending activation:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function updateUserEmail(formData: FormData) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const userId = formData.get("userId") as string;
  const newEmail = formData.get("newEmail") as string;
  
  if (!userId || !newEmail) {
    return { error: "User ID and new email are required" };
  }
  
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  try {
    // Get the user's current email from the profile view
    const { data: profileData, error: profileError } = await supabase
      .from('view_user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (profileError || !profileData) {
      console.error("Error finding user:", profileError);
      return { error: "Could not find user with this ID" };
    }
    
    // Find the user by email to get their auth ID
    const { data, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return { error: "Failed to find user auth record" };
    }
    
    // Find the user with the matching email
    const user = data.users.find(u => u.email === profileData.email);
    
    if (!user) {
      console.error("User not found in auth records");
      return { error: "User not found in auth records" };
    }
    
    // Update the user's email
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { email: newEmail }
    );
    
    if (updateError) {
      console.error("Error updating user email:", updateError);
      return { error: updateError?.message || "Failed to update user email" };
    }
    
    // Revalidate the user management page
    revalidatePath("/protected/user-management");
    revalidatePath(`/protected/user-management/${userId}/edit`);
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating user email:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function revokeUserAccess(formData: FormData | { userId: string }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  // Handle both FormData and direct object format
  let userId: string;
  if (formData instanceof FormData) {
    userId = formData.get("userId") as string;
  } else {
    userId = formData.userId;
  }
  
  if (!userId) {
    return { error: "User ID is required" };
  }
  
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  try {
    // Get current user to check if they're trying to revoke their own access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unable to verify current user" };
    }
    
    // Get current user's profile to compare IDs
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('view_user_profiles')
      .select('id')
      .eq('email', user.email)
      .single();
      
    if (profileError || !currentUserProfile) {
      console.error("Error getting current user profile:", profileError);
      return { error: "Unable to verify current user" };
    }
    
    // Prevent admins from revoking their own access
    if (String(currentUserProfile.id) === String(userId)) {
      return { error: "You cannot revoke your own account access" };
    }
    
    // Get the user's email from the profile
    const { data: profileData, error: profileError2 } = await supabase
      .from('view_user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (profileError2 || !profileData) {
      console.error("Error finding user:", profileError2);
      return { error: "Could not find user with this ID" };
    }
    
    // Find the user by email to get their auth ID
    const { data, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return { error: "Failed to find user auth record" };
    }
    
    // Find the user with the matching email
    const authUser = data.users.find(u => u.email === profileData.email);
    
    if (!authUser) {
      console.error("User not found in auth records");
      return { error: "User not found in auth records" };
    }      // Revoke user access by setting access metadata
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      { 
        user_metadata: {
          ...authUser.user_metadata,          revoked: true,
          revoked_at: new Date().toISOString(),
          revoked_by: user.email
        }
      }
    );
    
    if (updateError) {      console.error("Error revoking user access:", updateError);
      return { error: updateError?.message || "Failed to revoke user access" };
    }
    
    // Revalidate the user management page
    revalidatePath("/protected/user-management");
    revalidatePath(`/protected/user-management/${userId}/edit`);
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error revoking user access:", err);
    return { error: "An unexpected error occurred" };
  }
}

export async function restoreUserAccess(formData: FormData | { userId: string }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  // Handle both FormData and direct object format
  let userId: string;
  if (formData instanceof FormData) {
    userId = formData.get("userId") as string;
  } else {
    userId = formData.userId;
  }
  
  if (!userId) {
    return { error: "User ID is required" };
  }
  
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Unable to verify current user" };
    }
    
    // Get the user's email from the profile
    const { data: profileData, error: profileError } = await supabase
      .from('view_user_profiles')
      .select('email')
      .eq('id', userId)
      .single();
      
    if (profileError || !profileData) {
      console.error("Error finding user:", profileError);
      return { error: "Could not find user with this ID" };
    }
    
    // Find the user by email to get their auth ID
    const { data, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return { error: "Failed to find user auth record" };
    }
    
    // Find the user with the matching email
    const authUser = data.users.find(u => u.email === profileData.email);
    
    if (!authUser) {
      console.error("User not found in auth records");
      return { error: "User not found in auth records" };
    }    // Restore user access by clearing revocation metadata
    // Instead of trying to delete fields, create a clean metadata object
    const cleanMetadata = {
      email_verified: authUser.user_metadata?.email_verified || true,
      role: authUser.user_metadata?.role || 'user',
      revoked: false,
      restored_at: new Date().toISOString(),
      restored_by: user.email
    };
    
    console.log("Restoring access for user:", profileData.email);
    console.log("Current metadata:", authUser.user_metadata);
    console.log("Clean metadata:", cleanMetadata);
    
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      authUser.id,
      { 
        user_metadata: cleanMetadata
      }
    );
    
    if (updateError) {
      console.error("Error restoring user access:", updateError);
      return { error: updateError?.message || "Failed to restore user access" };
    }
    
    console.log("Successfully updated user metadata with clean data");
    
    // Revalidate the user management page
    revalidatePath("/protected/user-management");
    revalidatePath(`/protected/user-management/${userId}/edit`);
    // Also revalidate the main protected page to refresh user data
    revalidatePath("/protected");
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error restoring user access:", err);
    return { error: "An unexpected error occurred" };
  }
}