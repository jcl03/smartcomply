import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
// We'll copy the client component code directly here instead of importing
// since Next.js has issues with importing from dynamic route folders

// Server component wrapper that checks auth and provides the checklist data
export default async function FillChecklistPage({ 
  params 
}: { 
  params: { id: string; checklistId: string } 
}) {
  const supabase = await createClient();
  const complianceId = params.id;
  const checklistId = params.checklistId;
  
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
  
  // Render the client component
  return <ChecklistFillForm complianceId={complianceId} checklistId={checklistId} />;
}
