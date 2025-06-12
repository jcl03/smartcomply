import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditChecklistComponent from "./EditChecklistComponent";

export default async function EditChecklistPage({ 
  params 
}: { 
  params: Promise<{ id: string; checklistId: string }> 
}) {
  const supabase = await createClient();  const { id, checklistId } = await params;
  
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
  // Fetch compliance framework (only active ones)
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }
  // Fetch the checklist (only if active)
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', id)
    .eq('status', 'active')
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/protected/compliance/${id}/checklists`}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Checklists
          </Link>
          <CheckSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Edit Checklist #{checklist.id}</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit Compliance Checklist</CardTitle>
        </CardHeader>
        <EditChecklistComponent checklist={checklist} complianceId={id} />
      </Card>
    </div>
  );
}
