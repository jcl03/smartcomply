import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, ArrowLeft, Eye, FileText, Calendar, Hash } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

export default async function PreviewChecklistPage({ 
  params 
}: { 
  params: Promise<{ id: string; checklistId: string }> 
}) {
  const supabase = await createClient();
  const { id, checklistId } = await params;
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not admin, redirect to protected page
  if (!profile || profile.role !== 'admin') {
    return redirect("/protected");
  }
  // Fetch compliance framework (only active ones)
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }  // Fetch the checklist (allow both active and draft status)
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', id)
    .in('status', ['active', 'draft'])
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }
  const checklistSchema = checklist.checklist_schema || {};

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <Link 
                href={`/protected/compliance/${id}/checklists`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Checklists
              </Link>
            </div>
            
            {/* Centered Title */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full">
                <Eye className="h-6 w-6 text-sky-600" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-sky-900">Preview Checklist</h1>
                <p className="text-sky-600">#{checklist.id} • {framework.name}</p>
              </div>
            </div>

            <Link 
              href={`/protected/compliance/${id}/checklists/${checklistId}/edit`}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit Checklist
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Checklist Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Interactive Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <ChecklistPreview schema={checklistSchema} />
                
                <div className="pt-4 border-t border-sky-100">
                  <button 
                    type="button"
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Submit Checklist (Preview Only)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-sky-600" />
                </div>
                <CardTitle className="text-lg text-sky-900">Checklist Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Framework</Label>
                      <p className="font-semibold text-sky-900">{framework.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Hash className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Checklist ID</Label>
                      <p className="font-semibold text-sky-900">#{checklist.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Created</Label>
                      <p className="font-semibold text-sky-900">{new Date(checklist.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <CheckSquare className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Items Count</Label>
                      <p className="font-semibold text-sky-900">{checklistSchema.items?.length || 0} items</p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-sky-100">
                  <Label className="text-sky-700 font-medium">Schema Structure</Label>
                  <div className="mt-2 bg-sky-50 border border-sky-200 rounded-lg p-4 max-h-80 overflow-auto">
                    <pre className="text-sm text-sky-800 whitespace-pre-wrap font-mono">
                      {JSON.stringify(checklistSchema, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
