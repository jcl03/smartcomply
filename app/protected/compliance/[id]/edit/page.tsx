import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditComplianceForm from "./EditComplianceForm";

export default async function EditCompliancePage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;

  // Fetch the compliance framework
  const { data: framework, error } = await supabase
    .from('compliance')
    .select('*')
    .eq('id', parseInt(id))
    .single();

  if (error || !framework) {
    return redirect("/protected/compliance");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Edit Compliance Framework</h1>
        </div>
        <Link 
          href="/protected/compliance"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Frameworks
        </Link>
      </div>
      
      <Card className="max-w-md mx-auto w-full">
        <CardHeader>
          <CardTitle>Edit Framework</CardTitle>
        </CardHeader>
        <EditComplianceForm framework={framework} />
      </Card>
    </div>
  );
}