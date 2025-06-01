"use server";

import { createClient } from "@/utils/supabase/server";
import { encodedRedirect } from "@/utils/utils";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/types";

export async function addComplianceFramework(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const name = formData.get("name") as string;

  if (!name) {
    return { error: "Framework name is required" };
  }

  // Check if framework with same name already exists
  const { data: existingFramework } = await supabase
    .from('compliance')
    .select('id')
    .eq('name', name)
    .single();

  if (existingFramework) {
    return { error: "A framework with this name already exists" };
  }

  const { error } = await supabase
    .from('compliance')
    .insert([{ name, status: 'active' }]);

  if (error) {
    console.error("Error creating compliance framework:", error);
    return { error: "Failed to create compliance framework" };
  }

  return { success: true };
}

export async function addForm(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const complianceId = formData.get("compliance_id") as string;
  const formSchemaStr = formData.get("form_schema") as string;

  if (!complianceId || !formSchemaStr) {
    return { error: "Compliance ID and form schema are required" };
  }

  let formSchema;
  try {
    formSchema = JSON.parse(formSchemaStr);
  } catch (error) {
    return { error: "Invalid JSON format in form schema" };
  }

  const { error } = await supabase
    .from('form')
    .insert([{ 
      compliance_id: parseInt(complianceId),
      form_schema: formSchema 
    }]);

  if (error) {
    console.error("Error creating form:", error);
    return { error: "Failed to create form" };
  }

  return { success: true };
}

export async function updateComplianceFramework(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;

  if (!id || !name) {
    return { error: "ID and name are required" };
  }

  // Check if another framework with same name already exists
  const { data: existingFramework } = await supabase
    .from('compliance')
    .select('id')
    .eq('name', name)
    .neq('id', parseInt(id))
    .single();

  if (existingFramework) {
    return { error: "A framework with this name already exists" };
  }

  const { error } = await supabase
    .from('compliance')
    .update({ name })
    .eq('id', parseInt(id));

  if (error) {
    console.error("Error updating compliance framework:", error);
    return { error: "Failed to update compliance framework" };
  }

  return { success: true };
}

export async function deleteComplianceFramework(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from('compliance')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting compliance framework:", error);
    return { error: "Failed to delete compliance framework" };
  }

  return { success: true };
}

export async function updateForm(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const formId = formData.get("form_id") as string;
  const formSchemaStr = formData.get("form_schema") as string;

  if (!formId || !formSchemaStr) {
    return { error: "Form ID and form schema are required" };
  }

  let formSchema;
  try {
    formSchema = JSON.parse(formSchemaStr);
  } catch (error) {
    return { error: "Invalid JSON format in form schema" };
  }

  const { error } = await supabase
    .from('form')
    .update({ form_schema: formSchema })
    .eq('id', parseInt(formId));

  if (error) {
    console.error("Error updating form:", error);
    return { error: "Failed to update form" };
  }

  return { success: true };
}

export async function archiveComplianceFramework(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from('compliance')
    .update({ status: 'archive' })
    .eq('id', id);

  if (error) {
    console.error("Error archiving compliance framework:", error);
    return { error: "Failed to archive compliance framework" };
  }

  return { success: true };
}

export async function reactivateComplianceFramework(id: number): Promise<ActionResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Unauthorized" };
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  if (!profile || profile.role !== 'admin') {
    return { error: "Insufficient permissions" };
  }

  const { error } = await supabase
    .from('compliance')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) {
    console.error("Error reactivating compliance framework:", error);
    return { error: "Failed to reactivate compliance framework" };
  }

  return { success: true };
}
