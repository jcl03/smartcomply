import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { reactivateCertificate } from "../actions";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function ArchivedCertificatesPage() {
  const supabase = await createClient();
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return redirect("/protected");
  }
  // Fetch archived certificates
  const { data: certificates, error } = await supabase
    .from('cert')
    .select('*')
    .eq('status', 'archive')
    .order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching archived certificates:", error);
  }
  async function handleReactivate(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    await reactivateCertificate(id);
    redirect("/protected/cert/archived");
  }
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sky-900">Archived Certificates</h1>
                <p className="text-sky-600 mt-1">View and manage archived certificates</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href="/protected/cert"
                className="inline-flex items-center justify-center rounded-lg bg-sky-50 px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-100 transition-all duration-200 border border-sky-200 shadow-sm"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Active
              </Link>
            </div>
          </div>
        </div>
        {/* Archived Certificates Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Archived Certificates</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {certificates && certificates.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-sky-50 border-b border-sky-100">
                    <tr>
                      <th className="text-left p-4 font-semibold text-sky-700">Folder</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Expiration</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert, index) => (
                      <tr key={cert.id} className={`border-b border-sky-100 hover:bg-sky-50/30 transition-colors ${index % 2 === 0 ? 'bg-sky-25/10' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-full">
                              <FileText className="h-4 w-4 text-sky-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sky-900">{cert.folder || 'Untitled'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {cert.expiration ? new Date(cert.expiration).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {profile.role === 'admin' || profile.role === 'manager' ? (
                              <form action={handleReactivate} className="inline">
                                <input type="hidden" name="id" value={cert.id} />
                                <button
                                  type="submit"
                                  className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-200 border border-emerald-200 flex items-center gap-2"
                                >
                                  <RotateCcw size={12} />
                                  Reactivate
                                </button>
                              </form>
                            ) : (
                              <span className="text-xs text-gray-400">No actions</span>
                            )}
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
                  <FileText className="h-10 w-10 text-sky-400" />
                </div>
                <h3 className="text-lg font-semibold text-sky-800 mb-2">No Archived Certificates</h3>
                <p className="text-sky-600 mb-6 max-w-md mx-auto">
                  There are currently no archived certificates. Archived certificates will appear here when you archive active ones.
                </p>
                <Link 
                  href="/protected/cert"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Active Certificates
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
