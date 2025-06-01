import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, ArrowLeft, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";

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

  // Fetch the form
  const { data: form, error: formError } = await supabase
    .from('form')
    .select('*')
    .eq('id', formId)
    .eq('compliance_id', id)
    .single();

  if (formError || !form) {
    return redirect(`/protected/compliance/${id}/forms`);
  }

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
    
    return (<div key={field.id || index} className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Label>
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </Label>
          {field.weightage && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Weight: {field.weightage}
            </span>
          )}
          {field.autoFail && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Auto-fail
            </span>
          )}
        </div>
        
        {field.type === "text" && (
          <Input placeholder={field.placeholder} />
        )}
        
        {field.type === "textarea" && (
          <textarea 
            className="w-full p-2 border rounded-md" 
            placeholder={field.placeholder}
            rows={3}
          />
        )}
          {field.type === "select" && (
          <select className="w-full p-2 border rounded-md">
            <option value="">Select an option...</option>
            {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
              <option key={optIndex} value={option.value}>
                {option.value}
                {'points' in option && option.points !== undefined && ` (${option.points} pts)`}
                {'isFailOption' in option && option.isFailOption && ' [FAIL]'}
              </option>
            ))}
          </select>
        )}
          {field.type === "checkbox" && (
          <>
            {/* Single checkbox (no options) */}
            {(!field.options && !field.enhancedOptions) && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id={`field_${index}`} />
                <label htmlFor={`field_${index}`}>{field.label}</label>
              </div>
            )}
            
            {/* Multiple checkbox options */}
            {(field.options || field.enhancedOptions) && (
              <div className="space-y-2">
                {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
                  <div key={optIndex} className="flex items-center gap-2 flex-wrap">
                    <input 
                      type="checkbox" 
                      id={`${field.id || `field_${index}`}_${optIndex}`}
                      value={option.value}
                    />
                    <label htmlFor={`${field.id || `field_${index}`}_${optIndex}`} className="flex-1">
                      {option.value}
                    </label>
                    {'points' in option && option.points !== undefined && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {option.points} pts
                      </span>
                    )}
                    {'isFailOption' in option && option.isFailOption && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Auto-fail
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
          {field.type === "radio" && (
          <div className="space-y-2">
            {options.map((option: FormFieldOption | { value: string }, optIndex: number) => (
              <div key={optIndex} className="flex items-center gap-2 flex-wrap">
                <input 
                  type="radio" 
                  name={field.id || `field_${index}`} 
                  id={`${field.id || `field_${index}`}_${optIndex}`}
                  value={option.value}
                />
                <label htmlFor={`${field.id || `field_${index}`}_${optIndex}`} className="flex-1">
                  {option.value}
                </label>
                {'points' in option && option.points !== undefined && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {option.points} pts
                  </span>
                )}
                {'isFailOption' in option && option.isFailOption && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Auto-fail
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {field.type === "email" && (
          <Input type="email" placeholder={field.placeholder} />
        )}
        
        {field.type === "number" && (
          <Input type="number" placeholder={field.placeholder} />
        )}
        
        {field.type === "date" && (
          <Input type="date" />
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/protected/compliance/${id}/forms`}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Forms
          </Link>
          <Eye className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Preview Form #{form.id}</h1>
        </div>
        <Link 
          href={`/protected/compliance/${id}/forms/${formId}/edit`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Edit Form
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Form Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formSchema.title && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">{formSchema.title}</h3>
                  {formSchema.description && (
                    <p className="text-muted-foreground">{formSchema.description}</p>
                  )}
                </div>
              )}
              
              {fields.length > 0 ? (
                <div className="space-y-4">
                  {fields.map((field: any, index: number) => renderField(field, index))}
                  
                  <div className="pt-4">
                    <button 
                      type="button"
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      disabled
                    >
                      Submit Form (Preview Only)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No fields defined for this form</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form Schema JSON */}
        <Card>
          <CardHeader>
            <CardTitle>Form Schema (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Framework</Label>
                <p className="font-medium">{framework.name}</p>
              </div>
              
              <div>
                <Label>Form ID</Label>
                <p className="font-medium">#{form.id}</p>
              </div>
              
              <div>
                <Label>Created</Label>
                <p className="font-medium">{new Date(form.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <Label>Schema Structure</Label>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(formSchema, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
