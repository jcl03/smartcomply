import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckSquare, List, RotateCcw } from "lucide-react";
import Link from "next/link";
import { activateChecklist } from "../../../actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function ChecklistsArchivePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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
  }

  // Fetch archived checklists for this framework
  const { data: checklists, error: checklistsError } = await supabase
    .from('checklist')
    .select('*')
    .eq('compliance_id', id)    .eq('status', 'archive')
    .order('id');

  if (checklistsError) {
    console.error("Error fetching archived checklists:", checklistsError);
  }

  async function handleActivateChecklist(formData: FormData) {
    "use server";
    const checklistId = parseInt(formData.get("id") as string);
    await activateChecklist(checklistId);
    redirect(`/protected/compliance/${id}/checklists/archive`);
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
                <h1 className="text-2xl font-bold text-sky-900">{framework.name} - Archived Checklists</h1>
                <p className="text-sky-600 mt-1">View and manage archived checklists for this framework</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/protected/compliance/${id}/checklists`}
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Active Checklists
              </Link>
            </div>
          </div>
        </div>

        {/* Archived Checklists Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <List className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Archived Checklists</CardTitle>
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
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                            Archived
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2 flex-wrap">
                            <Link 
                              href={`/protected/compliance/${id}/checklists/${checklist.id}/preview`}
                              className="px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200 shadow-sm"
                            >
                              Preview
                            </Link>
                            <form action={handleActivateChecklist} className="inline">
                              <input type="hidden" name="id" value={checklist.id} />
                              <button
                                type="submit"
                                className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 border border-emerald-200 flex items-center gap-2"
                              >
                                <RotateCcw size={12} />
                                Activate
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
                <h3 className="text-lg font-semibold text-sky-800 mb-2">No Archived Checklists</h3>
                <p className="text-sky-600 mb-6 max-w-md mx-auto">
                  There are currently no archived checklists for this framework. Archived checklists will appear here when you archive active ones.
                </p>
                <Link 
                  href={`/protected/compliance/${id}/checklists`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Active Checklists
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
