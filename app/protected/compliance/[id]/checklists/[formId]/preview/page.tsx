import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckSquare, ArrowLeft, Eye } from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ChecklistPreview } from "@/components/checklist/checklist-preview";

export default async function PreviewChecklistPage({ 
  params 
}: { 
  params: Promise<{ id: string; checklistId: string }> 
}) {  const supabase = await createClient();
  const { id, checklistId } = await params;
  
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
  // Fetch the checklist (only if active)
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', id)
    .eq('status', 'active')
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }

  const checklistSchema = checklist.checklist_schema || {};  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            href={`/protected/compliance/${id}/checklists`}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Checklists
          </Link>
          <Eye className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Preview Checklist #{checklist.id}</h1>
        </div>
        <Link 
          href={`/protected/compliance/${id}/checklists/${checklistId}/edit`}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Edit Checklist
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checklist Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Checklist Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <ChecklistPreview schema={checklistSchema} />
              
              <div className="pt-4">
                <button 
                  type="button"
                  className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  disabled
                >
                  Submit Checklist (Preview Only)
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Schema Information */}
        <Card>
          <CardHeader>
            <CardTitle>Checklist Schema (JSON)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Framework</Label>
                <p className="font-medium">{framework.name}</p>
              </div>
              
              <div>
                <Label>Checklist ID</Label>
                <p className="font-medium">#{checklist.id}</p>
              </div>
              
              <div>
                <Label>Created</Label>
                <p className="font-medium">{new Date(checklist.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <Label>Items Count</Label>
                <p className="font-medium">{checklistSchema.items?.length || 0} items</p>
              </div>
              
              <div>
                <Label>Schema Structure</Label>
                <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96">
                  {JSON.stringify(checklistSchema, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
