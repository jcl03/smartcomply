import { getUserProfile, getUserProfiles } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import AuditHistoryComponent from "@/components/audit/audit-history";
import { Card } from "@/components/ui/card";
import { 
  Activity,
  Calendar,
  FileText,
  XCircle,
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
    // Check if audit table exists first with better error handling
    const { data: tableCheck, error: tableError } = await supabase
      .from('audit')
      .select('id')
      .limit(1);

    if (tableError) {
      console.log("Audit table check failed:", tableError);
      console.log("Table error details:", {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      });
      // Table doesn't exist or has issues, use sample data
      throw new Error("Audit table not accessible");
    }

    // Use simple query without JOIN to avoid issues
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
        title
      `)
      .order('created_at', { ascending: false });

    // If not manager, only show user's own audits
    if (!isManager) {
      auditsQuery = auditsQuery.eq('user_id', user.id);
    }
    
    const { data: audits, error } = await auditsQuery;

    if (error) {
      console.error("Error fetching audits:", error);
      console.error("Detailed error information:", {
        message: error.message || 'No message',
        details: error.details || 'No details',
        hint: error.hint || 'No hint',
        code: error.code || 'No code',
        fullError: JSON.stringify(error, null, 2)
      });
      throw error;
    }

    console.log(`Successfully fetched ${audits?.length || 0} audits`);
  
    let auditsWithProfiles: any[] = [];

    if (!audits || audits.length === 0) {
      console.log("No audits found, using sample data for demonstration");
      
      // If table doesn't exist, provide sample data for UI demonstration
      const sampleAudits = [
        {
          id: 1,
          form_id: 1,
          user_id: user.id,
          status: 'completed',
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          last_edit_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          result: 'pass' as const,
          marks: 85,
          percentage: 85,
          comments: 'All security protocols are functioning correctly. Minor recommendations for improvement.',
          title: 'Security Compliance Audit - Q4 2024',
          user_profile: {
            full_name: userProfile?.full_name || 'Current User',
            email: userProfile?.email || user.email || 'user@example.com'
          }
        },
        {
          id: 2,
          form_id: 2,
          user_id: user.id,
          status: 'completed',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_edit_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          result: 'failed' as const,
          marks: 45,
          percentage: 45,
          comments: 'Several critical issues found. Immediate action required on data encryption.',
          title: 'Data Protection Audit - Q3 2024',
          user_profile: {
            full_name: userProfile?.full_name || 'Current User',
            email: userProfile?.email || user.email || 'user@example.com'
          }
        },
        {
          id: 3,
          form_id: 3,
          user_id: user.id,
          status: 'draft',
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          last_edit_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          result: null,
          marks: 0,
          percentage: 0,
          comments: 'Audit in progress. Scheduled for completion by end of week.',
          title: 'Network Security Assessment - In Progress',
          user_profile: {
            full_name: userProfile?.full_name || 'Current User',
            email: userProfile?.email || user.email || 'user@example.com'
          }
        }
      ];
      
      // Use sample data for demonstration
      auditsWithProfiles = sampleAudits;
    } else {
      // Process real audits with user profiles
      console.log(`Processing ${audits.length} real audit records`);
      
      // Use the new API function to fetch profiles
      const userIds = Array.from(new Set(audits.map(audit => audit.user_id)));
      console.log("Fetching profiles for user IDs:", userIds);
      
      const profiles = await getUserProfiles(userIds);
      console.log(`Retrieved ${profiles.length} user profiles`);

      // Merge profiles with audits
      auditsWithProfiles = audits.map(audit => {
        const matchedProfile = profiles?.find(profile => profile.id === audit.user_id);
        
        return {
          ...audit,
          user_profile: matchedProfile || {
            id: audit.user_id,
            full_name: audit.user_id === user.id ? 
              (userProfile?.full_name || user.email?.split('@')[0] || 'You') : 
              `User ${audit.user_id?.slice(-6) || 'Unknown'}`,
            email: audit.user_id === user.id ? 
              (user.email || userProfile?.email || '') : 
              ''
          }
        };
      });
      
      console.log("Final audits with profiles:", auditsWithProfiles.map(a => ({ 
        id: a.id, 
        user_id: a.user_id, 
        user_name: a.user_profile?.full_name,
        user_email: a.user_profile?.email
      })));
    }

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
                    <span>{auditsWithProfiles?.length || 0} Total Audits</span>
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
        </div>{/* Audit History Section */}
        <Card className="bg-white/95 backdrop-blur-md border-slate-200/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 shadow-lg">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold">Audit History</h3>
                  <p className="text-slate-300 text-sm">
                    {isManager 
                      ? "All organizational audits and compliance records" 
                      : "Your personal audit records and compliance history"
                    }
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold border border-white/20">
                {auditsWithProfiles?.length || 0} Records
              </div>
            </div>
          </div>
          
          <div className="p-6">
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
          {/* Error State Hero Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-3xl border border-red-200/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-orange-500/5 to-yellow-600/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-400/10 to-orange-600/10 rounded-full -translate-y-48 translate-x-48"></div>
            
            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="bg-gradient-to-br from-red-500 to-orange-600 p-4 rounded-2xl shadow-lg">
                        <XCircle className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-600 mb-1">System Alert</p>
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                        Audit History
                      </h1>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 max-w-2xl">
                    We're experiencing difficulties loading your audit data. Please try refreshing the page or contact support if the issue persists.
                  </p>
                  
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Connection Issue</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error State Audit Component */}
          <Card className="bg-white/95 backdrop-blur-md border-red-200/60 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-500/10 to-red-600/10"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30 shadow-lg">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold">Unable to Load Audits</h3>
                    <p className="text-red-200 text-sm">
                      Please try again later or contact support
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <AuditHistoryComponent 
                audits={auditsWithProfiles} 
                isManager={isManager}
                currentUserId={user.id}
              />
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
}
