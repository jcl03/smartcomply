import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import EditComplianceForm from "./EditComplianceForm";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function EditCompliancePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
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

  const { id } = await params;
  // Fetch the compliance framework (only active ones)
  const { data: framework, error } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', parseInt(id))
    .eq('status', 'active')
    .single();
  if (error || !framework) {
    return redirect("/protected/compliance");
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/protected/compliance"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Frameworks
              </Link>
              <div className="bg-sky-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">Edit Compliance Framework</h1>
                <p className="text-sky-600">{framework.name}</p>
              </div>
            </div>
          </div>
        </div>        {/* Edit Form Card */}
        <div className="flex justify-center items-start">
          <div className="w-full max-w-lg">
            <Card className="bg-white/90 backdrop-blur-sm border-sky-200 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2.5 rounded-lg shadow-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">Edit Framework</CardTitle>
                    <p className="text-sky-100 mt-1 text-sm">Update your compliance framework details</p>
                  </div>
                </div>
              </CardHeader>
              <EditComplianceForm framework={framework} />
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}