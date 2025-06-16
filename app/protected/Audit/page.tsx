import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AuditHistoryComponent from "@/components/audit/audit-history";

export default async function AuditPage() {
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
  // Fetch audits based on user role
  let auditsQuery = supabase
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
      form:form_id (
        id,
        form_schema,
        compliance_id,
        compliance:compliance_id (
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // If not manager, only show user's own audits
  if (!isManager) {
    auditsQuery = auditsQuery.eq('user_id', user.id);
  }

  const { data: audits, error } = await auditsQuery;
  // Fetch user profiles for the audits
  let auditsWithProfiles = audits || [];
  if (audits && audits.length > 0) {
    const userIds = Array.from(new Set(audits.map(audit => audit.user_id)));
    const { data: profiles } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    // Merge profiles with audits
    auditsWithProfiles = audits.map(audit => ({
      ...audit,
      user_profile: profiles?.find(profile => profile.id === audit.user_id) || null
    }));
  }

  if (error) {
    console.error("Error fetching audits:", error);
  }

  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Audit History</h1>            <p className="text-slate-600 mt-1">
              {isManager 
                ? `Viewing all audits (${auditsWithProfiles?.length || 0} total)`
                : `Viewing your audits (${auditsWithProfiles?.length || 0} total)`
              }
            </p>
          </div>
        </div>        <AuditHistoryComponent 
          audits={auditsWithProfiles || []} 
          isManager={isManager}
          currentUserId={user.id}
        />
      </div>
    </DashboardLayout>
  );
}
