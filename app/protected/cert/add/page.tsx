import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserProfile } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { AddCertificateForm } from "@/components/cert/add-certificate-form";

export default async function AddCertificatePage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
    // Check if user has manager or admin role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role, tenant_id')
    .eq('email', user.email)
    .single();
    
  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return redirect("/protected/cert");
  }

  // Fetch related audits and checklist responses for dropdowns with tenant filtering
  let auditQuery = supabase
    .from('audit')
    .select('id, title, status')
    .eq('status', 'completed')
    .order('created_at', { ascending: false });

  let checklistQuery = supabase
    .from('checklist_responses')
    .select('id, title, status')
    .order('created_at', { ascending: false });

  // Filter by tenant for non-admin users
  if (profile.role !== 'admin' && profile.tenant_id) {
    auditQuery = auditQuery.eq('tenant_id', profile.tenant_id);
    checklistQuery = checklistQuery.eq('tenant_id', profile.tenant_id);
  }

  const { data: audits } = await auditQuery;
  const { data: checklistResponses } = await checklistQuery;

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Certificate</h1>
          <p className="text-gray-600 mt-1">
            Upload and register a new compliance certificate
          </p>
        </div>

        <AddCertificateForm 
          audits={audits || []}
          checklistResponses={checklistResponses || []}
        />
      </div>
    </DashboardLayout>
  );
}
