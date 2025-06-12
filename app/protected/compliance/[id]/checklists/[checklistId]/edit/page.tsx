import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import EditChecklistForm from "./edit-checklist-form";

export default async function EditChecklistPage({ params }: { params: Promise<{ id: string; checklistId: string }> }) {
  const supabase = await createClient();
  const { id, checklistId } = await params;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not admin, redirect to protected page
  if (!profile || profile.role !== 'admin') {
    return redirect("/protected");
  }

  // Fetch compliance framework
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }

  // Fetch the specific checklist
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', id)
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }

  return <EditChecklistForm 
    complianceId={id} 
    checklistId={checklistId}
    frameworkName={framework.name} 
    initialChecklist={checklist.checklist_schema}
  />;
}
