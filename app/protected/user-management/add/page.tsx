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
  }
    return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <UserPlus className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">Invite New User</h1>
                <p className="text-sky-600 mt-1">Send an invitation to add a new user to the platform</p>
              </div>
            </div>
            <Link 
              href="/protected/user-management"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 border border-sky-200 text-sky-700 hover:bg-sky-50 hover:border-sky-300 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <UserPlus className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">User Invitation Details</CardTitle>
              </div>
            </CardHeader>
            {/* Pass the action as a prop */}
            <AddUserForm action={inviteUser} />
          </Card>
        </div>

        {/* Information Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                How User Invitations Work
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="space-y-4 text-sm text-blue-700">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                  <p>An invitation email will be sent to the provided email address with a secure link.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                  <p>The recipient can click the link to set up their account and create a password.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                  <p>Once activated, they'll have access to the platform based on their assigned role.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                  <p>You can resend activation emails or modify user permissions anytime from the user management page.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
