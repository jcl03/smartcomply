import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { addChecklist } from "../../../actions";
import AddChecklistComponent from "./AddChecklistComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default async function AddChecklistPage({ params }: { params: Promise<{ id: string }> }) {
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

  // If there are responses, new checklists cannot be added
  const hasFrameworkResponses = 
    (formResponses && formResponses.length > 0) || 
    (checklistResponses && checklistResponses.length > 0);

  // Can only add new checklists if no responses have been submitted
  const canAddChecklist = !hasFrameworkResponses;

  if (!canAddChecklist) {
    return (
      <DashboardLayout userProfile={currentUserProfile}>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <CheckSquare className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-sky-900">Cannot Add Checklist</h1>
                  <p className="text-sky-600 mt-1">New checklists cannot be added to this compliance framework</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/protected/compliance/${id}/checklists`}
                  className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Checklists
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
                  <CardTitle className="text-xl font-bold">Adding Checklists Not Allowed</CardTitle>
                  <p className="text-amber-700 mt-1 text-sm">
                    This compliance framework already has responses submitted, preventing the addition of new checklists.
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
                    <li>Create a new compliance framework with additional checklists</li>
                    <li>View existing checklists in this framework</li>
                    <li>Archive this framework if it's no longer needed</li>
                  </ul>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <Link href={`/protected/view-compliance/${id}/checklists`}>
                    <Button variant="outline">View Checklists</Button>
                  </Link>
                  <Link href={`/protected/compliance/${id}/checklists`}>
                    <Button>Return to Checklists Dashboard</Button>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="space-y-8 p-6">
          {/* Cinematic Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>
            
            <div className="relative p-8 lg:p-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg"></div>
                    <div className="relative bg-white/20 backdrop-blur-sm p-4 rounded-2xl border border-white/30">
                      <CheckSquare className="h-10 w-10 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                      Add Checklist to{" "}
                      <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                        {framework.name}
                      </span>
                    </h1>
                    <p className="text-blue-100 text-xl max-w-2xl">
                      Create a comprehensive compliance checklist with advanced validation and tracking
                    </p>
                  </div>
                </div>
                <div className="hidden lg:flex">
                  <Link 
                    href={`/protected/compliance/${id}/checklists`}
                    className="group relative inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-3 text-white font-semibold transition-all duration-300 hover:bg-white/20 hover:scale-105"
                  >
                    <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Back to Checklists
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Form Card */}
          <div className="max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
              <Card className="relative bg-white/90 backdrop-blur-lg border border-white/50 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl overflow-hidden">
                <CardHeader className="relative bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 text-white p-8">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/20 rounded-xl blur-md"></div>
                      <div className="relative bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                        <CheckSquare className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold text-white mb-2">Checklist Configuration</CardTitle>
                      <p className="text-blue-100 text-lg">Configure your compliance checklist settings and requirements</p>
                    </div>
                  </div>
                </CardHeader>
                {/* Pass the action and compliance ID as props */}
                <AddChecklistComponent action={addChecklist} complianceId={id} />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
