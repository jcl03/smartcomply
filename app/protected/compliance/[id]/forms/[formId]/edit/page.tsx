import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, ArrowLeft, Settings } from "lucide-react";
import Link from "next/link";
import EditFormComponent from "./EditFormComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

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
  // Fetch the form (only if active)
  const { data: form, error: formError } = await supabase
    .from('form')
    .select('*')
    .eq('id', formId)
    .eq('compliance_id', id)
    .eq('status', 'active')
    .single();

  if (formError || !form) {
    return redirect(`/protected/compliance/${id}/forms`);
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
