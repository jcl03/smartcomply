import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit3, Trash2, Folder, ArrowUpRight } from "lucide-react";

export default async function TeamManagementPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const currentUserProfile = await getUserProfile();
  if (!currentUserProfile || currentUserProfile.role !== "admin") {
    return redirect("/protected");
  }

  // Fetch teams
  const { data: teams, error } = await supabase
    .from("tenant")
    .select("id, name")
    .order("id");

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8 p-6">
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
                      <Folder className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Team Management</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Organization Teams
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Manage teams for your organization. Add, edit, or remove teams as needed.
                </p>
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Folder className="h-4 w-4" />
                    <span>Admin Access</span>
                  </div>
                </div>
              </div>
              <div className="lg:text-right">
                <Link
                  href="/protected/tenant/add"
                  className="inline-flex items-center gap-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-2xl p-4 border border-sky-300 shadow-lg hover:shadow-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
                >
                  <Plus className="h-6 w-6" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Add Team</p>
                    <p className="text-xs text-sky-100">Create new team</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Folder className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Teams</h3>
                  <p className="text-slate-300 text-sm">Manage teams for your organization</p>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                {teams?.length || 0} Total
              </div>
            </div>
          </div>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-slate-700">ID</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Name</th>
                    <th className="text-left p-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>{teams && teams.length > 0 ? teams.map((team: any) => (
                    <tr key={team.id} className="group border-b border-slate-100 hover:bg-gradient-to-r hover:from-slate-50 hover:to-sky-50 transition-all duration-300">
                      <td className="p-4">{team.id}</td>
                      <td className="p-4">{team.name}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/protected/tenant/${team.id}/edit`}
                            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 text-sm font-medium rounded-xl hover:from-sky-200 hover:to-blue-200 hover:shadow-md transition-all duration-300 border border-sky-200"
                          >
                            <Edit3 className="h-4 w-4" />
                            Edit
                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                          </Link>
                          <Link
                            href={`/protected/tenant/${team.id}/delete`}
                            className="group/btn flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-100 to-rose-100 text-red-700 text-sm font-medium rounded-xl hover:from-red-200 hover:to-rose-200 hover:shadow-md transition-all duration-300 border border-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-gray-400">No teams found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
