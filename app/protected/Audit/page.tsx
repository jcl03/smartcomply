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
  XCircle
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
  const isManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

  try {
    // Check if audit table exists first with better error handling
    const { data: tableCheck, error: tableError } = await supabase
      .from('audit')
      .select('id')
      .limit(1);    if (tableError) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Audit table check failed:", tableError);
        console.log("Table error details:", {
          message: tableError.message,
          details: tableError.details,
          hint: tableError.hint,
          code: tableError.code
        });
      }
      // Table doesn't exist or has issues, use empty array
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
        title,
        verification_status,
        verified_by,
        verified_at,
        corrective_action,
        tenant_id
      `)
      .order('created_at', { ascending: false });

    // Apply filtering based on user role
    if (userProfile?.role === 'admin') {
      // Admins can see all audits - no additional filter needed
    } else if (userProfile?.role === 'manager') {
      // Managers can only see audits from their tenant
      if (userProfile.tenant_id) {
        auditsQuery = auditsQuery.eq('tenant_id', userProfile.tenant_id);
      } else {
        // If manager has no tenant, they see no audits
        auditsQuery = auditsQuery.eq('tenant_id', -1); // This will return no results
      }
    } else {
      // Regular users only see their own audits
      auditsQuery = auditsQuery.eq('user_id', user.id);
    }
    
    const { data: audits, error } = await auditsQuery;    if (error) {
      console.error("Error fetching audits:", error);
      if (process.env.NODE_ENV === 'development') {
        console.error("Detailed error information:", {
          message: error.message || 'No message',
          details: error.details || 'No details',
          hint: error.hint || 'No hint',
          code: error.code || 'No code',
          fullError: JSON.stringify(error, null, 2)
        });
      }
      throw error;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Successfully fetched ${audits?.length || 0} audits`);
    }
  
    let auditsWithProfiles: any[] = [];    if (!audits || audits.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log("No audit records found in database");
      }
      auditsWithProfiles = [];
    } else {
      // Process real audits with user profiles
      if (process.env.NODE_ENV === 'development') {
        console.log(`Processing ${audits.length} real audit records`);
      }
      
      // Use the new API function to fetch profiles
      const userIds = Array.from(new Set(audits.map(audit => audit.user_id)));
      if (process.env.NODE_ENV === 'development') {
        console.log("Fetching profiles for user IDs:", userIds);
      }
      
      const profiles = await getUserProfiles(userIds);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retrieved ${profiles.length} user profiles`);
      }

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
        };      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Final audits with profiles:", auditsWithProfiles.map(a => ({ 
          id: a.id, 
          user_id: a.user_id, 
          user_name: a.user_profile?.full_name,
          has_profile: !!a.user_profile
        })));
      }
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
                        <FileText className="h-8 w-8 text-white" />
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
                    Track and manage audit records with verification workflow and tenant-based access control.
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
                      <Activity className="h-4 w-4" />
                      <span>{auditsWithProfiles.length} Records</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Empty State Notice */}
          {(!audits || audits.length === 0) && (
            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl shadow-lg">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-slate-100 p-3 rounded-xl">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No Audit Records Found</h3>
                    <p className="text-slate-700 mb-4">
                      There are currently no audit records in the database. Audit records will appear here once they are created.
                    </p>
                    <div className="bg-white/50 rounded-lg p-4 border border-slate-200">
                      <h4 className="font-medium text-slate-800 mb-2">Audit Management Features:</h4>
                      <ul className="text-sm text-slate-700 space-y-1">
                        <li>• <strong>Tenant Support:</strong> Audits are associated with specific tenants</li>
                        <li>• <strong>Verification Workflow:</strong> Audits can be verified, accepted, or rejected by managers</li>
                        <li>• <strong>Corrective Actions:</strong> Track required actions for failed audits</li>
                        <li>• <strong>Access Control:</strong> Managers see only audits from their tenant</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Audits Table */}
          {auditsWithProfiles.length > 0 && (
            <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Audit Records</h3>
                      <p className="text-slate-300 text-sm">View and manage audit history</p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                    {auditsWithProfiles.length} Total
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
          )}
        </div>
      </DashboardLayout>
    );

  } catch (err) {
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
        </div>
      </DashboardLayout>
    );
  }
}
