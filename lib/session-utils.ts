import { createClient } from "@/utils/supabase/server";

/**
 * Force refresh the current user session to ensure latest metadata is loaded
 * This is useful after user metadata changes (like revocation/restoration)
 */
export async function refreshUserSession() {
  const supabase = await createClient();
  
  try {
    // Force refresh the session to get latest user metadata
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("Error refreshing session:", error);
      return { error };
    }
    
    return { data };
  } catch (err) {
    console.error("Unexpected error refreshing session:", err);
    return { error: "Failed to refresh session" };
  }
}

/**
 * Check if the current user's access is revoked
 */
export async function checkUserRevocationStatus() {
  const supabase = await createClient();
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return { isRevoked: false, error };
    }
    
    // Check revocation status from user metadata
    const isRevoked = user.user_metadata?.revoked === true;
    
    return { isRevoked, user, error: null };
  } catch (err) {
    console.error("Error checking revocation status:", err);
    return { isRevoked: false, error: "Failed to check status" };
  }
}
