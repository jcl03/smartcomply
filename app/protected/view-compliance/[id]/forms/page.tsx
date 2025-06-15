import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function ViewComplianceFormsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id: complianceId } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  // Fetch compliance framework
  const { data: compliance, error: complianceError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', complianceId)
    .single();

  if (complianceError || !compliance) {
    return redirect("/protected/compliance");
  }

  // Fetch forms
  const { data: forms } = await supabase
    .from('forms')
    .select(`
      id,
      form_schema,
      status,
      created_at,
      updated_at
    `)
    .eq('compliance_id', complianceId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <h1 className="text-2xl font-bold text-sky-900">{compliance.name} - Forms</h1>
          <p className="text-sky-600 mt-1">View and manage forms</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {forms?.map((form) => (
            <div
              key={form.id}
              className="bg-white p-6 rounded-xl border border-sky-100 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-sky-900">Form #{form.id}</h3>
                  <p className="text-sm text-sky-600">
                    Created: {new Date(form.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>{form.form_schema?.fields?.length || 0} fields</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
