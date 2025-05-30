import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { FormInput, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { addForm } from "../../../actions";
import AddFormComponent from "./AddFormComponent";

export default async function AddFormPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link 
          href={`/protected/compliance/${id}/forms`}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <FormInput className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Add Form to {framework.name}</h1>
      </div>
      
      <Card className="max-w-4xl mx-auto w-full">
        <CardHeader>
          <CardTitle>Create Dynamic Form</CardTitle>
        </CardHeader>
        {/* Pass the action and compliance ID as props */}
        <AddFormComponent action={addForm} complianceId={id} />
      </Card>
    </div>
  );
}
