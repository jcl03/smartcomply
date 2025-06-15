import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { ChecklistFillForm } from "@/components/checklist/checklist-form";

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

  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('status', 'active')
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${complianceId}/checklists`);
  }

  return <ChecklistFillForm complianceId={complianceId} checklistId={checklistId} />;
}
