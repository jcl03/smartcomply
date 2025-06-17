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
  Eye,
  Folder,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default async function DocumentsPage() {
  const supabase = await createClient();

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
  }// Fetch all checklist responses for the current user
  const { data: responses, error: responsesError } = await supabase
    .from('checklist_responses')
    .select(`
      id,
      checklist_id,
      status,
      result,
      title,
      last_edit_at,
      created_at,
      checklist!inner (
        checklist_schema,
        compliance!inner (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('last_edit_at', { ascending: false });

  if (responsesError) {
    console.error("Error fetching checklists:", responsesError);
  }

  // Fetch all audits for the current user
  const { data: audits, error: auditsError } = await supabase
    .from('audit')
    .select(`
      id,
      form_id,
      status,
      result,
      title,
      last_edit_at,
      created_at,
      marks,
      percentage,
      comments,
      form!inner (
        id,
        form_schema,
        compliance!inner (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .order('last_edit_at', { ascending: false });

  if (auditsError) {
    console.error("Error fetching audits:", auditsError);
  }

  // Combine and format submissions
  const checklistSubmissions = (responses || []).map(response => ({
    ...response,
    type: 'checklist',
    compliance_name: (response.checklist as any)?.compliance?.name || 'Unknown Framework'
  }));

  const auditSubmissions = (audits || []).map(audit => ({
    ...audit,
    type: 'audit',
    compliance_name: (audit.form as any)?.compliance?.name || 'Unknown Framework'
  }));

  const submissions = [...checklistSubmissions, ...auditSubmissions]
    .sort((a, b) => new Date(b.last_edit_at).getTime() - new Date(a.last_edit_at).getTime());
  // Calculate summary statistics
  const totalSubmissions = submissions.length;
  const completedSubmissions = submissions.filter(s => s.status === 'completed' && s.result === 'pass').length;
  const pendingSubmissions = submissions.filter(s => s.status === 'pending' || s.result === 'failed' || s.status === 'draft').length;
  const recentSubmissions = submissions.filter(s => {
    const submissionDate = new Date(s.last_edit_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return submissionDate >= weekAgo;
  }).length;

  // Get counts by type
  const checklistCount = submissions.filter(s => s.type === 'checklist').length;
  const auditCount = submissions.filter(s => s.type === 'audit').length;

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-sky-50 rounded-2xl p-6 border border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-sm">
                <Folder className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
                <p className="text-slate-600">View and manage your submitted checklists and audits</p>
              </div>
            </div>
              {/* Search and Filter Controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search documents..." 
                  className="pl-10 w-64 bg-white border-slate-200 focus:border-blue-500"
                />
              </div>
              <select className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm">
                <option value="all">All Types</option>
                <option value="checklist">Checklists</option>
                <option value="audit">Audits</option>
              </select>
              <select className="px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-600 text-sm">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Documents</p>
                  <p className="text-2xl font-bold text-slate-900">{totalSubmissions}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedSubmissions}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Needs Attention</p>
                  <p className="text-2xl font-bold text-orange-600">{pendingSubmissions}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">This Week</p>
                  <p className="text-2xl font-bold text-blue-600">{recentSubmissions}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card><Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Checklists</p>
                  <p className="text-2xl font-bold text-purple-600">{checklistCount}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Audits</p>
                  <p className="text-2xl font-bold text-indigo-600">{auditCount}</p>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5" />
              Recent Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {submissions.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No Documents Yet</h3>
                <p className="text-slate-600 mb-4">
                  You haven't submitted any checklists or audits yet.
                </p>
                <Link href="/protected/compliance">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Browse Compliance Frameworks
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {submissions.map((submission) => {
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
                  };                  const resultConfig = {
                    pass: { color: 'text-green-600', text: 'Pass' },
                    failed: { color: 'text-red-600', text: 'Failed' }
                  };

                  const currentStatus = submission.status === 'completed' && submission.result === 'pass' 
                    ? 'completed' 
                    : submission.result === 'failed' 
                    ? 'failed' 
                    : 'pending';

                  const StatusIcon = statusConfig[currentStatus as keyof typeof statusConfig].icon;

                  return (
                    <div key={submission.id} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className={`h-5 w-5 ${currentStatus === 'completed' ? 'text-green-600' : currentStatus === 'failed' ? 'text-red-600' : 'text-orange-600'}`} />
                            <h3 className="text-lg font-semibold text-slate-900 truncate">
                              {submission.title || 'Untitled Document'}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={statusConfig[currentStatus as keyof typeof statusConfig].color}
                            >
                              {statusConfig[currentStatus as keyof typeof statusConfig].text}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={submission.type === 'checklist' ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200'}
                            >
                              {submission.type === 'checklist' ? 'Checklist' : 'Audit'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4" />
                              <span>{submission.compliance_name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Submitted {formatDistanceToNow(new Date(submission.last_edit_at), { addSuffix: true })}</span>
                            </div>                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className={resultConfig[submission.result as keyof typeof resultConfig].color}>
                                Result: {resultConfig[submission.result as keyof typeof resultConfig].text}
                                {submission.type === 'audit' && (submission as any).percentage !== undefined && (
                                  <span className="ml-1">({(submission as any).percentage}%)</span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                          <div className="flex items-center gap-2 ml-4">
                          <Link href={submission.type === 'audit' ? `/protected/Audit/${submission.id}` : `/protected/documents/${submission.id}`}>
                            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
