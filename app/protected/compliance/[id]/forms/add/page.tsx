import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormInput, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { addForm } from "../../../actions";
import AddFormComponent from "./AddFormComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default async function AddFormPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
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
  
  // Check if any responses have been submitted for the framework
  const { data: formResponses } = await supabase
    .from('form_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  const { data: checklistResponses } = await supabase
    .from('checklist_responses')
    .select('id')
    .eq('compliance_id', id)
    .limit(1);

  // If there are responses, new forms cannot be added
  const hasFrameworkResponses = 
    (formResponses && formResponses.length > 0) || 
    (checklistResponses && checklistResponses.length > 0);

  // Can only add new forms if no responses have been submitted
  const canAddForm = !hasFrameworkResponses;

  if (!canAddForm) {
    return (
      <DashboardLayout userProfile={currentUserProfile}>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <FormInput className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sky-900">Cannot Add Form</h1>
                  <p className="text-sky-600 mt-1">New forms cannot be added to this compliance framework</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/protected/compliance/${id}/forms`}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
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
                  <CardTitle className="text-xl font-bold">Adding Forms Not Allowed</CardTitle>
                  <p className="text-amber-700 mt-1 text-sm">
                    This compliance framework already has responses submitted, preventing the addition of new forms.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-gray-700">
                  Once responses have been submitted to any form or checklist within a compliance framework,
                  the framework structure cannot be modified to maintain data integrity and compliance history.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-4">
                  <h3 className="font-semibold text-blue-700 mb-2">Options:</h3>
                  <ul className="list-disc list-inside space-y-2 text-blue-700">
                    <li>Create a new compliance framework with additional forms</li>
                    <li>View existing forms in this framework</li>
                    <li>Archive this framework if it's no longer needed</li>
                  </ul>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Link href={`/protected/compliance/${id}/forms`}>
                    <Button variant="outline">View Forms</Button>
                  </Link>
                  <Link href={`/protected/compliance/${id}/forms`}>
                    <Button>Return to Forms Dashboard</Button>
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
                <FormInput className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">Add Form to {framework.name}</h1>
                <p className="text-sky-600 mt-1">Create a dynamic form for compliance data collection</p>
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
        </div>        {/* Add Form Card */}
        <Card className="bg-white/90 backdrop-blur-sm border-sky-200 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg shadow-lg">
                <FormInput className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Create Dynamic Form</CardTitle>
                <p className="text-sky-100 mt-1 text-sm">Build a custom form with fields, validation, and scoring</p>
              </div>
            </div>
          </CardHeader>
          {/* Pass the action and compliance ID as props */}
          <AddFormComponent action={addForm} complianceId={id} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
