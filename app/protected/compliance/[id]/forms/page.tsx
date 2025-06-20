import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, FormInput, Archive, RotateCcw } from "lucide-react";
import Link from "next/link";
import { archiveForm, activateForm } from "../../actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function ComplianceFormsPage({ params }: { params: Promise<{ id: string }> }) {
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
    
  // If not admin, manager, or user, redirect to protected page
  if (!profile || !['admin', 'manager', 'user'].includes(profile.role)) {
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
  // Fetch forms for this framework (only active ones by default)
  const { data: forms, error: formsError } = await supabase
    .from('form')
    .select('*')
    .eq('compliance_id', id)
    .in('status', ['active', 'draft'])
    .order('id');
  if (formsError) {
    console.error("Error fetching forms:", formsError);
  }

  async function handleArchiveForm(formData: FormData) {
    "use server";
    const formId = parseInt(formData.get("id") as string);
    await archiveForm(formId);
    redirect(`/protected/compliance/${id}/forms`);
  }

  async function handleActivateForm(formData: FormData) {
    "use server";
    const formId = parseInt(formData.get("id") as string);
    await activateForm(formId);
    redirect(`/protected/compliance/${id}/forms`);
  }
  // Determine if user is admin
  const isAdmin = profile && profile.role === 'admin';
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/protected/compliance"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Frameworks
              </Link>
              <div className="bg-sky-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">{framework.name} - Forms</h1>
                <p className="text-sky-600">Manage dynamic forms for this framework</p>
              </div>
            </div>
            <div className="flex gap-3">
              {isAdmin && (
                <Link 
                  href={`/protected/compliance/${id}/forms/archive`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-100 text-sky-700 hover:bg-sky-200 border border-sky-200 transition-all duration-200 font-medium"
                >
                  <Archive className="h-4 w-4" />
                  View Archived
                </Link>
              )}
              {isAdmin && (
                <Link 
                  href={`/protected/compliance/${id}/forms/add`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Form
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Forms Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FormInput className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Dynamic Forms</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {forms && forms.length > 0 ? (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-sky-50 border-b border-sky-200">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sky-900">Form ID</th>
                        <th className="text-left p-4 font-semibold text-sky-900">Schema Preview</th>
                        <th className="text-left p-4 font-semibold text-sky-900">Status</th>
                        <th className="text-left p-4 font-semibold text-sky-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sky-100">
                      {forms.map((form, index) => (
                        <tr key={form.id} className={`hover:bg-sky-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-sky-25'}`}>
                          <td className="p-4">
                            <div className="font-semibold text-sky-900">Form #{form.id}</div>
                          </td>
                          <td className="p-4">
                            <div className="max-w-xs">
                              {form.form_schema?.title ? (
                                <>
                                  <div className="font-medium text-sky-800 text-sm">{form.form_schema.title}</div>
                                  {form.form_schema.description && (
                                    <div className="text-xs text-sky-500 mt-1">{form.form_schema.description}</div>
                                  )}
                                </>
                              ) : (
                                <div className="text-sky-600 text-sm">
                                  {Object.keys(form.form_schema || {}).length} fields
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              form.status === 'active' 
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            }`}>
                              {form.status === 'active' ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {form.status === 'draft' ? (
                                <>
                                  {isAdmin && (
                                    <Link 
                                      href={`/protected/compliance/${id}/forms/${form.id}/edit`}
                                      className="px-3 py-1.5 text-xs bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors font-medium border border-sky-200"
                                    >
                                      Edit
                                    </Link>
                                  )}
                                  <Link 
                                    href={`/protected/compliance/${id}/forms/${form.id}/preview`}
                                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-colors font-medium shadow-sm"
                                  >
                                    Preview
                                  </Link>
                                  {isAdmin && (
                                    <form action={handleActivateForm} className="inline">
                                      <input type="hidden" name="id" value={form.id} />
                                      <button
                                        type="submit"
                                        className="px-3 py-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex items-center gap-1 font-medium border border-emerald-200"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                        Activate
                                      </button>
                                    </form>
                                  )}
                                </>
                              ) : (
                                <>
                                  {isAdmin && (
                                    <Link 
                                      href={`/protected/compliance/${id}/forms/${form.id}/edit`}
                                      className="px-3 py-1.5 text-xs bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors font-medium border border-sky-200"
                                    >
                                      Edit
                                    </Link>
                                  )}
                                  <Link 
                                    href={`/protected/compliance/${id}/forms/${form.id}/preview`}
                                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-colors font-medium shadow-sm"
                                  >
                                    Preview
                                  </Link>
                                  {isAdmin && (
                                    <form action={handleArchiveForm} className="inline">
                                      <input type="hidden" name="id" value={form.id} />
                                      <button
                                        type="submit"
                                        className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors flex items-center gap-1 font-medium border border-orange-200"
                                      >
                                        <Archive className="h-3 w-3" />
                                        Archive
                                      </button>
                                    </form>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-6">
                <div className="bg-sky-100 p-4 rounded-full w-fit mx-auto mb-4">
                  <FormInput className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="text-lg font-semibold text-sky-900 mb-2">No forms found</h3>
                <p className="text-sky-600 mb-6">No forms have been created for this framework yet.</p>
                <Link 
                  href={`/protected/compliance/${id}/forms/add`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Form
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
