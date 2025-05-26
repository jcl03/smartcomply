import { getAllUserProfilesWithRevocationStatus } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { Shield, Users, Ban } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ResendActivationButton from "./ResendActivationButton";

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
  }    // Fetch all user profiles for admin
  const allProfiles = await getAllUserProfilesWithRevocationStatus();

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <a 
          href="/protected/user-management/add"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add User
        </a>
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
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-left p-3 font-medium">Last Sign In</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map((profile) => (
                  <tr key={profile.id} className={`border-t hover:bg-muted/50 transition-colors ${profile.isRevoked ? 'bg-red-50' : ''}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {profile.full_name}
                        {profile.isRevoked && (
                          <Ban className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">{profile.email}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        profile.role === 'admin' 
                          ? 'bg-primary/10 text-primary' 
                          : profile.role === 'manager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {profile.role}                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        profile.isRevoked 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {profile.isRevoked ? 'Revoked' : 'Active'}
                      </span>
                    </td>
                    <td className="p-3">{new Date(profile.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      {profile.last_sign_in_at 
                        ? new Date(profile.last_sign_in_at).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <a 
                          href={`/protected/user-management/${profile.id}/edit`}
                          className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
                        >
                          Edit
                        </a>
                        {!profile.last_sign_in_at && (
                          <ResendActivationButton email={profile.email} />
                        )}
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
