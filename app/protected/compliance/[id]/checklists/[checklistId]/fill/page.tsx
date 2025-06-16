import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { ChecklistFillForm } from "@/components/checklist/checklist-fill-form";

export default async function FillChecklistPage({ params }: { params: Promise<{ id: string; checklistId: string }> }) {
  const supabase = await createClient();
  const { id: complianceId, checklistId } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  // Get user profile with role information
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // Allow admin, manager, and user roles to access
  if (!profile || !['admin', 'manager', 'user'].includes(profile.role)) {
    return redirect("/protected");
  }

  // Fetch compliance framework
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', complianceId)
    .eq('status', 'active')
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }

  // Fetch the checklist
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', complianceId)
    .eq('status', 'active')
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${complianceId}/checklists`);
  }

  return (
    <ChecklistFillForm 
      complianceId={complianceId} 
      checklistId={checklistId}
      checklist={checklist}
      framework={framework}
      userProfile={currentUserProfile}
    />
  );
}
