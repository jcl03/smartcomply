import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, Eye, Edit, Code, User, Calendar, Hash } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormPreview } from "@/components/form/form-preview";

interface FormFieldOption {
  value: string;
  points?: number;
  isFailOption?: boolean;
}

export default async function PreviewFormPage({ 
  params 
}: { 
  params: Promise<{ id: string; formId: string }> 
}) {
  const supabase = await createClient();
  const { id, formId } = await params;
  
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
    
  // If not admin, manager, or user, redirect to protected page
  if (!profile || !['admin', 'manager', 'user'].includes(profile.role)) {
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
  }
  
  // Fetch the form (allow both active and draft status)
  const { data: form, error: formError } = await supabase
    .from('form')
    .select('*')
    .eq('id', formId)
    .eq('compliance_id', id)
    .in('status', ['active', 'draft'])
    .single();

  if (formError || !form) {
    return redirect(`/protected/compliance/${id}/forms`);
  }

  // Add a visual indicator for draft forms
  const isDraft = form.status === 'draft';

  const formSchema = form.form_schema || {};
  const fields = formSchema.fields || [];
  
  // Determine if user is admin
  const isAdmin = profile && profile.role === 'admin';
  
  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 rounded-xl p-6 border border-sky-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-sky-100 p-3 rounded-full shadow-sm">
                <Eye className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-sky-900">Preview Form #{form.id}</h1>
                <p className="text-sky-600 mt-1">
                  {isDraft ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Draft Form
                      </span>
                      Review the draft form structure and field layout
                    </span>
                  ) : (
                    "Review the form structure and field layout"
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link 
                href={`/protected/compliance/${id}/forms`}
                className="inline-flex items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-sky-700 hover:bg-sky-50 transition-all duration-200 border border-sky-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Forms
              </Link>
              {/* Only show Edit button for admin */}
              {isAdmin && (
                <Link 
                  href={`/protected/compliance/${id}/forms/${formId}/edit`}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Edit size={16} className="mr-2" />
                  Edit Form
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Preview */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Form Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <FormPreview schema={formSchema} />
                
                <div className="pt-4 border-t border-sky-100">
                  <button 
                    type="button"
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg hover:from-sky-500 hover:to-blue-600 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled
                  >
                    Submit Form (Preview Only)
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-sky-600" />
                </div>
                <CardTitle className="text-lg text-sky-900">Form Details</CardTitle>
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
                      <Label className="text-sky-700 font-medium">Form ID</Label>
                      <p className="font-semibold text-sky-900">#{form.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Created</Label>
                      <p className="font-semibold text-sky-900">{new Date(form.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Fields Count</Label>
                      <p className="font-semibold text-sky-900">
                        {fields.filter((f: any) => !f.isSection).length} fields
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-sky-50 rounded-lg border border-sky-100">
                    <div className="bg-sky-100 p-2 rounded-full">
                      <Eye className="h-4 w-4 text-sky-600" />
                    </div>
                    <div>
                      <Label className="text-sky-700 font-medium">Status</Label>
                      <Badge variant={isDraft ? "secondary" : "default"} className="text-xs">
                        {isDraft ? "Draft" : "Published"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Remove schema structure from user view */}
                {/*
                <div className="pt-4 border-t border-sky-100">
                  <Label className="text-sky-700 font-medium">Schema Structure</Label>
                  <div className="mt-2 bg-sky-50 border border-sky-200 rounded-lg p-4 max-h-80 overflow-auto">
                    <pre className="text-sm text-sky-800 whitespace-pre-wrap font-mono">
                      {JSON.stringify(formSchema, null, 2)}
                    </pre>
                  </div>
                </div>
                */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
