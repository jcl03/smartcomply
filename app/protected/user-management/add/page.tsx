import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { inviteUser } from "../actions";
import AddUserForm from "./AddUserForm";

export default async function AddUserPage() {
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
  
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Invite New User</h1>
      </div>
      
      <Card className="max-w-md mx-auto w-full">
        <CardHeader>
          <CardTitle>Invite User</CardTitle>
        </CardHeader>
        {/* Pass the action as a prop */}
        <AddUserForm action={inviteUser} />
      </Card>
    </div>
  );
}
