import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function SelectFrameworkPage() {
  const supabase = await createClient();
  
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

  // Fetch compliance frameworks (only active ones)
  const { data: frameworks, error } = await supabase
    .from('compliance')
    .select('id, name, description, created_at')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error("Error fetching compliance frameworks:", error);
  }

  // If no frameworks exist, redirect to create one first
  if (!frameworks || frameworks.length === 0) {
    return redirect("/protected/compliance/add");
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/protected"
            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-sky-200 hover:bg-sky-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-sky-600" />
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-sky-900 flex items-center gap-3">
              <CheckSquare className="h-6 w-6 lg:h-8 lg:w-8 text-sky-600" />
              Create Checklist
            </h1>
            <p className="text-sky-600 mt-1">Select a compliance framework to add a checklist to</p>
          </div>
        </div>

        {/* Framework Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md">
          <CardHeader>
            <CardTitle className="text-sky-900">Select Compliance Framework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {frameworks.map((framework) => (
                <Link
                  key={framework.id}
                  href={`/protected/compliance/${framework.id}/checklists/add`}
                  className="block p-4 rounded-lg border border-sky-200 hover:bg-sky-50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-sky-900">{framework.name}</h3>
                      {framework.description && (
                        <p className="text-sm text-sky-600 mt-1">{framework.description}</p>
                      )}
                      <p className="text-xs text-sky-500 mt-2">
                        Created {new Date(framework.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sky-600">
                      <CheckSquare className="h-5 w-5" />
                      <span className="text-sm font-medium">Add Checklist</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create New Framework Option */}
        <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 rounded-xl shadow-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-semibold text-sky-900 mb-2">Need a new framework?</h3>
              <p className="text-sky-600 text-sm mb-4">
                Create a new compliance framework first, then add checklists to it.
              </p>
              <Link
                href="/protected/compliance/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create Framework
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
