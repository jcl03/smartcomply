import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { 
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  User,
  Shield,
  Eye,
  Download,
  AlertTriangle,
  Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import Link from "next/link";

export default async function DocumentViewPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  // Get user profile with role information
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // Only allow manager and user roles (exclude admin)
  if (!profile || !['manager', 'user'].includes(profile.role)) {
    return redirect("/protected");
  }

  // Fetch the specific checklist response
  const { data: response, error: responseError } = await supabase
    .from('checklist_responses')
    .select(`
      id,
      checklist_id,
      compliance_id,
      status,
      result,
      title,
      response_data,
      last_edit_at,
      created_at,
      checklist!inner (
        checklist_schema
      ),
      compliance!inner (
        name,
        description
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only view their own documents
    .single();

  if (responseError || !response) {
    return redirect("/protected/documents");
  }

  const compliance = (response.compliance as any);
  const checklist = (response.checklist as any);
  const schema = checklist?.checklist_schema;

  // Status configuration
  const statusConfig = {
    completed: { 
      color: 'bg-green-100 text-green-800 border-green-200', 
      icon: CheckCircle,
      text: 'Completed'
    },
    pending: { 
      color: 'bg-orange-100 text-orange-800 border-orange-200', 
      icon: Clock,
      text: 'Pending'
    },
    failed: { 
      color: 'bg-red-100 text-red-800 border-red-200', 
      icon: XCircle,
      text: 'Failed'
    }
  };

  const currentStatus = response.status === 'completed' && response.result === 'pass' 
    ? 'completed' 
    : response.result === 'fail' 
    ? 'failed' 
    : 'pending';

  const StatusIcon = statusConfig[currentStatus as keyof typeof statusConfig].icon;

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-sky-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/protected/documents"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Documents
              </Link>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {response.title || 'Untitled Document'}
                </h1>
                <p className="text-slate-600">
                  {compliance?.name || 'Unknown Framework'} • Submitted {format(new Date(response.last_edit_at), 'PPP')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Document Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <StatusIcon className={`h-5 w-5 ${currentStatus === 'completed' ? 'text-green-600' : currentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'}`} />
                  Document Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge 
                    variant="outline" 
                    className={statusConfig[currentStatus as keyof typeof statusConfig].color}
                  >
                    {statusConfig[currentStatus as keyof typeof statusConfig].text}
                  </Badge>
                  <span className={`font-medium ${response.result === 'pass' ? 'text-green-600' : 'text-red-600'}`}>
                    Result: {response.result === 'pass' ? 'Pass' : 'Fail'}
                  </span>
                </div>
                
                {response.result === 'fail' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Issues Found</span>
                    </div>
                    <p className="text-red-700 text-sm mt-2">
                      This checklist has failed items that require attention. Please review the responses below.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checklist Responses */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <CheckCircle className="h-5 w-5" />
                  Checklist Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {schema?.sections?.map((section: any, sectionIndex: number) => (
                  <div key={section.id} className="mb-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                      {section.name}
                    </h3>
                    
                    <div className="space-y-4">
                      {section.items?.map((item: any, itemIndex: number) => {
                        const responseValue = response.response_data?.[item.id];
                        const hasResponse = responseValue !== undefined && responseValue !== null && responseValue !== '';
                        
                        let responseDisplay = 'No response';
                        let responseStatus = 'neutral';
                        
                        if (hasResponse) {
                          if (item.type === 'yesno') {
                            responseDisplay = responseValue === 'yes' ? 'Yes' : 'No';
                            responseStatus = responseValue === 'yes' ? 'success' : (item.autoFail ? 'error' : 'warning');
                          } else if (item.type === 'document') {
                            if (typeof responseValue === 'object' && responseValue.fileName) {
                              responseDisplay = responseValue.fileName;
                              responseStatus = 'success';
                            } else {
                              responseDisplay = 'Document uploaded';
                              responseStatus = 'success';
                            }
                          }
                        } else {
                          responseStatus = 'error';
                        }

                        return (
                          <div 
                            key={item.id} 
                            className={`p-4 rounded-lg border ${
                              responseStatus === 'success' ? 'bg-green-50 border-green-200' :
                              responseStatus === 'error' ? 'bg-red-50 border-red-200' :
                              responseStatus === 'warning' ? 'bg-orange-50 border-orange-200' :
                              'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="flex items-center gap-2">
                                    {item.type === 'document' ? (
                                      <Upload className="h-4 w-4 text-blue-600" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4 text-purple-600" />
                                    )}
                                    <h4 className="font-medium text-slate-900">{item.name}</h4>
                                  </div>
                                  
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    item.type === 'document' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                  }`}>
                                    {item.type === 'document' ? 'Document' : 'Yes/No'}
                                  </span>
                                  
                                  {item.autoFail && (
                                    <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                      Critical
                                    </span>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">Response:</span>
                                  <span className={`font-medium ${
                                    responseStatus === 'success' ? 'text-green-700' :
                                    responseStatus === 'error' ? 'text-red-700' :
                                    responseStatus === 'warning' ? 'text-orange-700' :
                                    'text-slate-700'
                                  }`}>
                                    {responseDisplay}
                                  </span>
                                </div>
                              </div>
                              
                              {item.type === 'document' && hasResponse && responseValue?.filePath && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                                  asChild
                                >
                                  <a 
                                    href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/checklist-document/${responseValue.filePath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Info */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <FileText className="h-5 w-5" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Framework</label>
                  <p className="text-slate-900">{compliance?.name || 'Unknown'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Location/Instance</label>
                  <p className="text-slate-900">{response.title || 'Not specified'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Submitted</label>
                  <p className="text-slate-900">{format(new Date(response.last_edit_at), 'PPp')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Created</label>
                  <p className="text-slate-900">{format(new Date(response.created_at), 'PPp')}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-600">Document ID</label>
                  <p className="text-slate-900 font-mono text-sm">#{response.id}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50">
                  <FileText className="h-4 w-4 mr-2" />
                  View Original Checklist
                </Button>
                
                <Link href={`/protected/compliance/${response.compliance_id}`}>
                  <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Shield className="h-4 w-4 mr-2" />
                    View Framework
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
