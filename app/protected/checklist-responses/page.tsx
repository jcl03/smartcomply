import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Users, 
  Calendar,
  Eye
} from "lucide-react";

export default async function ChecklistResponsesPage() {
  const supabase = await createClient();
  
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
  }
  // Debug logging
  console.log('User profile:', profile);
  console.log('Current user ID:', user.id);// Only allow managers to access this page
  if (profile.role !== 'manager') {
    console.log('Access denied - user role:', profile.role);
    return redirect("/protected");
  }// Fetch all checklist responses for managers to view
  const { data: responses, error } = await supabase
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
    `)    .order('created_at', { ascending: false });

  // Debug logging
  console.log('Responses query result:', { responses, error });
  console.log('Raw response data:', responses);

  // Also try a simple count to see if there are any responses at all
  const { count, error: countError } = await supabase
    .from('checklist_responses')
    .select('*', { count: 'exact', head: true });

  console.log('Total count in checklist_responses table:', count, countError);

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

  // Fetch user profiles for all unique user_ids
  let userProfiles: Record<string, any> = {};
  if (responses && responses.length > 0) {
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
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">In Progress</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <DashboardLayout userProfile={profile}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sky-900">Checklist Responses</h1>
            <p className="text-sky-600 mt-1">
              View all checklist responses submitted by users and managers
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-sky-600">
            <Users className="h-4 w-4" />
            <span>{responses?.length || 0} total responses</span>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <p>Error loading checklist responses. Please try again.</p>
              </div>
            </CardContent>
          </Card>
        )}        {responses && responses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist responses found</h3>
              <p className="text-gray-600">
                No checklist responses have been submitted yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Debug info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h4 className="font-medium text-blue-900 mb-2">Debug Information:</h4>                <p className="text-sm text-blue-700">
                  Total responses: {responses?.length || 0}
                </p>
                <p className="text-sm text-blue-700">
                  Checklist info loaded: {Object.keys(checklistInfo).length}
                </p>
                <p className="text-sm text-blue-700">
                  User profiles loaded: {Object.keys(userProfiles).length}
                </p>
                {responses && responses.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-sm text-blue-700 cursor-pointer">View raw data</summary>
                    <pre className="text-xs text-blue-600 mt-2 overflow-auto">
                      {JSON.stringify(responses[0], null, 2)}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
              {/* Actual response cards */}
            <div className="grid gap-4">
              {responses?.map((response) => (
              <Card key={response.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(response.status)}                        <h3 className="text-lg font-semibold text-sky-900">
                          {response.title || 
                           checklistInfo[response.checklist_id]?.checklist_schema?.title || 
                           `Checklist ${response.checklist_id}`}
                        </h3>
                        {getStatusBadge(response.status)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">                        <div>
                          <p className="text-gray-500 font-medium">Framework</p>
                          <p className="text-sky-900">
                            {checklistInfo[response.checklist_id]?.compliance?.name || 'Unknown Framework'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 font-medium">Submitted By</p>
                          <div>
                            <p className="text-sky-900">{userProfiles[response.user_id]?.full_name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500">{userProfiles[response.user_id]?.email || 'No email'}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {userProfiles[response.user_id]?.role || 'user'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 font-medium">Created</p>
                          <p className="text-sky-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(response.created_at)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500 font-medium">Last Modified</p>
                          <p className="text-sky-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(response.last_edit_at || response.created_at)}
                          </p>
                        </div>
                      </div>                      {(response.result || response.response_data) && (
                        <div className="mt-4 space-y-2">
                          {response.result && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-500 font-medium text-xs mb-1">Result</p>
                              <p className="text-sm font-medium text-gray-900">
                                {response.result}
                              </p>
                            </div>
                          )}
                          
                          {response.response_data && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-gray-500 font-medium text-xs mb-1">Response Summary</p>
                              <div className="text-sm text-gray-700">
                                {(() => {
                                  try {
                                    const data = typeof response.response_data === 'string' 
                                      ? JSON.parse(response.response_data) 
                                      : response.response_data;
                                    
                                    const itemCount = Object.keys(data).filter(key => key.startsWith('item_')).length;
                                    const fileCount = Object.values(data).filter((value: any) => 
                                      value && typeof value === 'object' && value.fileName
                                    ).length;
                                    
                                    return (
                                      <div className="space-y-1">
                                        <p>Items completed: {itemCount}</p>
                                        <p>Files uploaded: {fileCount}</p>
                                        {data.checklist_title && (
                                          <p>Title: {data.checklist_title}</p>
                                        )}
                                      </div>
                                    );
                                  } catch (e) {
                                    return <p>Response data available</p>;
                                  }
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="hover:bg-sky-50 hover:border-sky-300"
                      >
                        <Link href={`/protected/documents/${response.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
