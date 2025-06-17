import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addComplianceFramework } from "../actions";
import AddComplianceForm from "./AddComplianceForm";
import BreadcrumbWrapper from "./BreadcrumbWrapper";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

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
  }    return (
    <DashboardLayout userProfile={currentUserProfile}>
      <BreadcrumbWrapper>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="space-y-8 p-6">
          {/* Enhanced Header Section */}
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
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Create Framework
                    </h1>
                    <p className="text-blue-100 text-lg max-w-2xl">
                      Build comprehensive compliance frameworks to manage regulations, standards, and organizational requirements with precision
                    </p>
                  </div>
                </div>
                <Link 
                  href="/protected/compliance"
                  className="group inline-flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                  Back to Frameworks
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Main Form Card */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 transform scale-105"></div>
              <Card className="relative bg-white/90 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                
                <CardHeader className="relative bg-gradient-to-br from-slate-50 to-blue-50 border-b border-slate-200/50">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md"></div>
                      <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Framework Configuration
                      </CardTitle>
                      <p className="text-slate-600 mt-1">Configure your compliance framework settings and parameters</p>
                    </div>
                  </div>
                </CardHeader>
                {/* Pass the action as a prop */}
                <AddComplianceForm action={addComplianceFramework} />
              </Card>
            </div>
          </div>
        </div>        </div>
      </BreadcrumbWrapper>
    </DashboardLayout>
  );
}
