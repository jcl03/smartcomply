import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, CheckSquare, List, Archive, RotateCcw } from "lucide-react";
import Link from "next/link";
import { archiveChecklist, activateChecklist } from "../../actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function ComplianceChecklistsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
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
  // Fetch compliance framework (only active ones)
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }  // Fetch checklists for this framework (only active ones by default)
  const { data: checklists, error: checklistsError } = await supabase
    .from('checklist')
    .select('*')
    .eq('compliance_id', id)
    .eq('status', 'active')
    .order('id');
  if (checklistsError) {
    console.error("Error fetching checklists:", checklistsError);
  }

  async function handleArchiveChecklist(formData: FormData) {
    "use server";
    const checklistId = parseInt(formData.get("id") as string);
    await archiveChecklist(checklistId);
    redirect(`/protected/compliance/${id}/checklists`);
  }

  async function handleActivateChecklist(formData: FormData) {
    "use server";
    const checklistId = parseInt(formData.get("id") as string);
    await activateChecklist(checklistId);
    redirect(`/protected/compliance/${id}/checklists`);
  }
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <CheckSquare className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">{framework.name} - Checklists</h1>
                <p className="text-sky-600 mt-1">Manage compliance checklists for this framework</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/protected/compliance"
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Link>
              <Link 
                href={`/protected/compliance/${id}/checklists/archive`}
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <Archive size={16} className="mr-2" />
                View Archived
              </Link>
              <Link 
                href={`/protected/compliance/${id}/checklists/add`}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus size={16} className="mr-2" />
                Add Checklist
              </Link>
            </div>
          </div>
        </div>

        {/* Compliance Checklists Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <List className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Compliance Checklists</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {checklists && checklists.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-sky-50 border-b border-sky-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sky-700">Checklist ID</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Schema Preview</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Status</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checklists.map((checklist, index) => (
                      <tr key={checklist.id} className={`border-b border-sky-100 hover:bg-sky-50/30 transition-colors ${index % 2 === 0 ? 'bg-sky-25/10' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-full">
                              <CheckSquare className="h-4 w-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sky-900">Checklist #{checklist.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            {checklist.checklist_schema?.title ? (
                              <div className="font-medium text-sm text-sky-900">{checklist.checklist_schema.title}</div>
                            ) : (
                              <div className="text-sky-600 text-sm">
                                {checklist.checklist_schema?.items?.length || 0} items
                              </div>
                            )}
                            <div className="text-xs text-sky-600 mt-1 truncate">
                              {checklist.checklist_schema?.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <Link 
                              href={`/protected/compliance/${id}/checklists/${checklist.id}/edit`}
                              className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-all duration-200 border border-sky-200"
                            >
                              Edit
                            </Link>
                            <Link 
                              href={`/protected/compliance/${id}/checklists/${checklist.id}/preview`}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-sm"
                            >
                              Preview
                            </Link>
                            <form action={handleArchiveChecklist} className="inline">
                              <input type="hidden" name="id" value={checklist.id} />
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-all duration-200 border border-orange-200 flex items-center gap-2"
                              >
                                <Archive size={12} />
                                Archive
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-6">
                <div className="bg-sky-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <List className="h-10 w-10 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-sky-800 mb-2">No Checklists Found</h3>
                <p className="text-sky-600 mb-6 max-w-md mx-auto">
                  No checklists have been created for this framework yet. Get started by creating your first checklist.
                </p>
                <Link 
                  href={`/protected/compliance/${id}/checklists/add`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Plus size={16} className="mr-2" />
                  Create Your First Checklist
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
