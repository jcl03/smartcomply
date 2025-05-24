"use server";

import { createClient } from "@/utils/supabase/server";
import { isUserAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

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
