"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile({ fullName }: { fullName: string }) {
  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return { error: "Authentication required" };
    }    console.log("Updating profile for user:", user.id, "with name:", fullName);

    // Update the profile in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return { error: `Database error: ${updateError.message}` };
    }

    // Revalidate the profile page
    revalidatePath("/protected/profile");
    
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error updating profile:", error);
    return { error: `Unexpected error: ${error.message || JSON.stringify(error)}` };
  }
}

export async function updatePassword({ newPassword }: { newPassword: string }) {
  const supabase = await createClient();

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { error: "Authentication required" };
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
      return { error: updateError.message || "Failed to update password" };
    }

    // Revalidate the profile page
    revalidatePath("/protected/profile");
    
    return { success: true };
  } catch (error: any) {
    console.error("Unexpected error updating password:", error);
    return { error: "An unexpected error occurred" };
  }
}
