import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import EditChecklistComponent from "./EditChecklistComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
  }
  
  // Fetch the checklist (only if active)
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

  // Check if any responses have been submitted for this checklist
  const { data: checklistResponses } = await supabase
    .from('checklist_responses')
    .select('id')
    .eq('checklist_id', formId)
    .limit(1);

  // Check if any responses have been submitted for the framework
  const { data: allChecklistResponses } = await supabase
    .from('checklist_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  const { data: formResponses } = await supabase
    .from('form_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  // Determine if editing is allowed (no responses)
  const hasChecklistResponses = checklistResponses && checklistResponses.length > 0;
  const hasFrameworkResponses = 
    (allChecklistResponses && allChecklistResponses.length > 0) || 
    (formResponses && formResponses.length > 0);
  
  const canEdit = !hasChecklistResponses && !hasFrameworkResponses;

  if (!canEdit) {
    return (
      <DashboardLayout userProfile={currentUserProfile}>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
            <div className="relative flex items-center justify-between">
              <div className="flex items-center">
                <Link 
                  href={`/protected/compliance/${id}/checklists`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Checklists
                </Link>
              </div>
              
              {/* Centered Title */}
              <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <CheckSquare className="h-6 w-6 text-sky-600" />
                </div>
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-sky-900">Cannot Edit Checklist</h1>
                  <p className="text-sky-600">#{checklist.id} • {framework.name}</p>
                </div>
              </div>
              
              {/* Right side placeholder for balance */}
              <div className="w-[140px]"></div>
            </div>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl">
            <CardHeader className="bg-amber-50 text-amber-800 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Checklist Cannot Be Edited</CardTitle>
                  <p className="text-amber-700 mt-1 text-sm">
                    {hasChecklistResponses ? 
                      "This checklist has responses and cannot be edited." : 
                      "Other checklists or forms in this compliance framework have responses, preventing edits."}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Once responses have been submitted to a checklist or other components within a compliance framework,
                  the checklist structure cannot be modified to maintain data integrity and compliance history.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Options:</h3>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Create a new compliance framework</li>
                    <li>View the checklist instead of editing it</li>
                    <li>Archive this checklist and create a new version</li>
                  </ul>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Link href={`/protected/view-compliance/${id}/checklists/${formId}`}>
                    <Button variant="outline">View Checklist</Button>
                  </Link>
                  <Link href={`/protected/compliance/${id}/checklists`}>
                    <Button>Return to Checklists</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href={`/protected/compliance/${id}/checklists`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Checklists
              </Link>
            </div>
            
            {/* Centered Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <CheckSquare className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-sky-900">Edit Checklist</h1>
                <p className="text-sky-600">#{checklist.id} • {framework.name}</p>
              </div>
            </div>
            
            {/* Right side placeholder for balance */}
            <div className="w-[140px]"></div>
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
