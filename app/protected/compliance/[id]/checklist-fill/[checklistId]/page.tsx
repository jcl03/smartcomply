import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { ChecklistFillForm } from "@/components/checklist/checklist-fill-form";
// We'll copy the client component code directly here instead of importing
// since Next.js has issues with importing from dynamic route folders

// Server component wrapper that checks auth and provides the checklist data
export default async function FillChecklistPage({ 
  params 
}: { 
  params: Promise<{ id: string; checklistId: string }> 
}) {
  const supabase = await createClient();  const { id: complianceId, checklistId } = await params;
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }
    // Fetch the checklist schema to verify it exists
  const { data: checklist, error } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .single();
    
  if (error || !checklist) {
    console.error("Error fetching checklist:", error);
    return redirect(`/protected/compliance/${complianceId}/checklists`);
  }

  // Fetch the compliance record to get framework info
  const { data: compliance, error: complianceError } = await supabase
    .from('compliance')
    .select('*, framework(*)')
    .eq('id', complianceId)
    .single();

  if (complianceError || !compliance) {
    console.error("Error fetching compliance:", complianceError);
    return redirect(`/protected/compliance`);
  }

  // Fetch user profile
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !userProfile) {
    console.error("Error fetching user profile:", profileError);
    return redirect(`/protected/profile`);
  }
  
  // Render the client component
  return <ChecklistFillForm 
    complianceId={complianceId} 
    checklistId={checklistId} 
    checklist={checklist}
    framework={compliance.framework}
    userProfile={userProfile}
  />;
}
