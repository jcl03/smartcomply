import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, Plus, FileText, Archive } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import { archiveComplianceFramework } from "./actions";

export default async function CompliancePage() {
  const supabase = await createClient();
  
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

  // Fetch compliance frameworks (only active ones)
  const { data: frameworks, error } = await supabase
    .from('compliance')
    .select('*')
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error("Error fetching compliance frameworks:", error);
  }

  async function handleArchive(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    await archiveComplianceFramework(id);
    redirect("/protected/compliance");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Compliance Frameworks</h1>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/protected/compliance/archive"
            className="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <Archive size={16} className="mr-2" />
            View Archive
          </Link>
          <Link 
            href="/protected/compliance/add"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            Add Framework
          </Link>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Active Frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {frameworks && frameworks.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Forms</th>
                    <th className="text-left p-3 font-medium">Checklists</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {frameworks.map((framework) => (
                    <tr key={framework.id} className="border-t hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium">{framework.name}</div>
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>                      <td className="p-3">
                        <Link 
                          href={`/protected/compliance/${framework.id}/forms`}
                          className="text-primary hover:underline"
                        >
                          View Forms
                        </Link>
                      </td>
                      <td className="p-3">
                        <Link 
                          href={`/protected/compliance/${framework.id}/checklists`}
                          className="text-primary hover:underline"
                        >
                          View Checklists
                        </Link>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Link 
                            href={`/protected/compliance/${framework.id}/edit`}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                          >
                            Edit
                          </Link>                          <Link 
                            href={`/protected/compliance/${framework.id}/forms/add`}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                          >
                            Add Form
                          </Link>
                          <Link 
                            href={`/protected/compliance/${framework.id}/checklists/add`}
                            className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80 transition-colors"
                          >
                            Add Checklist
                          </Link>
                          <form action={handleArchive} className="inline">
                            <input type="hidden" name="id" value={framework.id} />
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded hover:bg-orange-200 transition-colors"
                            >
                              Archive
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
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No active compliance frameworks found</p>
              <Link 
                href="/protected/compliance/add"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Create Your First Framework
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
