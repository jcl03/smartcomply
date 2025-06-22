"use server";

import { updateUserRole } from "../../actions";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { isUserAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function handleUpdateRole(formData: FormData) {
  const result = await updateUserRole(formData);
  return result;
}

export async function updateUserTenant(formData: FormData) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return { error: "Unauthorized: Admin access required" };
  }
  
  const userId = formData.get("userId") as string;
  const tenant_id = formData.get("tenant_id") as string;
  
  if (!userId) {
    return { error: "User ID is required" };
  }

  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  // Get current user to check if they're trying to change their own tenant
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
  
  // Prevent admins from changing their own tenant if they're admin
  if (String(currentUserProfile.id) === String(userId)) {
    return { error: "You cannot change your own tenant assignment" };
  }  try {
    console.log("updateUserTenant called with userId:", userId, "tenant_id:", tenant_id);
    
    // First get the user_id from the view_user_profiles table
    const { data: targetUser, error: targetUserError } = await supabase
      .from('view_user_profiles')
      .select('user_id, email')
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
    
    // Try update with regular client first
    const { error: regularError, data: regularData, count: regularCount } = await supabase
      .from('profiles')
      .update({ 
        tenant_id: tenant_id ? parseInt(tenant_id) : null 
      })
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
        .update({ 
          tenant_id: tenant_id ? parseInt(tenant_id) : null 
        })
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
      console.error("Error updating user tenant:", finalError);
      return { error: `Failed to update user tenant: ${finalError.message}` };
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
      console.log(`Successfully updated tenant for user ${targetUser.user_id} (${targetUser.email}) to tenant_id: ${tenant_id}`);
    
    // Revalidate the relevant pages and cache
    revalidatePath("/protected/user-management", "page");
    revalidatePath(`/protected/user-management/${userId}/edit`, "page");
    revalidatePath("/protected/user-management", "layout");
    
    return { success: true };
  } catch (err) {
    console.error("Unexpected error updating user tenant:", err);
    return { error: "An unexpected error occurred" };
  }
}
