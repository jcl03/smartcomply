import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect, notFound } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AuditDetailView from "../../../../components/audit/audit-detail-view";

interface AuditDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  try {
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
      audit_data
    `)
    .eq('id', params.id)
    .single();

  const { data: audit, error } = await auditQuery;
  
  if (error || !audit) {
    console.error("Error fetching audit:", error);
    return notFound();
  }  // Fetch form data separately
  const { data: formData, error: formError } = await supabase
    .from('form')
    .select(`
      id,
      form_schema,
      compliance_id,
      status,
      date_created
    `)
    .eq('id', audit.form_id)
    .single();
  if (formError) {
    console.error("Error fetching form data:", formError?.message || "Unknown error");
  }// Fetch compliance data separately
  let complianceData = null;  if (formData?.compliance_id) {
    if (process.env.NODE_ENV === 'development') {
      console.log("Attempting to fetch compliance data for ID:", formData.compliance_id);
    }try {      const { data, error: complianceError } = await supabase
        .from('compliance')
        .select(`
          id,
          name
        `)
        .eq('id', formData.compliance_id)
        .single();
        
      if (complianceError) {
        console.error("Error fetching compliance data:", complianceError?.message || "Unknown compliance error");      } else {
        complianceData = data;
        if (process.env.NODE_ENV === 'development') {
          console.log("Successfully fetched compliance data:", complianceData);
        }
      }} catch (err) {
      console.error("Exception while fetching compliance data:", err instanceof Error ? err.message : "Unknown error");
    }  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log("No compliance_id found in form data:", formData);
    }
  }  // Fetch user profile for the audit
  let auditUserProfile = null;
  let userError = null;
  
  try {
    // Try to fetch from view_user_profiles first, but handle the error gracefully
    const { data: profileData, error: profileError } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, email')
      .eq('user_id', audit.user_id)
      .single();
    
    if (profileError) {
      console.error("Error fetching audit user profile:", profileError?.message || "Unknown user error");
      userError = profileError;
      
      // Fallback: try to get user data using admin client
      try {
        const adminClient = createAdminClient();
        const { data: authUser } = await adminClient.auth.admin.getUserById(audit.user_id);
        if (authUser?.user) {
          auditUserProfile = {
            id: authUser.user.id,
            full_name: authUser.user.user_metadata?.full_name || authUser.user.email,
            email: authUser.user.email
          };
        }
      } catch (adminErr) {
        console.error("Error fetching user via admin client:", adminErr instanceof Error ? adminErr.message : "Unknown error");
      }
    } else {
      auditUserProfile = profileData;
    }
  } catch (err) {
    console.error("Exception while fetching user data:", err instanceof Error ? err.message : "Unknown error");
  }
  const auditWithProfile = {
    ...audit,
    form: formData ? {
      ...formData,
      compliance: complianceData
    } : null,
    user_profile: auditUserProfile || null
  };  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log("Debug - Audit data:", {
      auditId: audit.id,
      formId: audit.form_id,
      userId: audit.user_id,
      hasForm: !!formData,
      hasCompliance: !!complianceData,
      hasUserProfile: !!auditUserProfile,
      formData: formData ? { 
        id: formData.id, 
        compliance_id: formData.compliance_id,
        status: formData.status 
      } : null,
      complianceData: complianceData ? { 
        id: complianceData.id, 
        name: complianceData.name 
      } : null,
      userProfile: auditUserProfile || null
    });
  }
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
  );  } catch (err) {
    console.error("Unexpected error in audit detail page:", err instanceof Error ? err.message : "Unknown error");
    return notFound();
  }
}
