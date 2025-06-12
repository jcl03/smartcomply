import { getAllUserProfilesWithRevocationStatus } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { Shield, Users, Ban, Plus, Edit3, Mail, Calendar, Clock, UserCheck, UserX } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ResendActivationButton from "./ResendActivationButton";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";

export default async function UserManagementPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Check if user is admin
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not admin or error occurs, redirect to protected page
  if (error || !profile || profile.role !== 'admin') {
    return redirect("/protected");
  }
  
  // Fetch all user profiles for admin
  const allProfiles = await getAllUserProfilesWithRevocationStatus();
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
                <h1 className="text-2xl font-bold text-sky-900">User Management</h1>
                <p className="text-sky-600 mt-1">Manage user accounts, roles, and permissions</p>
              </div>
            </div>
            <Link 
              href="/protected/user-management/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
            >
              <Plus className="h-4 w-4" />
              Add New User
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-full">
                  <Users className="h-6 w-6 text-sky-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-sky-700">Total Users</p>
                  <p className="text-2xl font-bold text-sky-900">{allProfiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-100 p-3 rounded-full">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-700">Active Users</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {allProfiles.filter(p => !p.isRevoked).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700">Revoked Users</p>
                  <p className="text-2xl font-bold text-red-900">
                    {allProfiles.filter(p => p.isRevoked).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Activation</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {allProfiles.filter(p => !p.last_sign_in_at).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">All Users</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sky-50/50 border-b border-sky-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sky-700">User</th>
                    <th className="text-left p-4 font-semibold text-sky-700">Role</th>
                    <th className="text-left p-4 font-semibold text-sky-700">Status</th>
                    <th className="text-left p-4 font-semibold text-sky-700">Member Since</th>
                    <th className="text-left p-4 font-semibold text-sky-700">Last Active</th>
                    <th className="text-left p-4 font-semibold text-sky-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allProfiles.map((profile, index) => (
                    <tr 
                      key={profile.id} 
                      className={`border-b border-sky-100 hover:bg-sky-50/30 transition-colors ${
                        profile.isRevoked ? 'bg-red-50/30' : ''
                      } ${index % 2 === 0 ? 'bg-sky-25/10' : ''}`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-sky-100 p-2 rounded-full">
                            <Users className="h-4 w-4 text-sky-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sky-900">{profile.full_name}</p>
                              {profile.isRevoked && (
                                <Ban className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <p className="text-sm text-sky-600">{profile.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          profile.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : profile.role === 'manager'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : profile.role === 'external_auditor'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}>
                          {profile.role === 'external_auditor' ? 'External Auditor' : 
                           profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                          profile.isRevoked 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          {profile.isRevoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sky-700">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-sky-700">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {profile.last_sign_in_at 
                              ? new Date(profile.last_sign_in_at).toLocaleDateString()
                              : 'Never'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link 
                            href={`/protected/user-management/${profile.id}/edit`}
                            className="flex items-center gap-1 px-3 py-1.5 bg-sky-100 text-sky-700 text-xs font-medium rounded-lg hover:bg-sky-200 transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                            Edit
                          </Link>
                          {!profile.last_sign_in_at && (
                            <ResendActivationButton email={profile.email} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
