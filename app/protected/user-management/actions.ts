"use server";

import { createClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/utils/supabase/admin";
import { refreshUserSession } from "@/lib/session-utils";

// Force recompilation - fixed clean metadata approach

export async function updateUserRole(formData: FormData) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const userId = formData.get("userId") as string;
  const newRole = formData.get("role") as string;
  
  if (!userId || !newRole) {
    return { error: "User ID and role are required" };
  }
  
  const supabase = await createClient();
  
  // Get current user to check if they're trying to change their own role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unable to verify current user" };
  }
    // Get current user's profile to compare IDs
  const { data: currentUserProfile, error: profileError } = await supabase
    .from('view_user_profiles')
    .select('id')
    .eq('email', user.email)    .single();
    
  if (profileError || !currentUserProfile) {
    console.error("Error getting current user profile:", profileError);
    return { error: "Unable to verify current user" };
  }
    // Prevent admins from changing their own role (ensure string comparison)
  if (String(currentUserProfile.id) === String(userId)) {
    return { error: "You cannot change your own role" };
  }
  
  // Update the user's role in the profiles table
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);
  
  if (error) {
    console.error("Error updating user role:", error);
    return { error: "Failed to update user role" };
  }
  
  // Revalidate the user management page
  revalidatePath("/protected/user-management");
  
  return { success: true };
}

export async function inviteUser(formData: FormData) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;
    if (!email || !role) {
    return { error: "Email and role are required" };
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
    if (inviteData?.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          user_id: inviteData.user.id, 
          role,
          full_name: '',
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