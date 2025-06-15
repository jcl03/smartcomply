import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserPlus, ArrowLeft } from "lucide-react";
import { inviteUser } from "../actions";
import AddUserForm from "./AddUserForm";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";

export default async function AddUserPage() {
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
  }  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section - Bold gradient like Create Framework */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-sm">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-3">Invite New User</h1>
                <p className="text-white/90 text-lg leading-relaxed max-w-2xl">
                  Send invitations to add new team members and expand your compliance management team with secure access controls
                </p>
              </div>
            </div>
            <Link 
              href="/protected/user-management"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to User Management
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">User Configuration</h2>
                    <p className="text-gray-600">Configure user details and access permissions</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                {/* Pass the action as a prop */}
                <AddUserForm action={inviteUser} />
              </div>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="space-y-6">
            {/* Process Steps Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Invitation Process</h3>
                    <p className="text-gray-600 text-sm">Step-by-step overview</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">1</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Email Sent</p>
                      <p className="text-gray-600 text-sm leading-relaxed">Secure invitation email delivered to recipient</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">2</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Account Setup</p>
                      <p className="text-gray-600 text-sm leading-relaxed">User creates secure password and completes profile</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">3</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Access Granted</p>
                      <p className="text-gray-600 text-sm leading-relaxed">Role-based permissions activated automatically</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 shadow-sm">4</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Team Ready</p>
                      <p className="text-gray-600 text-sm leading-relaxed">User can immediately start collaborating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>            {/* Security Features Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
                    <p className="text-gray-600 text-sm">Enterprise-grade protection</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Role-based access control</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Complete audit trails</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Session management</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
