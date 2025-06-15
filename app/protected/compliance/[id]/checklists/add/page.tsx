import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addChecklist } from "../../../actions";
import AddChecklistComponent from "./AddChecklistComponent";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

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
