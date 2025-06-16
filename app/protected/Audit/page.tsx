import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AuditHistoryComponent from "@/components/audit/audit-history";
import { Card } from "@/components/ui/card";
import { 
  Activity,
  Calendar,
  Shield,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Users
} from "lucide-react";

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
  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';  try {
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
    
    const { data: audits, error } = await auditsQuery;  if (error) {
    console.error("Error fetching audits:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    // Return empty array if there's an error, don't crash the page
    const auditsWithProfiles: any[] = [];
    
    return (
      <DashboardLayout userProfile={userProfile}>
        <div className="space-y-8 p-6">
          {/* Hero Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 rounded-3xl border border-slate-200/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-500/5 to-indigo-600/5"></div>
            
            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                        <XCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Audit Management</p>
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Audit History
                      </h1>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    Unable to load audit data. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AuditHistoryComponent 
            audits={auditsWithProfiles} 
            isManager={isManager}
            currentUserId={user.id}
          />
        </div>
      </DashboardLayout>
    );
  }

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
  // Calculate metrics
  const totalAudits = auditsWithProfiles?.length || 0;
  const completedAudits = auditsWithProfiles?.filter(audit => audit.result && audit.result !== null).length || 0;
  const passedAudits = auditsWithProfiles?.filter(audit => audit.result === 'pass').length || 0;
  const failedAudits = auditsWithProfiles?.filter(audit => audit.result === 'failed').length || 0;
  const pendingAudits = auditsWithProfiles?.filter(audit => !audit.result || audit.result === null).length || 0;
  
  // Calculate average score
  const auditScores = auditsWithProfiles?.filter(audit => audit.percentage > 0).map(audit => audit.percentage) || [];
  const avgScore = auditScores.length > 0 ? Math.round(auditScores.reduce((a, b) => a + b, 0) / auditScores.length) : 0;

  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-8 p-6">
        {/* Hero Welcome Section */}
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
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Audit Management</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Audit History
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  {isManager 
                    ? "Monitor all audit activities across your organization and track compliance performance."
                    : "Review your audit history, track progress, and monitor compliance performance."
                  }
                </p>
                
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="h-4 w-4" />
                    <span>{totalAudits} Total Audits</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-lg">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Your Role</p>
                    <p className="text-lg font-bold text-slate-800">{isManager ? 'Manager' : 'User'}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Audits */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-900">{totalAudits}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Total Audits</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {totalAudits > 0 ? `${totalAudits} completed` : 'Start auditing'}
              </p>
            </div>
          </Card>

          {/* Passed Audits */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-sky-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">{passedAudits}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">Passed</h3>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Successful audits
              </p>
            </div>
          </Card>

          {/* Average Score */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-900">{avgScore}%</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-1">Average Score</h3>
              <p className="text-purple-600 text-sm flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Overall performance
              </p>
            </div>
          </Card>

          {/* Pending Audits */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-yellow-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-orange-900">{pendingAudits}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-orange-700 uppercase tracking-wider mb-1">Pending</h3>
              <p className="text-orange-600 text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Awaiting completion
              </p>
            </div>
          </Card>
        </div>

        {/* Audit History Section */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Audit History</h3>
                  <p className="text-slate-300 text-sm">
                    {isManager 
                      ? "All organizational audits" 
                      : "Your audit records"
                    }
                  </p>
                </div>
              </div>
              <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                {totalAudits} Records
              </div>
            </div>
          </div>
          
          <div className="p-0">
            <AuditHistoryComponent
              audits={auditsWithProfiles || []} 
              isManager={isManager}
              currentUserId={user.id}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );  } catch (err) {
    console.error("Unexpected error in audit page:", err);
    const auditsWithProfiles: any[] = [];
    
    return (
      <DashboardLayout userProfile={userProfile}>
        <div className="space-y-8 p-6">
          {/* Hero Welcome Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 rounded-3xl border border-slate-200/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-500/5 to-indigo-600/5"></div>
            
            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                        <XCircle className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">Audit Management</p>
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Audit History
                      </h1>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    Unable to load audits. Please try again later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <AuditHistoryComponent 
            audits={auditsWithProfiles} 
            isManager={isManager}
            currentUserId={user.id}
          />
        </div>
      </DashboardLayout>
    );
  }
}
