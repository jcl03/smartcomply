import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import { addComplianceFramework } from "../actions";
import AddComplianceForm from "./AddComplianceForm";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";

export default async function AddCompliancePage() {
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
    return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">Add Compliance Framework</h1>
                <p className="text-sky-600 mt-1">Create a new compliance framework for your organization</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/protected/compliance"
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Frameworks
              </Link>
            </div>
          </div>
        </div>

        {/* Add Framework Form Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Create New Framework</CardTitle>
              </div>
            </CardHeader>
            {/* Pass the action as a prop */}
            <AddComplianceForm action={addComplianceFramework} />
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
