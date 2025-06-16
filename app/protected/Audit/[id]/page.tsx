import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AuditDetailView from "@/components/audit/audit-detail-view";

interface AuditDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data
  const userProfile = await getUserProfile();
  
  if (!userProfile) {
    return redirect("/sign-in");
  }

  // Check if user is admin/manager
  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';
  // Fetch the specific audit
  let auditQuery = supabase
    .from('audit')
    .select(`
      id,
      form_id,
      user_id,
      status,
      created_at,
      last_edit_at,
      result,
      marks,
      percentage,
      comments,
      title,
      audit_data,
      form:form_id (
        id,
        form_schema,
        compliance_id,
        status,
        date_created,
        compliance:compliance_id (
          id,
          name,
          description
        )
      )
    `)
    .eq('id', params.id)
    .single();
  const { data: audit, error } = await auditQuery;

  if (error || !audit) {
    console.error("Error fetching audit:", error);
    return notFound();
  }
  // Fetch user profile for the audit
  const { data: auditUserProfile } = await supabase
    .from('view_user_profiles')
    .select('id, full_name, email')
    .eq('id', audit.user_id)
    .single();

  const auditWithProfile = {
    ...audit,
    user_profile: auditUserProfile || null
  };
  // Check if user has permission to view this audit
  if (!isManager && audit.user_id !== user.id) {
    return redirect("/protected/Audit");
  }

  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-6 p-6">
        <AuditDetailView 
          audit={auditWithProfile} 
          isManager={isManager}
          currentUserId={user.id}
        />
      </div>
    </DashboardLayout>
  );
}
