import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, Eye, Edit, Code } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";

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
  const renderField = (field: any, index: number) => {
    // Helper function to determine if field should use enhanced options
    const shouldUseEnhancedOptions = (field: any) => {
      return (field.weightage && field.weightage > 0) || field.autoFail === true;
    };

    // Get options array - use enhanced options if available and conditions are met
    const getOptions = (field: any) => {
      if (shouldUseEnhancedOptions(field) && field.enhancedOptions) {
        return field.enhancedOptions;
      }
      return field.options?.map((option: string) => ({ value: option })) || [];
    };

    const options = getOptions(field);

    if (field.isSection) {
      return (
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-lg border border-indigo-100 shadow-sm">
          <div className="p-6">
            <h3 className="text-2xl font-semibold text-indigo-900">{field.label}</h3>
          </div>
        </div>
      );
    }

    return (
      <div key={field.id || index} className="space-y-3 p-4 bg-white/60 rounded-lg border border-sky-100 shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <Label className="text-sky-900 font-semibold text-base">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>{field.weightage && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
              Weight: {field.weightage}
            </span>
          )}
          {field.autoFail && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              Auto-fail
            </span>
          )}
        </div>        {field.type === "text" && (
          <Input 
            placeholder={field.placeholder} 
            className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400" 
          />
        )}
          {field.type === "textarea" && (
          <textarea 
            className="w-full p-3 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-colors bg-white text-sky-900 placeholder:text-sky-400" 
            placeholder={field.placeholder}
            rows={3}
          />
        )}{field.type === "select" && (
          <select className="w-full p-3 border border-sky-200 rounded-lg focus:border-sky-400 focus:ring-1 focus:ring-sky-200 transition-colors bg-white text-sky-900">
            <option value="" className="text-sky-600">Select an option...</option>
            {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
              <option key={optIndex} value={option.value} className="text-sky-900">
                {option.value}
                {'points' in option && option.points !== undefined && ` (${option.points} pts)`}
                {'isFailOption' in option && option.isFailOption && ' [FAIL]'}
              </option>
            ))}
          </select>
        )}
          {field.type === "checkbox" && (
          <>            {/* Single checkbox (no options) */}            {(!field.options && !field.enhancedOptions) && (
              <div className="flex items-center gap-3 p-3 bg-sky-50/20 rounded-lg border border-sky-100">
                <div 
                  className="h-4 w-4 rounded border-2 bg-white border-sky-300 hover:border-sky-400 cursor-pointer transition-all duration-200 flex items-center justify-center"
                >
                  {/* Interactive checkbox - could be controlled by state if needed */}
                </div>
                <label className="text-sky-900 font-medium cursor-pointer">{field.label}</label>
              </div>
            )}{/* Multiple checkbox options */}
            {(field.options || field.enhancedOptions) && (
              <div className="space-y-3 bg-sky-50/20 p-4 rounded-lg border border-sky-100">                {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-sky-100 hover:border-sky-200 transition-colors">
                    <div 
                      className="h-4 w-4 rounded border-2 bg-white border-sky-300 hover:border-sky-400 cursor-pointer transition-all duration-200 flex items-center justify-center"
                    >
                      {/* Interactive checkbox - could be controlled by state if needed */}
                    </div>
                    <label className="flex-1 text-sky-900 font-medium cursor-pointer">
                      {option.value}
                    </label>
                    <div className="flex items-center gap-2">
                      {'points' in option && option.points !== undefined && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                          {option.points} pts
                        </span>
                      )}
                      {'isFailOption' in option && option.isFailOption && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          Auto-fail
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}        
        {field.type === "radio" && (
          <div className="space-y-3 bg-sky-50/20 p-4 rounded-lg border border-sky-100">
            {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
              <div key={optIndex} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-sky-100 hover:border-sky-200 transition-colors">
                <input 
                  type="radio" 
                  name={field.id || `field_${index}`} 
                  id={`${field.id || `field_${index}`}_${optIndex}`}
                  value={option.value}
                  className="text-sky-600 focus:ring-sky-200 focus:ring-2"
                />
                <label htmlFor={`${field.id || `field_${index}`}_${optIndex}`} className="flex-1 text-sky-900 font-medium">
                  {option.value}
                </label>
                <div className="flex items-center gap-2">
                  {'points' in option && option.points !== undefined && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-800 border border-sky-200">
                      {option.points} pts
                    </span>
                  )}
                  {'isFailOption' in option && option.isFailOption && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                      Auto-fail
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}        
        {field.type === "email" && (
          <Input 
            type="email" 
            placeholder={field.placeholder} 
            className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400" 
          />
        )}
        
        {field.type === "number" && (
          <Input 
            type="number" 
            placeholder={field.placeholder} 
            className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900 placeholder:text-sky-400" 
          />
        )}
          {field.type === "date" && (
          <Input 
            type="date" 
            className="border-sky-200 focus:border-sky-400 focus:ring-sky-200 bg-white text-sky-900" 
          />
        )}

        {field.type === "image" && (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-sky-300 rounded-lg p-8 text-center bg-sky-50/30 hover:bg-sky-50/50 transition-colors cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <div className="bg-sky-100 p-3 rounded-full">
                  <svg className="h-8 w-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sky-700 font-medium text-lg">Click to upload image</p>
                  <p className="text-sky-500 text-sm">or drag and drop</p>
                </div>
                <p className="text-sky-400 text-xs">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

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
              <Link 
                href={`/protected/compliance/${id}/forms/${formId}/edit`}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Edit size={16} className="mr-2" />
                Edit Form
              </Link>
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
              {formSchema.title && (
                <div className="bg-sky-50/30 rounded-lg p-4 border border-sky-100">
                  <h3 className="text-xl font-semibold mb-2 text-sky-900">{formSchema.title}</h3>
                  {formSchema.description && (
                    <p className="text-sky-600">{formSchema.description}</p>
                  )}
                </div>
              )}
              
              {fields.length > 0 ? (
                <div className="space-y-4">
                  {fields.map((field: any, index: number) => (
                    <div key={field.id || index} className={field.isSection ? '' : 'bg-sky-50/20 rounded-lg p-4 border border-sky-100'}>
                      {renderField(field, index)}
                    </div>
                  ))}
                  
                  <div className="pt-4">
                    <button 
                      type="button"
                      className="w-full px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg font-medium cursor-not-allowed opacity-70"
                      disabled
                    >
                      Submit Form (Preview Only)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="bg-sky-100 p-4 rounded-full">
                      <FileText className="h-8 w-8 text-sky-600" />
                    </div>
                    <div>
                      <p className="text-sky-700 font-semibold text-lg mb-2">No fields defined</p>
                      <p className="text-sky-600 text-sm">This form doesn't have any fields configured yet</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Schema JSON */}
        <Card className="bg-white/80 backdrop-blur-sm border-sky-200 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Code className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">Form Schema & Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">            <div className="space-y-4">
              <div className="bg-sky-50/30 rounded-lg p-3 border border-sky-100">
                <Label className="text-sky-800 font-medium">Framework</Label>
                <p className="font-semibold text-sky-900">{framework.name}</p>
              </div>
              
              <div className="bg-sky-50/30 rounded-lg p-3 border border-sky-100">
                <Label className="text-sky-800 font-medium">Form ID</Label>
                <p className="font-semibold text-sky-900">#{form.id}</p>
              </div>
              
              <div className="bg-sky-50/30 rounded-lg p-3 border border-sky-100">
                <Label className="text-sky-800 font-medium">Created</Label>
                <p className="font-semibold text-sky-900">{new Date(form.created_at).toLocaleDateString()}</p>
              </div>
              
              <div className="bg-sky-50/30 rounded-lg p-3 border border-sky-100">
                <Label className="text-sky-800 font-medium">Schema Structure</Label>
                <pre className="bg-white p-4 rounded-lg text-sm overflow-auto max-h-96 border border-sky-200 mt-2 text-sky-700">
                  {JSON.stringify(formSchema, null, 2)}
                </pre>
              </div>
            </div>          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
