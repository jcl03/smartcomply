import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import EditChecklistComponent from "./EditChecklistComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function EditChecklistPage({ 
  params 
}: { 
  params: Promise<{ id: string; formId: string }> 
}) {
  const supabase = await createClient();
  const { id, formId } = await params;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
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
  }  // Fetch the checklist (only if active)
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', formId)
    .eq('compliance_id', id)
    .eq('status', 'active')
    .single();
  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-center gap-4">
            <Link 
              href={`/protected/compliance/${id}/checklists`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Checklists
            </Link>
            <div className="bg-sky-100 p-3 rounded-full">
              <CheckSquare className="h-6 w-6 text-sky-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sky-900">Edit Checklist</h1>
              <p className="text-sky-600">#{checklist.id} • {framework.name}</p>
            </div>
          </div>
        </div>
        
        {/* Edit Form Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Edit Compliance Checklist</CardTitle>
            </div>
          </CardHeader>
          <EditChecklistComponent checklist={checklist} complianceId={id} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
