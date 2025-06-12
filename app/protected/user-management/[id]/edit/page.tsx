import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCog, Mail, AlertCircle, Shield, User, Calendar, Clock, Settings } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import UpdateEmailForm from "./UpdateEmailForm";
import UpdateRoleForm from "./UpdateRoleForm";
import RevokeAccessForm from "./RevokeAccessForm";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const { id } = await params;
  const userId = id;
  const supabase = await createClient();
  
  // Get current user profile for the dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Get current user to check if they're editing their own account
  const { data: { user } } = await supabase.auth.getUser();
  let isCurrentUser = false;
  
  if (user) {
    // Get current user's profile ID
    const { data: currentProfile } = await supabase
      .from('view_user_profiles')
      .select('id')
      .eq('email', user.email)
      .single();
      
    // Check if the user is editing their own account (ensure string comparison)
    if (currentProfile && String(currentProfile.id) === String(userId)) {
      isCurrentUser = true;
    }
  }
    // Get user profile
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error || !profile) {
    redirect("/protected/user-management");
  }  // Check if user access is revoked by looking up their auth record
  let isRevoked = false;
  let authUserId: string | null = null;
  
  try {
    const adminClient = createAdminClient();
    
    // First get the auth user ID by finding the user with matching email
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      const authUser = authUsers.users.find(u => u.email === profile.email);
      if (authUser) {
        authUserId = authUser.id;
        
        // Now get fresh user data directly by ID to avoid caching issues
        const { data: freshUserData, error: userError } = await adminClient.auth.admin.getUserById(authUser.id);
        
        if (!userError && freshUserData) {
          // Check if user access is revoked based on metadata
          isRevoked = freshUserData.user.user_metadata?.revoked === true;
          console.log(`Checking revocation status for ${profile.email} (using getUserById):`, {
            isRevoked,
            metadata: freshUserData.user.user_metadata
          });
        } else {
          console.error("Error getting fresh user data:", userError);
          // Fallback to listUsers data
          isRevoked = authUser.user_metadata?.revoked === true;
          console.log(`Fallback revocation check for ${profile.email}:`, {
            isRevoked,
            metadata: authUser.user_metadata
          });
        }
      }
    }
  } catch (err) {
    console.error("Error checking revocation status:", err);
  }
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <UserCog className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">Edit User Account</h1>
                <p className="text-sky-600 mt-1">Manage user settings and permissions</p>
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

        {/* User Profile Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">User Profile Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-sky-600" />
                  <Label className="text-sm font-medium text-sky-700">Full Name</Label>
                </div>
                <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
                  <p className="font-semibold text-sky-900">{profile.full_name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-sky-600" />
                  <Label className="text-sm font-medium text-sky-700">Email Address</Label>
                </div>
                <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
                  <p className="font-semibold text-sky-900">{profile.email}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  <Label className="text-sm font-medium text-sky-700">Member Since</Label>
                </div>
                <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
                  <p className="font-semibold text-sky-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-sky-600" />
                  <Label className="text-sm font-medium text-sky-700">Last Sign In</Label>
                </div>
                <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
                  <p className="font-semibold text-sky-900">
                    {profile.last_sign_in_at 
                      ? new Date(profile.last_sign_in_at).toLocaleDateString()
                      : 'Never signed in'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Management Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Settings className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Role Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {isCurrentUser ? (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold">Cannot Modify Own Role</p>
                  <p className="text-sm mt-1 text-amber-700">For security reasons, administrators cannot modify their own role. Please ask another administrator to make changes if needed.</p>
                </div>
              </div>
            ) : (
              <UpdateRoleForm userId={profile.id} currentRole={profile.role} />
            )}
          </CardContent>
        </Card>

        {/* Email Management Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Email Management</CardTitle>
            </div>
          </CardHeader>
          <UpdateEmailForm userId={profile.id} currentEmail={profile.email} />
        </Card>

        {/* Access Control Card */}
        {!isCurrentUser && (
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Account Access Control</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <RevokeAccessForm 
                userId={profile.id} 
                userEmail={profile.email}
                isRevoked={isRevoked}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
