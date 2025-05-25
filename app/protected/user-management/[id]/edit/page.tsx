import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCog, Mail } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import UpdateRoleForm from "./UpdateRoleForm";
import UpdateEmailForm from "./UpdateEmailForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const { id: userId } = await params;
  const supabase = await createClient();
    // Get user profile
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error || !profile) {
    redirect("/protected/user-management");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>
        <Link 
          href="/protected/user-management"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <Label>Member since</Label>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Last sign in</Label>
              <p className="font-medium">
                {profile.last_sign_in_at 
                  ? new Date(profile.last_sign_in_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        <Card>
        <CardHeader>
          <CardTitle>Update Role</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdateRoleForm userId={profile.id} currentRole={profile.role} />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Update Email</CardTitle>
          </div>
        </CardHeader>
        <UpdateEmailForm userId={profile.id} currentEmail={profile.email} />
      </Card>
    </div>
  );
}
