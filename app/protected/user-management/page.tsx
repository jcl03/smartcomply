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
  const allProfiles = await getAllUserProfilesWithRevocationStatus();  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section - Matching dashboard style */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-sky-50 rounded-2xl p-8 border border-slate-200/50 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-sm">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">User Management</p>
                <h1 className="text-3xl font-bold text-slate-800">
                  Manage Team Members
                </h1>
                <p className="text-slate-600 mt-1 max-w-2xl">
                  Monitor user accounts, track progress, and ensure proper access controls across your compliance management system
                </p>
              </div>
            </div>
              <div className="flex items-center gap-3">
              <Link 
                href="/protected/user-management/add"
                className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-sky-600 px-6 py-3 text-sm font-medium text-white hover:from-blue-600 hover:to-sky-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Plus size={16} className="mr-2 group-hover:scale-110 transition-transform duration-200" />
                Add New User
              </Link>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">System Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Sunday, June 15, 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-600">User Management: Active</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Matching dashboard metrics layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-600">{allProfiles.length}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700 uppercase tracking-wider">TOTAL USERS</p>
              <p className="text-emerald-600 text-sm flex items-center gap-1 mt-1">
                <span className="text-emerald-500">📈</span> 
                Active team members
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-100 rounded-2xl p-6 border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600">{allProfiles.filter(p => !p.isRevoked).length}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-blue-700 uppercase tracking-wider">ACTIVE USERS</p>
              <p className="text-blue-600 text-sm flex items-center gap-1 mt-1">
                <span className="text-blue-500">✅</span> 
                Currently engaged
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {Math.round((allProfiles.filter(p => !p.isRevoked).length / allProfiles.length) * 100)}%
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700 uppercase tracking-wider">ACCESS HEALTH</p>
              <p className="text-purple-600 text-sm flex items-center gap-1 mt-1">
                <span className="text-purple-500">🎯</span> 
                Excellent security
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 border border-amber-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <div className="text-4xl font-bold text-amber-600">{allProfiles.filter(p => !p.last_sign_in_at).length}</div>
            </div>
            <div>
              <p className="text-sm font-medium text-amber-700 uppercase tracking-wider">PENDING INVITES</p>
              <p className="text-amber-600 text-sm flex items-center gap-1 mt-1">
                <span className="text-amber-500">⏳</span> 
                Awaiting activation
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Cards Grid - Matching dashboard layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users Table - Takes 2 columns */}
          <div className="lg:col-span-2">            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Team Members</h3>
                    <p className="text-gray-600">User management overview</p>
                  </div>
                </div>
                <div className="text-blue-600 font-semibold">
                  {allProfiles.filter(p => !p.isRevoked).length} Active
                </div></div>
              
              <div className="p-6">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allProfiles.slice(0, 8).map((profile, index) => (                    <div 
                      key={profile.id} 
                      className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                        profile.isRevoked ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
                      } hover:bg-blue-50 hover:border-blue-200`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${profile.isRevoked ? 'bg-red-100' : 'bg-blue-100'}`}>
                          <Users className={`h-4 w-4 ${profile.isRevoked ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{profile.full_name}</p>
                            {profile.isRevoked && (
                              <Ban className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          profile.role === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                            : profile.role === 'manager'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : profile.role === 'external_auditor'
                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {profile.role === 'external_auditor' ? 'Auditor' : 
                           profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </span>
                        <Link 
                          href={`/protected/user-management/${profile.id}/edit`}
                          className="p-1 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                        >
                          <Edit3 className="h-3 w-3 text-blue-600" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                  {allProfiles.length > 8 && (
                  <div className="mt-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View all {allProfiles.length} users →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Profile Summary Card */}
          <div>
            <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl text-white shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Team Summary</h3>
                    <p className="text-blue-100">Your account details</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100 text-sm">Total Team Members</span>
                      <span className="text-white font-bold">{allProfiles.length}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-white rounded-full h-2 transition-all duration-500" 
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100 text-sm">Active Members</span>
                      <span className="text-white font-bold">{allProfiles.filter(p => !p.isRevoked).length}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-emerald-400 rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${(allProfiles.filter(p => !p.isRevoked).length / allProfiles.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-100 text-sm">Admin Users</span>
                      <span className="text-white font-bold">{allProfiles.filter(p => p.role === 'admin').length}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-purple-400 rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${(allProfiles.filter(p => p.role === 'admin').length / allProfiles.length) * 100}%` }}
                      ></div>
                    </div>
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
