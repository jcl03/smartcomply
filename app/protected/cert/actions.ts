"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export interface ActionResult {
  success?: boolean;
  error?: string;
}

export async function deleteCertificate(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user has manager or admin role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }

  try {
    // Get certificate info before deleting to clean up file
    const { data: cert } = await supabase
      .from('cert')
      .select('link, folder')
      .eq('id', id)
      .single();

    if (cert?.link) {
      try {
        const linkData = typeof cert.link === 'string' ? JSON.parse(cert.link) : cert.link;
        const filePath = linkData.url ? 
          linkData.url.split('/').slice(-2).join('/') : // Extract folder/filename from URL
          null;
        
        if (filePath) {
          // Delete file from storage
          await supabase.storage
            .from('cert')
            .remove([filePath]);
        }
      } catch (fileError) {
        console.error("Error deleting file from storage:", fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete certificate record
    const { error } = await supabase
      .from('cert')
      .delete()
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/protected/cert');
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting certificate:", error);
    return { error: "Failed to delete certificate" };
  }
}

export async function updateCertificate(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user has manager or admin role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }
  try {
    const id = formData.get("id") as string;
    const folder = formData.get("folder") as string;
    const expiration = formData.get("expiration") as string;
    const audit_id = formData.get("audit_id") as string;
    const checklist_responses_id = formData.get("checklist_responses_id") as string;

    if (!id || !folder) {
      return { error: "Certificate ID and folder are required" };
    }

    const updateData: any = {
      folder: folder.trim(),
      expiration: expiration || null,
      audit_id: audit_id ? parseInt(audit_id) : null,
      checklist_responses_id: checklist_responses_id ? parseInt(checklist_responses_id) : null,
    };

    const { error } = await supabase
      .from('cert')
      .update(updateData)
      .eq('id', parseInt(id));

    if (error) throw error;

    revalidatePath('/protected/cert');
    revalidatePath(`/protected/cert/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error updating certificate:", error);
    return { error: "Failed to update certificate" };
  }
}

export async function getCertificateStats() {
  const supabase = await createClient();
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Unauthorized" };
    }

    // Get all certificates
    const { data: certificates, error } = await supabase
      .from('cert')
      .select('id, expiration, created_at');

    if (error) throw error;

    const total = certificates?.length || 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const expiringSoon = certificates?.filter(cert => {
      if (!cert.expiration) return false;
      const expirationDate = new Date(cert.expiration);
      return expirationDate >= now && expirationDate <= thirtyDaysFromNow;
    }).length || 0;

    const expired = certificates?.filter(cert => {
      if (!cert.expiration) return false;
      const expirationDate = new Date(cert.expiration);
      return expirationDate < now;
    }).length || 0;

    return {
      success: true,
      stats: {
        total,
        expiring_soon: expiringSoon,
        expired,
        valid: total - expiringSoon - expired
      }
    };
  } catch (error: any) {
    console.error("Error getting certificate stats:", error);
    return { error: "Failed to get certificate statistics" };
  }
}

export async function archiveCertificate(id: number): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }
  // Check if user has manager or admin role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }
  const { error } = await supabase
    .from('cert')
    .update({ status: 'archive' })
    .eq('id', id);
  if (error) {
    console.error("Error archiving certificate:", error);
    return { error: "Failed to archive certificate" };
  }
  return { success: true };
}

export async function reactivateCertificate(id: number): Promise<ActionResult> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }
  // Check if user has manager or admin role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return { error: "Insufficient permissions" };
  }
  const { error } = await supabase
    .from('cert')
    .update({ status: 'active' })
    .eq('id', id);
  if (error) {
    console.error("Error reactivating certificate:", error);
    return { error: "Failed to reactivate certificate" };
  }
  return { success: true };
}
