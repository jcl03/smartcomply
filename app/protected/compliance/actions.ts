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
      form_schema: formSchema,
      status: 'active'
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

// Compliance framework status management actions
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

// Form status management actions
export async function archiveForm(formId: number): Promise<ActionResult> {
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
    .from('form')
    .update({ status: 'archive' })
    .eq('id', formId);

  if (error) {
    console.error("Error archiving form:", error);
    return { error: "Failed to archive form" };
  }

  return { success: true };
}

export async function activateForm(formId: number): Promise<ActionResult> {
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
    .from('form')
    .update({ status: 'active' })
    .eq('id', formId);

  if (error) {
    console.error("Error activating form:", error);
    return { error: "Failed to activate form" };
  }

  return { success: true };
}

// Checklist management actions
export async function addChecklist(formData: FormData): Promise<ActionResult> {
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
  const checklistSchemaStr = formData.get("checklist_schema") as string;

  if (!complianceId || !checklistSchemaStr) {
    return { error: "Compliance ID and checklist schema are required" };
  }

  let checklistSchema;
  try {
    checklistSchema = JSON.parse(checklistSchemaStr);
  } catch (error) {
    return { error: "Invalid JSON format in checklist schema" };
  }

  const { error } = await supabase
    .from('checklist')
    .insert([{ 
      compliance_id: parseInt(complianceId),
      checklist_schema: checklistSchema,
      status: 'active'
    }]);

  if (error) {
    console.error("Error creating checklist:", error);
    return { error: "Failed to create checklist" };
  }

  return { success: true };
}

export async function updateChecklist(formData: FormData): Promise<ActionResult> {
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

  const checklistId = formData.get("checklist_id") as string;
  const checklistSchemaStr = formData.get("checklist_schema") as string;

  if (!checklistId || !checklistSchemaStr) {
    return { error: "Checklist ID and checklist schema are required" };
  }

  let checklistSchema;
  try {
    checklistSchema = JSON.parse(checklistSchemaStr);
  } catch (error) {
    return { error: "Invalid JSON format in checklist schema" };
  }

  const { error } = await supabase
    .from('checklist')
    .update({ checklist_schema: checklistSchema })
    .eq('id', parseInt(checklistId));

  if (error) {
    console.error("Error updating checklist:", error);
    return { error: "Failed to update checklist" };
  }

  return { success: true };
}

export async function deleteChecklist(id: number): Promise<ActionResult> {
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
    .from('checklist')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting checklist:", error);
    return { error: "Failed to delete checklist" };
  }

  return { success: true };
}

// Checklist status management actions
export async function archiveChecklist(checklistId: number): Promise<ActionResult> {
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
    .from('checklist')
    .update({ status: 'archive' })
    .eq('id', checklistId);

  if (error) {
    console.error("Error archiving checklist:", error);
    return { error: "Failed to archive checklist" };
  }

  return { success: true };
}

export async function activateChecklist(checklistId: number): Promise<ActionResult> {
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
    .from('checklist')
    .update({ status: 'active' })
    .eq('id', checklistId);

  if (error) {
    console.error("Error activating checklist:", error);
    return { error: "Failed to activate checklist" };
  }

  return { success: true };
}


export async function addFormDraft(formData: FormData): Promise<ActionResult> {
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
      form_schema: formSchema,
      status: 'draft'  // Set status as draft
    }]);

  if (error) {
    console.error("Error creating draft form:", error);
    return { error: "Failed to create draft form" };
  }

  return { success: true };
}