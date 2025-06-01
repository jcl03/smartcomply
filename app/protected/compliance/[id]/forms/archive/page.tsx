import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, FormInput, RotateCcw } from "lucide-react";
import Link from "next/link";
import { activateForm } from "../../../actions";

export default async function FormsArchivePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
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

  // Fetch archived forms for this framework
  const { data: forms, error: formsError } = await supabase
    .from('form')
    .select('*')
    .eq('compliance_id', id)
    .eq('status', 'archive')
    .order('id');

  if (formsError) {
    console.error("Error fetching archived forms:", formsError);
  }

  async function handleActivateForm(formData: FormData) {
    "use server";
    const formId = parseInt(formData.get("id") as string);
    await activateForm(formId);
    redirect(`/protected/compliance/${id}/forms/archive`);
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/protected/compliance/${id}/forms`}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Active Forms
          </Link>
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">{framework.name} - Archived Forms</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FormInput className="h-5 w-5" />
            Archived Forms
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
                    <th className="text-left p-3 font-medium">Status</th>
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Archived
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link 
                            href={`/protected/compliance/${id}/forms/${form.id}/preview`}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                          >
                            Preview
                          </Link>
                          <form action={handleActivateForm} className="inline">
                            <input type="hidden" name="id" value={form.id} />
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw size={12} />
                              Activate
                            </button>
                          </form>
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
              <p className="text-muted-foreground mb-4">No archived forms found</p>
              <Link 
                href={`/protected/compliance/${id}/forms`}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Active Forms
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
