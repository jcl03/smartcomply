import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckSquare, Check, X } from "lucide-react";
import Link from "next/link";

export default async function PreviewChecklistPage({ params }: { params: Promise<{ id: string; checklistId: string }> }) {
  const supabase = await createClient();
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

  // Fetch compliance framework
  const { data: framework, error: frameworkError } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', id)
    .single();

  if (frameworkError || !framework) {
    return redirect("/protected/compliance");
  }

  // Fetch the specific checklist
  const { data: checklist, error: checklistError } = await supabase
    .from('checklist')
    .select('*')
    .eq('id', checklistId)
    .eq('compliance_id', id)
    .single();

  if (checklistError || !checklist) {
    return redirect(`/protected/compliance/${id}/checklists`);
  }

  const checklistSchema = checklist.checklist_schema;

  // Group items by category if they have categories
  const groupedItems = checklistSchema?.items?.reduce((acc: any, item: any) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {}) || {};

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link 
          href={`/protected/compliance/${id}/checklists`}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Checklists
        </Link>
        <CheckSquare className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Preview Checklist #{checklistId} - {framework.name}</h1>
      </div>

      <div className="flex gap-2">
        <Link 
          href={`/protected/compliance/${id}/checklists/${checklistId}/edit`}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Edit Checklist
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {checklistSchema?.title || `Checklist #${checklistId}`}
          </CardTitle>
          {checklistSchema?.description && (
            <p className="text-muted-foreground">{checklistSchema.description}</p>
          )}
        </CardHeader>
        <CardContent>
          {Object.keys(groupedItems).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedItems).map(([category, items]: [string, any]) => (
                <div key={category} className="space-y-3">
                  <h3 className="text-lg font-medium text-primary border-b pb-2">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {(items as any[]).map((item, index) => (
                      <div 
                        key={item.id || index} 
                        className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-5 h-5 border-2 border-muted-foreground rounded flex items-center justify-center">
                            {/* Empty checkbox for preview */}
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.text}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.required ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                <X size={12} />
                                Required
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                <Check size={12} />
                                Optional
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No checklist items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Raw JSON Schema Card */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Schema (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm font-mono">
            {JSON.stringify(checklistSchema, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
