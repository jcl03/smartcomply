import { getAllUserProfiles } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function UserManagementPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Check if user is admin
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // If not admin or error occurs, redirect to protected page
  if (error || !profile || profile.role !== 'admin') {
    return redirect("/protected");
  }
  
  // Fetch all user profiles for admin
  const allProfiles = await getAllUserProfiles();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">Name</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Last Sign In</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((profile) => (
                  <tr key={profile.id} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3">{profile.full_name}</td>
                    <td className="p-3">{profile.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        profile.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {profile.role}
                      </span>
                    </td>
                    <td className="p-3">{new Date(profile.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {profile.last_sign_in_at 
                        ? new Date(profile.last_sign_in_at).toLocaleDateString()
                        : 'Never'}
                    </td>                    <td className="p-3">
                      <div className="flex gap-2">
                        <a 
                          href={`/protected/user-management/${profile.id}/edit`}
                          className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
