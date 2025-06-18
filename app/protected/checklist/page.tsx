import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Calendar,
  Eye,
  User,
  Shield,
  Activity,
  BarChart3,
  Plus,
  ClipboardList,
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserProfile } from "@/lib/api";
import ComplianceFilter from "@/components/checklist/basic-filter";
import FilterIndicator from "@/components/checklist/filter-indicator";
import FilterByCompliance from "@/components/checklist/filter-by-compliance";
import FilteredIndicator from "@/components/checklist/filtered-indicator";

// Add this function to handle server-side filtering based on search params
export default async function ChecklistResponsesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = await createClient();
    // Get the compliance filter from URL search params
  const complianceFilter = typeof searchParams.compliance === 'string' && searchParams.compliance !== '' 
    ? searchParams.compliance.trim() 
    : undefined;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('email', user.email)
    .single();
  if (!profile) {
    return redirect("/sign-in");
  }  // Debug logging
  console.log('User profile:', profile);
  console.log('Current user ID:', user.id);
  console.log('Active compliance filter:', complianceFilter);

  // Fetch all active compliance frameworks for filtering
  const { data: complianceFrameworks } = await supabase
    .from('compliance')
    .select('id, name')
    .eq('status', 'active')
    .order('name');

  // Fetch checklist responses based on user role
  let responses, error;  if (profile.role === 'manager') {
    // Managers can view all checklist responses
    let query = supabase
      .from('checklist_responses')
      .select(`
        id,
        checklist_id,
        status,
        result,
        title,
        last_edit_at,
        created_at,
        user_id,
        response_data
      `);

    // Apply compliance filter if needed through checklists
    if (complianceFilter) {
      console.log('Manager: Applying filter for compliance ID:', complianceFilter);
      // First fetch checklists that match the compliance ID if filter is active
      const { data: filteredChecklistIds, error: filterError } = await supabase
        .from('checklist')
        .select('id')
        .eq('compliance_id', complianceFilter);
      
      if (filterError) {
        console.error('Error fetching checklists for compliance filter:', filterError);
      }
      
      if (filteredChecklistIds && filteredChecklistIds.length > 0) {
        const checklistIds = filteredChecklistIds.map(c => c.id);
        console.log('Found checklist IDs for filter:', checklistIds);
        query = query.in('checklist_id', checklistIds);
      } else {
        console.log('No checklists found for compliance ID:', complianceFilter);
        // If no checklists match the filter, add an impossible condition to return no results
        query = query.eq('id', -1);
      }
    }

    const result = await query.order('created_at', { ascending: false });
    responses = result.data;
    error = result.error;  } else {
    // Regular users can only view their own checklist responses
    let query = supabase
      .from('checklist_responses')
      .select(`
        id,
        checklist_id,
        status,
        result,
        title,
        last_edit_at,
        created_at,
        user_id,
        response_data
      `)
      .eq('user_id', user.id);
    
    // Apply compliance filter if needed through checklists
    if (complianceFilter) {
      console.log('User: Applying filter for compliance ID:', complianceFilter);
      // First fetch checklists that match the compliance ID if filter is active
      const { data: filteredChecklistIds, error: filterError } = await supabase
        .from('checklist')
        .select('id')
        .eq('compliance_id', complianceFilter);
      
      if (filterError) {
        console.error('Error fetching checklists for compliance filter:', filterError);
      }
      
      if (filteredChecklistIds && filteredChecklistIds.length > 0) {
        const checklistIds = filteredChecklistIds.map(c => c.id);
        console.log('Found checklist IDs for filter:', checklistIds);
        query = query.in('checklist_id', checklistIds);
      } else {
        console.log('No checklists found for compliance ID:', complianceFilter);
        // If no checklists match the filter, add an impossible condition to return no results
        query = query.eq('id', -1);
      }
    }

    const result = await query.order('created_at', { ascending: false });
    responses = result.data;
    error = result.error;
  }
  // Debug logging
  console.log('Responses query result:', { responses, error });
  console.log('Raw response data:', responses);

  // Also try a simple count to see if there are any responses at all
  let countQuery = supabase.from('checklist_responses').select('*', { count: 'exact', head: true });
  if (profile.role !== 'manager') {
    countQuery = countQuery.eq('user_id', user.id);
  }
  const { count, error: countError } = await countQuery;

  console.log(`Total count in checklist_responses table for ${profile.role}:`, count, countError);

  // Fetch checklist info separately if needed
  let checklistInfo: Record<string, any> = {};
  if (responses && responses.length > 0) {
    const checklistIds = Array.from(new Set(responses.map(r => r.checklist_id)));
    const { data: checklists } = await supabase
      .from('checklist')
      .select(`
        id,
        checklist_schema,
        compliance_id,
        compliance (
          id,
          name
        )
      `)
      .in('id', checklistIds);
    
    if (checklists) {
      checklistInfo = checklists.reduce((acc, checklist) => {
        acc[checklist.id] = checklist;
        return acc;
      }, {} as Record<string, any>);
    }
  }
  // Fetch user profiles for all unique user_ids (only needed for managers)
  let userProfiles: Record<string, any> = {};
  if (responses && responses.length > 0 && profile.role === 'manager') {
    const userIds = Array.from(new Set(responses.map(r => r.user_id)));
    const { data: profiles } = await supabase
      .from('view_user_profiles')
      .select('user_id, full_name, email, role')
      .in('user_id', userIds);
    
    if (profiles) {
      userProfiles = profiles.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>);
    }
  }
  if (error) {
    console.error('Error fetching checklist responses:', error);
  }
  // Debug logging
  console.log('Responses data:', responses);
  console.log('Checklist info:', checklistInfo);
  console.log('User profiles:', userProfiles);
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Failed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">In Progress</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Draft</Badge>;
    }
  };

  // Calculate progress for a single response
  const calculateResponseProgress = (response: any, checklistSchema: any) => {
    if (!checklistSchema?.sections?.length) return { completed: 0, total: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;
    const responseData = response.response_data || {};
    
    checklistSchema.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        total += 1;
        const value = responseData[item.id];
        
        if (item.type === 'document') {
          // Document is completed if it has a valid file
          if (value && (value.filePath || value.isTemporary)) {
            completed += 1;
          }
        } else if (item.type === 'yesno') {
          // Yes/No is completed only if the answer is 'yes'
          if (value === 'yes') {
            completed += 1;
          }
        } else {
          // Other types are completed if they have any value
          if (value) {
            completed += 1;
          }
        }
      });
    });
    
    // Add the title field to the count
    total += 1;
    if (response.title?.trim()) {
      completed += 1;
    }
    
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, percentage };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  return (
    <DashboardLayout userProfile={currentUserProfile}>
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
                      <ClipboardList className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Checklist Management</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {profile.role === 'manager' ? 'All Submissions' : 'My Submissions'}
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  {profile.role === 'manager' 
                    ? "Monitor all checklist submissions across your organization and track compliance progress."
                    : "View your submitted checklists and track your compliance completion status."
                  }
                </p>
                
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <ClipboardList className="h-4 w-4" />
                    <span>{responses?.length || 0} Total Submissions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    {profile.role === 'manager' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    <span>{profile.role === 'manager' ? 'Manager Access' : 'User Access'}</span>
                  </div>                  <FilterIndicator 
                    complianceFilter={complianceFilter} 
                    frameworkName={complianceFrameworks?.find(f => f.id.toString() === complianceFilter)?.name} 
                  />
                </div>
              </div>
              
              <div className="lg:text-right space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/protected/compliance"
                    className="inline-flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white transition-all duration-200 border border-slate-200 shadow-lg hover:shadow-xl"
                  >
                    <Shield size={16} className="mr-2" />
                    View Frameworks
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Submissions */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-sky-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">{responses?.length || 0}</p>
                  <FilteredIndicator isFiltered={!!complianceFilter} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">
                {profile.role === 'manager' ? 'Total Submissions' : 'My Submissions'}
              </h3>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <Activity className="h-4 w-4" />
                {profile.role === 'manager' ? 'All team responses' : 'Your responses'}
              </p>
            </div>
          </Card>

          {/* Completed */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-900">
                    {responses?.filter(r => r.status === 'completed').length || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Completed</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Successfully finished
              </p>
            </div>
          </Card>

          {/* In Progress */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-yellow-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-yellow-900">
                    {responses?.filter(r => r.status === 'in_progress').length || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-1">In Progress</h3>
              <p className="text-yellow-600 text-sm flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Currently working
              </p>
            </div>
          </Card>

          {/* Failed/Issues */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-pink-50 border-red-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-400/20 to-pink-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-red-900">
                    {responses?.filter(r => r.status === 'failed').length || 0}
                  </p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-red-700 uppercase tracking-wider mb-1">Issues</h3>
              <p className="text-red-600 text-sm flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Need attention
              </p>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200 bg-red-50 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <p>Error loading checklists. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submissions Overview */}        <Card className="bg-white/90 border-slate-200/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-800 text-white p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ComplianceFilter 
                  complianceFrameworks={complianceFrameworks || []} 
                  activeFilterId={complianceFilter}
                />
              </div>
              <div className="flex items-center">
                <div className="bg-indigo-600/60 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center">
                  <span className="font-bold mr-2">{responses?.length || 0}</span>
                  <span>{responses?.length === 1 ? 'Submission' : 'Submissions'}</span>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            {responses && responses.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead className="bg-sky-50 border-b border-sky-100">                    <tr>
                      <th className="text-left p-4 font-semibold text-sky-700">Checklist</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Status</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Progress</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Framework</th>
                      {profile.role === 'manager' && (
                        <th className="text-left p-4 font-semibold text-sky-700">Submitted By</th>
                      )}
                      <th className="text-left p-4 font-semibold text-sky-700">Submitted</th>
                      <th className="text-left p-4 font-semibold text-sky-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {responses.map((response, index) => (
                      <tr key={response.id} className={`border-b border-sky-100 hover:bg-sky-50/30 transition-colors ${index % 2 === 0 ? 'bg-sky-25/10' : ''}`}>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-2 rounded-full">
                              {getStatusIcon(response.status)}
                            </div>
                            <div>
                              <p className="font-semibold text-sky-900">
                                {response.title || 
                                 checklistInfo[response.checklist_id]?.checklist_schema?.title || 
                                 `Checklist ${response.checklist_id}`}
                              </p>
                              <p className="text-xs text-slate-500">ID: {response.id}</p>
                            </div>
                          </div>                        </td>
                        <td className="p-4">
                          {getStatusBadge(response.status)}
                        </td>
                        <td className="p-4">
                          {(() => {
                            const schema = checklistInfo[response.checklist_id]?.checklist_schema;
                            const progress = calculateResponseProgress(response, schema);
                            return (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-slate-600">
                                    {progress.completed}/{progress.total}
                                  </span>
                                  <span className="text-xs font-semibold text-blue-600">
                                    {progress.percentage}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      progress.percentage === 100 
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                                        : progress.percentage >= 75 
                                          ? 'bg-gradient-to-r from-blue-400 to-sky-500'
                                          : progress.percentage >= 50 
                                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                            : 'bg-gradient-to-r from-red-400 to-pink-500'
                                    }`}
                                    style={{ width: `${progress.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })()}
                        </td>                        <td className="p-4">
                          <FilterByCompliance
                            complianceId={checklistInfo[response.checklist_id]?.compliance?.id}
                            isFiltered={!!complianceFilter && checklistInfo[response.checklist_id]?.compliance?.id.toString() === complianceFilter}
                            frameworkName={checklistInfo[response.checklist_id]?.compliance?.name || 'Unknown Framework'}
                          />
                        </td>
                        {profile.role === 'manager' && (
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-slate-700">
                                {userProfiles[response.user_id]?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-slate-500">
                                {userProfiles[response.user_id]?.email || 'No email'}
                              </p>
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200 mt-1 inline-block">
                                {userProfiles[response.user_id]?.role || 'user'}
                              </span>
                            </div>
                          </td>
                        )}
                        <td className="p-4">
                          <div className="text-sm">
                            <p className="font-medium text-slate-700">
                              {formatDate(response.created_at)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </td>                        <td className="p-4">
                          <Link
                            href={`/protected/checklist/${response.id}`}
                            className="px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition-all duration-200 border border-sky-200 inline-flex items-center gap-2"
                          >
                            <Eye className="h-3 w-3" />
                            View Checklist
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 px-6">
                <div className="relative mx-auto mb-8">
                  <div className="bg-gradient-to-br from-sky-100 to-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto shadow-lg">
                    <ClipboardList className="h-12 w-12 text-sky-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">No Submissions Found</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto text-base leading-relaxed">
                  {profile.role === 'manager' 
                    ? "No checklist submissions have been made yet. Team members can start submitting compliance checklists to track organizational progress."
                    : "You haven't submitted any checklists yet. Start by completing your first compliance checklist to track your progress."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/protected/compliance"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Shield size={16} className="mr-2" />
                    View Available Checklists
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
