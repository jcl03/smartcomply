import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield, ArrowLeft, FileText, RotateCcw } from "lucide-react";
import Link from "next/link";
import { reactivateComplianceFramework } from "../actions";

export default async function ComplianceArchivePage() {
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

  // Fetch archived compliance frameworks
  const { data: frameworks, error } = await supabase
    .from('compliance')
    .select('*')
    .eq('status', 'archive')
    .order('name');

  if (error) {
    console.error("Error fetching archived compliance frameworks:", error);
  }

  async function handleReactivate(formData: FormData) {
    "use server";
    const id = parseInt(formData.get("id") as string);
    await reactivateComplianceFramework(id);
    redirect("/protected/compliance/archive");
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
            Back to Active
          </Link>
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Archived Compliance Frameworks</h1>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archived Frameworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {frameworks && frameworks.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Status</th>
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
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Archived
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <form action={handleReactivate} className="inline">
                            <input type="hidden" name="id" value={framework.id} />
                            <button
                              type="submit"
                              className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors flex items-center gap-1"
                            >
                              <RotateCcw size={12} />
                              Reactivate
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
              <p className="text-muted-foreground mb-4">No archived compliance frameworks found</p>
              <Link 
                href="/protected/compliance"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Active Frameworks
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
