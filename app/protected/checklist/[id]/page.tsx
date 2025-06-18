import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
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
  Calendar,
  User,
  Edit,
  Download,
  ArrowLeft,
  Building,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getUserProfile } from "@/lib/api";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChecklistViewPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }

  // Get user profile to check role
  const userProfile = await getUserProfile();
  if (!userProfile) {
    return redirect("/sign-in");
  }

  // Fetch the checklist response
  const { data: response, error } = await supabase
    .from('checklist_responses')
    .select(`
      *,
      checklist (
        id,
        checklist_schema,
        compliance (
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !response) {
    notFound();
  }

  // Check if user has permission to view this response
  if (userProfile.role !== 'manager' && response.user_id !== user.id) {
    return redirect("/protected/checklist");
  }

  // Get submitter info if user is manager
  let submitterInfo = null;
  if (userProfile.role === 'manager') {
    const { data: submitter } = await supabase
      .from('view_user_profiles')
      .select('user_id, full_name, email, role')
      .eq('user_id', response.user_id)
      .single();
    submitterInfo = submitter;
  }

  const responseData = response.response_data || {};
  const schema = response.checklist?.checklist_schema;
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-500" />;
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

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Pass</Badge>;      case 'failed':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Failed</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200">Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("checklist-document")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Calculate progress based on completed items in response data
  const calculateProgress = () => {
    if (!schema?.sections?.length) return { completed: 0, total: 0, percentage: 0 };
    
    let total = 0;
    let completed = 0;
      schema.sections.forEach((section: any) => {
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

  const progress = calculateProgress();

  const renderChecklistItem = (item: any, sectionName: string) => {
    const itemData = responseData[item.id];
    
    if (item.type === 'document') {
      return (
        <Card key={item.id} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-slate-600" />
                  <h4 className="font-medium text-slate-900">{item.name}</h4>
                  {item.autoFail && (
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      Critical
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{sectionName}</p>
                
                {itemData ? (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">{itemData.fileName}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Size: {(itemData.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Uploaded: {formatDate(itemData.uploadedAt)}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                      >
                        <a 
                          href={getFileUrl(itemData.filePath)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-700">No document uploaded</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    } else if (item.type === 'yesno') {
      const value = itemData;
      return (
        <Card key={item.id} className="border border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-4 w-4 text-slate-600" />
                  <h4 className="font-medium text-slate-900">{item.name}</h4>
                  {item.autoFail && (
                    <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                      Critical
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 mb-3">{sectionName}</p>
                
                {value ? (
                  <div className={`rounded-lg p-3 ${value === 'yes' ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2">
                      {value === 'yes' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${value === 'yes' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {value === 'yes' ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700">No response provided</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  return (
    <DashboardLayout userProfile={userProfile}>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 rounded-2xl border border-slate-200/50 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-500/5 to-indigo-600/5"></div>
          <div className="relative z-10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/protected/checklist">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to List
                    </Link>
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <ClipboardList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl font-bold text-slate-900">
                        {response.title || schema?.title || 'Checklist Response'}
                      </h1>
                      {getStatusBadge(response.status)}
                      {getResultBadge(response.result)}
                    </div>
                    <p className="text-slate-600">
                      {response.checklist?.compliance?.name || 'Compliance Framework'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* Only show edit button if user owns the response */}
                {response.user_id === user.id && (
                  <Button asChild>
                    <Link href={`/protected/checklist/${response.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Response
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                </div>
                <span className="text-sm font-semibold text-blue-600">
                  {progress.completed} of {progress.total} items ({progress.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full transition-all duration-500 ${
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
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {progress.percentage === 100 ? '✅ Complete' : 
                   progress.percentage >= 75 ? '🟦 Almost done' :
                   progress.percentage >= 50 ? '🟨 Halfway there' :
                   '🟥 Getting started'}
                </span>
                <span>{progress.total - progress.completed} items remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Submitted</p>
                  <p className="font-medium text-slate-900">{formatDate(response.created_at)}</p>
                  <p className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {response.last_edit_at && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Edit className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Last Modified</p>
                    <p className="font-medium text-slate-900">{formatDate(response.last_edit_at)}</p>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(response.last_edit_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {submitterInfo && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Submitted By</p>
                    <p className="font-medium text-slate-900">{submitterInfo.full_name}</p>
                    <p className="text-xs text-slate-500">{submitterInfo.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Location/Instance */}
        {responseData.checklist_title && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Location/Instance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-slate-900">{responseData.checklist_title}</p>
            </CardContent>
          </Card>
        )}

        {/* Checklist Items */}
        {schema?.sections && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Checklist Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {schema.sections.map((section: any) => (
                <div key={section.id} className="space-y-4">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{section.name}</h3>
                  </div>
                  <div className="space-y-4">
                    {section.items.map((item: any) => renderChecklistItem(item, section.name))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Response Data Debug (only for managers in development) */}
        {userProfile.role === 'manager' && process.env.NODE_ENV === 'development' && (
          <Card>
            <CardHeader>
              <CardTitle>Response Data (Debug)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-slate-100 p-4 rounded-lg overflow-auto">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
