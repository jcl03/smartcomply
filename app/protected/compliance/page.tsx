import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Plus, FileText, Archive } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import { archiveComplianceFramework } from "./actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

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

  async function handleArchive(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    await archiveComplianceFramework(id);
    redirect("/protected/compliance");
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
                <h1 className="text-2xl font-bold text-sky-900">Compliance Frameworks</h1>
                <p className="text-sky-600 mt-1">Manage your organization's compliance requirements</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/protected/compliance/archive"
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <Archive size={16} className="mr-2" />
                View Archive
              </Link>
              {isAdmin && (
                <Link
                  href="/protected/compliance/add"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Add Framework
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Active Frameworks Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Active Frameworks</CardTitle>
            </div>
          </CardHeader>
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
                          {isAdmin ? (
                            <div className="flex gap-2 flex-wrap">
                              <Link
                                href={`/protected/compliance/${framework.id}/edit`}
                                className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-all duration-200 border border-sky-200"
                              >
                                Edit
                              </Link>
                              <Link
                                href={`/protected/compliance/${framework.id}/forms/add`}
                                className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-sm"
                              >
                                Add Form
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
            ) : (
              <div className="text-center py-16 px-6">
                <div className="bg-sky-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-sky-800 mb-2">No Active Frameworks</h3>
                <p className="text-sky-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first compliance framework to manage your organization's requirements.
                </p>
                {isAdmin && (
                  <Link
                    href="/protected/compliance/add"
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Your First Framework
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
