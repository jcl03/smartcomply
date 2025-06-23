"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

export async function approveAudit(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role, tenant_id')
    .eq('email', user.email)
    .single();
    
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return { error: "Insufficient permissions" };
  }

  const auditId = formData.get("audit_id") as string;

  if (!auditId) {
    return { error: "Audit ID is required" };
  }

  // Build query for audit verification
  const auditQueryBuilder = supabase
    .from('audit')
    .select('id, user_id, tenant_id, verification_status')
    .eq('id', parseInt(auditId));

  // If manager, only allow verifying audits from their tenant
  if (profile.role === 'manager' && profile.tenant_id) {
    auditQueryBuilder.eq('tenant_id', profile.tenant_id);
  }

  const { data: audit, error: auditError } = await auditQueryBuilder.single();

  if (auditError || !audit) {
    return { error: "Audit not found or insufficient permissions" };
  }

  // Check if audit is already verified
  if (audit.verification_status === 'accepted') {
    return { error: "Audit is already approved" };
  }

  // Update audit verification status
  const { error } = await supabase
    .from('audit')
    .update({
      verification_status: 'accepted',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      corrective_action: null // Clear any previous corrective action
    })
    .eq('id', parseInt(auditId));

  if (error) {
    console.error("Error approving audit:", error);
    return { error: "Failed to approve audit" };
  }

  return { success: true };
}

export async function rejectAudit(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role, tenant_id')
    .eq('email', user.email)
    .single();
    
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return { error: "Insufficient permissions" };
  }

  const auditId = formData.get("audit_id") as string;
  const correctiveAction = formData.get("corrective_action") as string;

  if (!auditId) {
    return { error: "Audit ID is required" };
  }

  if (!correctiveAction || correctiveAction.trim().length === 0) {
    return { error: "Corrective action is required when rejecting an audit" };
  }

  // Build query for audit verification
  const auditQueryBuilder = supabase
    .from('audit')
    .select('id, user_id, tenant_id, verification_status')
    .eq('id', parseInt(auditId));

  // If manager, only allow verifying audits from their tenant
  if (profile.role === 'manager' && profile.tenant_id) {
    auditQueryBuilder.eq('tenant_id', profile.tenant_id);
  }

  const { data: audit, error: auditError } = await auditQueryBuilder.single();

  if (auditError || !audit) {
    return { error: "Audit not found or insufficient permissions" };
  }

  // Check if audit is already verified
  if (audit.verification_status === 'accepted') {
    return { error: "Cannot reject an already approved audit" };
  }

  // Update audit verification status
  const { error } = await supabase
    .from('audit')
    .update({
      verification_status: 'rejected',
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      corrective_action: correctiveAction.trim()
    })
    .eq('id', parseInt(auditId));

  if (error) {
    console.error("Error rejecting audit:", error);
    return { error: "Failed to reject audit" };
  }

  return { success: true };
}

export async function resetAuditVerification(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role, tenant_id')
    .eq('email', user.email)
    .single();
    
  if (!profile || (profile.role !== 'admin' && profile.role !== 'manager')) {
    return { error: "Insufficient permissions" };
  }

  const auditId = formData.get("audit_id") as string;

  if (!auditId) {
    return { error: "Audit ID is required" };
  }
  
  // Build query for audit verification
  const auditQueryBuilder = supabase
    .from('audit')
    .select('id, user_id, tenant_id, verification_status')
    .eq('id', parseInt(auditId));

  // If manager, only allow resetting audits from their tenant
  if (profile.role === 'manager' && profile.tenant_id) {
    auditQueryBuilder.eq('tenant_id', profile.tenant_id);
  }

  const { data: audit, error: auditError } = await auditQueryBuilder.single();

  if (auditError || !audit) {
    return { error: "Audit not found or insufficient permissions" };
  }

  // Update audit verification status
  const { error } = await supabase
    .from('audit')
    .update({
      verification_status: 'pending',
      verified_by: null,
      verified_at: null,
      corrective_action: null
    })
    .eq('id', parseInt(auditId));

  if (error) {
    console.error("Error resetting audit verification:", error);
    return { error: "Failed to reset audit verification" };
  }

  return { success: true };
}
