import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getUserProfile } from "@/lib/api";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { CertificateDetailView } from "@/components/cert/certificate-detail-view";

export default async function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
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
    // Check if user has manager or admin role for edit permissions
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role, tenant_id')
    .eq('email', user.email)
    .single();
    
  const canManage = profile && ['admin', 'manager'].includes(profile.role);
  
  // Fetch certificate with related data
  const { data: certificate, error } = await supabase
    .from('cert')
    .select(`
      id,
      link,
      created_at,
      folder,
      expiration,
      upload_date,
      audit_id,
      checklist_responses_id,
      status,
      tenant_id
    `)
    .eq('id', id)
    .single();

  // Check tenant access for non-admin users
  if (certificate && profile?.role !== 'admin' && profile?.tenant_id && certificate.tenant_id !== profile.tenant_id) {
    return redirect("/protected/cert");
  }

  // Fetch related audit data separately if audit_id exists
  let audit = null;
  if (certificate?.audit_id) {
    const { data: auditData } = await supabase
      .from('audit')
      .select(`
        id,
        title,
        status,
        created_at,
        marks,
        percentage,
        result
      `)
      .eq('id', certificate.audit_id)
      .single();
    audit = auditData;
  }

  // Fetch related checklist response data separately if checklist_responses_id exists
  let checklistResponse = null;
  if (certificate?.checklist_responses_id) {
    const { data: checklistData } = await supabase
      .from('checklist_responses')
      .select(`
        id,
        title,
        status,
        created_at,
        result
      `)
      .eq('id', certificate.checklist_responses_id)
      .single();
    checklistResponse = checklistData;
  }

  // Combine the data
  const certificateWithRelations = certificate ? {
    ...certificate,
    audit,
    checklist_responses: checklistResponse
  } : null;
  if (error || !certificateWithRelations) {
    return redirect("/protected/cert");
  }

  // Fetch related audits and checklist responses for edit form
  const { data: audits } = await supabase
    .from('audit')
    .select('id, title, status')
    .order('created_at', { ascending: false });

  const { data: checklistResponses } = await supabase
    .from('checklist_responses')
    .select('id, title, status')
    .order('created_at', { ascending: false });

  return (    <DashboardLayout userProfile={currentUserProfile}>
      <CertificateDetailView
        certificate={certificateWithRelations}
        canManage={canManage || false}
        audits={audits || []}
        checklistResponses={checklistResponses || []}
      />
    </DashboardLayout>
  );
}
