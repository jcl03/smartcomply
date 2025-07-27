import { getAllUserProfilesWithRevocationStatus, getTenantUserProfilesWithRevocationStatus } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { 
  Shield, 
  Users, 
  Ban, 
  Plus, 
  Edit3, 
  Mail, 
  Calendar, 
  Clock, 
  UserCheck, 
  UserX,
  ArrowUpRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ResendActivationButton from "./ResendActivationButton";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { getCurrentUserProfile } from "@/lib/auth";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function UserManagementPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout and authorization
  const currentUserProfile = await getUserProfile();
  const fullCurrentUserProfile = await getCurrentUserProfile();
  
  // Check if user is admin or manager
  if (!fullCurrentUserProfile || !['admin', 'manager'].includes(fullCurrentUserProfile.role)) {
    return redirect("/protected");
  }
    // Fetch user profiles based on role
  let filteredProfiles;
  if (fullCurrentUserProfile.role === 'admin') {
    // Admins can see all users
    filteredProfiles = await getAllUserProfilesWithRevocationStatus();
  } else if (fullCurrentUserProfile.role === 'manager') {
    // SECURITY: Managers only fetch users from their tenant at SQL level
    if (!fullCurrentUserProfile.tenant_id) {
      // If manager has no tenant, they see no users
      filteredProfiles = [];
    } else {
      // Fetch only users from manager's tenant - SQL level filtering for security
      filteredProfiles = await getTenantUserProfilesWithRevocationStatus(fullCurrentUserProfile.tenant_id);
    }
  } else {
    filteredProfiles = [];
  }  
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8 p-6">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 rounded-3xl border border-slate-200/50 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-500/5 to-indigo-600/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/10 to-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-sky-500/10 rounded-full translate-y-40 -translate-x-40"></div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">User Management</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Team Administration
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Manage user accounts, roles, and permissions. Monitor team activity and ensure secure access control.
                </p>
                
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4" />
                    <span>Admin Access</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:text-right">
                <Link 
                  href="/protected/user-management/add"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl p-4 border border-sky-300 shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Add New User</p>
                    <p className="text-xs text-sky-100">Invite team member</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">          {/* Total Users */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-sky-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">{filteredProfiles.length}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">Total Users</h3>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                All team members
              </p>
            </div>
          </Card>
          
          {/* Active Users */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-900">
                    {filteredProfiles.filter((p: any) => !p.isRevoked).length}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Active Users</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Currently active
              </p>
            </div>
          </Card>
          
          {/* Revoked Users */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border-red-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-rose-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <UserX className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-red-900">
                    {filteredProfiles.filter((p: any) => p.isRevoked).length}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-1">Revoked Users</h3>
              <p className="text-red-600 text-sm flex items-center gap-1">
                <Ban className="h-4 w-4" />
                Access revoked
              </p>
            </div>
          </Card>
            {/* Pending Activation */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Mail className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-900">
                    {filteredProfiles.filter((p: any) => !p.last_sign_in_at).length}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">Recent Activity</h3>
              <p className="text-amber-600 text-sm flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Pending activation
              </p>
            </div>
          </Card>
        </div>        {/* Users Table */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Team Members</h3>
                  <p className="text-slate-300 text-sm">Manage user accounts and permissions</p>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                {filteredProfiles.length} Total
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">User</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Role</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Team</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Member Since</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Last Active</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProfiles.map((profile: any, index: number) => (
                    <tr 
                      key={profile.id} 
                      className={`group border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-sky-50 transition-all duration-300 ${
                        profile.isRevoked ? 'bg-red-50/30' : ''
                      }`}
                    >
                      <td className="p-4">                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="bg-gradient-to-br from-sky-100 to-blue-100 p-3 rounded-xl group-hover:from-sky-200 group-hover:to-blue-200 transition-all duration-300">
                              <Users className="h-5 w-5 text-sky-600" />
                            </div>
                            {profile.isRevoked && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white">
                                <Ban className="h-2 w-2 text-white m-0.5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 group-hover:text-sky-900 transition-colors">{profile.full_name}</p>
                            </div>
                            <p className="text-sm text-slate-500">{profile.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                          profile.role === 'admin' 
                            ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200' 
                            : profile.role === 'manager'
                            ? 'bg-gradient-to-r from-blue-100 to-sky-100 text-blue-700 border-blue-200'
                            : profile.role === 'external_auditor'
                            ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border-orange-200'
                            : 'bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border-sky-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            profile.role === 'admin' ? 'bg-purple-500' :
                            profile.role === 'manager' ? 'bg-blue-500' :
                            profile.role === 'external_auditor' ? 'bg-orange-500' : 'bg-sky-500'
                          }`}></div>                          {profile.role === 'external_auditor' ? 'External Auditor' : 
                           profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {profile.tenant ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200">
                              <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                              {profile.tenant.name}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              No Team
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                          profile.isRevoked 
                            ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200' 
                            : 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            profile.isRevoked ? 'bg-red-500' : 'bg-emerald-500'
                          }`}></div>
                          {profile.isRevoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{new Date(profile.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">
                            {profile.last_sign_in_at 
                              ? formatDistanceToNow(new Date(profile.last_sign_in_at), { addSuffix: true })
                              : 'Never'}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">                        <div className="flex gap-2">
                          <Link 
                            href={`/protected/user-management/${profile.id}/edit`}
                            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 text-sm font-medium rounded-xl hover:from-sky-200 hover:to-blue-200 hover:shadow-md transition-all duration-300 border border-sky-200"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
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
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
