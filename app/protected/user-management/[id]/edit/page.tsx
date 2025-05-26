import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCog, Mail, AlertCircle, Shield } from "lucide-react";
import Link from "next/link";
import { isUserAdmin } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import UpdateEmailForm from "./UpdateEmailForm";
import UpdateRoleForm from "./UpdateRoleForm";
import RevokeAccessForm from "./RevokeAccessForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  // Check if the current user is an admin
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    redirect("/protected");
  }
  
  const { id } = await params;
  const userId = id;
  const supabase = await createClient();
    // Get current user to check if they're editing their own account
  const { data: { user } } = await supabase.auth.getUser();
  let isCurrentUser = false;
  
  if (user) {
    // Get current user's profile ID
    const { data: currentUserProfile } = await supabase
      .from('view_user_profiles')
      .select('id')
      .eq('email', user.email)      .single();
      
    // Check if the user is editing their own account (ensure string comparison)
    if (currentUserProfile && String(currentUserProfile.id) === String(userId)) {
      isCurrentUser = true;    }
  }
    // Get user profile
  const { data: profile, error } = await supabase
    .from('view_user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error || !profile) {
    redirect("/protected/user-management");
  }  // Check if user access is revoked by looking up their auth record
  let isRevoked = false;
  let authUserId: string | null = null;
  
  try {
    const adminClient = createAdminClient();
    
    // First get the auth user ID by finding the user with matching email
    const { data: authUsers, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (!authError && authUsers) {
      const authUser = authUsers.users.find(u => u.email === profile.email);
      if (authUser) {
        authUserId = authUser.id;
        
        // Now get fresh user data directly by ID to avoid caching issues
        const { data: freshUserData, error: userError } = await adminClient.auth.admin.getUserById(authUser.id);
        
        if (!userError && freshUserData) {
          // Check if user access is revoked based on metadata
          isRevoked = freshUserData.user.user_metadata?.revoked === true;
          console.log(`Checking revocation status for ${profile.email} (using getUserById):`, {
            isRevoked,
            metadata: freshUserData.user.user_metadata
          });
        } else {
          console.error("Error getting fresh user data:", userError);
          // Fallback to listUsers data
          isRevoked = authUser.user_metadata?.revoked === true;
          console.log(`Fallback revocation check for ${profile.email}:`, {
            isRevoked,
            metadata: authUser.user_metadata
          });
        }
      }
    }
  } catch (err) {
    console.error("Error checking revocation status:", err);
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
          {isCurrentUser ? (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">You cannot change your own role</p>
                <p className="text-sm mt-1">For security reasons, administrators cannot modify their own role.</p>
              </div>
            </div>
          ) : (
            <UpdateRoleForm userId={profile.id} currentRole={profile.role} />
          )}
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

      {!isCurrentUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <CardTitle>Account Access Control</CardTitle>
            </div>
          </CardHeader>
          <CardContent>            <RevokeAccessForm 
              userId={profile.id} 
              userEmail={profile.email}
              isRevoked={isRevoked}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
