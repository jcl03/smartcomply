import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, FileText, FormInput } from "lucide-react";
import Link from "next/link";

export default async function ComplianceFormsPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;
  
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

  // Fetch compliance framework
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }

  // Fetch forms for this framework
  const { data: forms, error: formsError } = await supabase
    .from('form')
    .select('*')
    .eq('compliance_id', id)
    .order('id');

  if (formsError) {
    console.error("Error fetching forms:", formsError);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href="/protected/compliance"
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{framework.name} - Forms</h1>
        </div>
        <Link 
          href={`/protected/compliance/${id}/forms/add`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Form
        </Link>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            Dynamic Forms
          </CardTitle>
        </CardHeader>
        <CardContent>
          {forms && forms.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Form ID</th>
                    <th className="text-left p-3 font-medium">Schema Preview</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">Form #{form.id}</div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          {form.form_schema?.title ? (
                            <div className="font-medium text-sm">{form.form_schema.title}</div>
                          ) : (
                            <div className="text-muted-foreground text-sm">
                              {Object.keys(form.form_schema || {}).length} fields
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {JSON.stringify(form.form_schema).substring(0, 100)}...
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link 
                            href={`/protected/compliance/${id}/forms/${form.id}/edit`}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                          >
                            Edit
                          </Link>
                          <Link 
                            href={`/protected/compliance/${id}/forms/${form.id}/preview`}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                          >
                            Preview
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FormInput className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No forms found for this framework</p>
              <Link 
                href={`/protected/compliance/${id}/forms/add`}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Form
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
