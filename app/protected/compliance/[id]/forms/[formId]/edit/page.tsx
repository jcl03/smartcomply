import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Edit, ArrowLeft, Settings, AlertTriangle } from "lucide-react";
import Link from "next/link";
import EditFormComponent from "./EditFormComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default async function EditFormPage({ 
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
  // Fetch the form (only if active or draft)
  const { data: form, error: formError } = await supabase
    .from('form')
    .select('*')
    .eq('id', formId)
    .eq('compliance_id', id)
    .in('status', ['active', 'draft'])
    .single();

  if (formError || !form) {
    return redirect(`/protected/compliance/${id}/forms`);
  }

  // Check if any responses have been submitted for this form
  const { data: formResponses } = await supabase
    .from('form_responses')
    .select('id')
    .eq('form_id', formId)
    .limit(1);

  // Check if any responses have been submitted for the framework
  const { data: allFormResponses } = await supabase
    .from('form_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  const { data: checklistResponses } = await supabase
    .from('checklist_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  // Determine if editing is allowed (no responses)
  const hasFormResponses = formResponses && formResponses.length > 0;
  const hasFrameworkResponses = 
    (allFormResponses && allFormResponses.length > 0) || 
    (checklistResponses && checklistResponses.length > 0);
  
  const canEdit = form.status === 'draft' || (!hasFormResponses && !hasFrameworkResponses);

  if (!canEdit) {
    return (
      <DashboardLayout userProfile={currentUserProfile}>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full shadow-sm">
                  <Edit className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-sky-900">Cannot Edit Form</h1>
                  <p className="text-sky-600 mt-1">This form cannot be edited because responses have been submitted</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link 
                  href={`/protected/compliance/${id}/forms`}
                  className="inline-flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-all duration-200 border border-sky-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Forms
                </Link>
              </div>
            </div>
          </div>

          <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl">
            <CardHeader className="bg-amber-50 text-amber-800 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg shadow-sm">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Form Cannot Be Edited</CardTitle>
                  <p className="text-amber-700 mt-1 text-sm">
                    {hasFormResponses ? 
                      "This form has responses and cannot be edited." : 
                      "Other forms or checklists in this compliance framework have responses, preventing edits."}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Once responses have been submitted to a form or other components within a compliance framework,
                  the form structure cannot be modified to maintain data integrity and compliance history.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Options:</h3>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Create a new compliance framework</li>
                    <li>View the form instead of editing it</li>
                    <li>Archive this form and create a new version</li>
                  </ul>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Link href={`/protected/view-compliance/${id}/forms/${formId}`}>
                    <Button variant="outline">View Form</Button>
                  </Link>
                  <Link href={`/protected/compliance/${id}/forms`}>
                    <Button>Return to Forms</Button>
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
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full shadow-sm">
                <Edit className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">Edit Form #{form.id}</h1>
                <p className="text-sky-600 mt-1">Modify form fields, validation, and scoring settings</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/protected/compliance/${id}/forms`}
                className="inline-flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-all duration-200 border border-sky-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Forms
              </Link>
            </div>
          </div>
        </div>

        {/* Edit Form Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-sky-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg shadow-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Edit Dynamic Form</CardTitle>
                <p className="text-sky-100 mt-1 text-sm">Update form structure, fields, and configuration</p>
              </div>
            </div>
          </CardHeader>
          <EditFormComponent form={form} complianceId={id} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
