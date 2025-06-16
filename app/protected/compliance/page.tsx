import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Plus, FileText, Archive, BarChart3, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import { archiveComplianceFramework } from "./actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

async function handleArchive(formData: FormData) {
  "use server";
  const id = parseInt(formData.get("id") as string);
  await archiveComplianceFramework(id);
  redirect("/protected/compliance");
}

export default async function CompliancePage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Check if user has permission to view active compliance (admin, manager, user)
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
  
  // If user role is not in allowed roles, redirect to protected page
  const allowedRoles = ['admin', 'manager', 'user'];
  if (!profile || !allowedRoles.includes(profile.role)) {
    return redirect("/protected");
  }
  // Determine admin permissions
  const isAdmin = profile.role === 'admin';

  // Fetch compliance frameworks (only active ones)
  const { data: frameworks, error } = await supabase
    .from('compliance')
    .select('*')
    .eq('status', 'active')
    .order('name');
  if (error) {
    console.error("Error fetching compliance frameworks:", error);
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
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Compliance Management</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Compliance Frameworks
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Manage your organization's compliance requirements, monitor frameworks, and ensure regulatory excellence.
                </p>
                
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4" />
                    <span>{frameworks?.length || 0} Active Frameworks</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:text-right space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/protected/compliance/archive"
                    className="inline-flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white transition-all duration-200 border border-slate-200 shadow-lg hover:shadow-xl"
                  >
                    <Archive size={16} className="mr-2" />
                    View Archive
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/protected/compliance/add"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Framework
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Frameworks */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-900">{frameworks?.length || 0}</p>
                </div>
              </div>              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Active Frameworks</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1">
                <Shield className="h-4 w-4" />
                {(frameworks?.length || 0) > 0 ? `${frameworks?.length || 0} active` : 'Start building'}
              </p>
            </div>
          </Card>

          {/* Total Forms */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-sky-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">0</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">Total Forms</h3>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <FileText className="h-4 w-4" />
                +0 this week
              </p>
            </div>
          </Card>

          {/* Compliance Score */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-900">85%</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-1">Compliance Score</h3>
              <p className="text-purple-600 text-sm flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Excellent rating
              </p>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-yellow-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-orange-900">0</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-1">Recent Activity</h3>
              <p className="text-orange-600 text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Items this month
              </p>
            </div>
          </Card>
        </div>

        {/* Frameworks Overview */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Active Frameworks</h3>
                  <p className="text-slate-300 text-sm">Manage compliance requirements</p>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                {frameworks?.length || 0} Active
              </div>
            </div>
          </div>
            <CardContent className="p-0">
            {frameworks && frameworks.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-sky-50 border-b border-sky-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sky-700">Name</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Status</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Forms</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Checklists</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {frameworks.map((framework, index) => (
                      <tr key={framework.id} className={`border-b border-sky-100 hover:bg-sky-50/30 transition-colors ${index % 2 === 0 ? 'bg-sky-25/10' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-full">
                              <Shield className="h-4 w-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sky-900">{framework.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/protected/compliance/${framework.id}/forms`}
                            className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
                          >
                            View Forms
                          </Link>
                        </td>
                        <td className="p-4">
                          <Link
                            href={`/protected/compliance/${framework.id}/checklists`}
                            className="text-sky-600 hover:text-sky-700 font-medium hover:underline transition-colors"
                          >
                            View Checklists
                          </Link>
                        </td>
                        <td className="p-4">
                          {isAdmin ? (                            <div className="flex gap-2 flex-wrap">
                              <Link
                                href={`/protected/compliance/${framework.id}/edit`}
                                className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-all duration-200 border border-sky-200"
                              >
                                Edit
                              </Link>
                              <form action={handleArchive} className="inline">
                                <input type="hidden" name="id" value={framework.id} />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all duration-200 border border-orange-200"
                                >
                                  Archive
                                </button>
                              </form>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No actions</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (              <div className="text-center py-16 px-6">
                <div className="relative mx-auto mb-8">
                  <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                    <FileText className="h-12 w-12 text-sky-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">No Active Frameworks</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-base leading-relaxed">
                  Get started by creating your first compliance framework to manage your organization's requirements and ensure regulatory excellence.
                </p>
                {isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/protected/compliance/add"
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Plus size={16} className="mr-2" />
                      Create Your First Framework
                    </Link>
                    <Link
                      href="/protected/compliance/archive"
                      className="inline-flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white transition-all duration-200 border border-slate-200 shadow-lg hover:shadow-xl"
                    >
                      <Archive size={16} className="mr-2" />
                      View Archive
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
