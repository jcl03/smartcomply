import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon, UserIcon, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch user profile data from the view for the current user only
  const userProfile = await getUserProfile();
  
  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          Dashboard
        </div>
      </div>
      
      {isAdmin && (
        <div className="w-full">
          <a 
            href="/protected/user-management"
            className="flex items-center gap-2 p-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Users size="16" />
            Go to User Management
          </a>
        </div>
      )}
      
      {userProfile ? (
        <div className="flex flex-col gap-6">
          <h2 className="font-bold text-2xl">Your Profile</h2>
          <Card className="p-6 border rounded-lg shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{userProfile.full_name}</h3>
                <p className="text-muted-foreground">{userProfile.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{userProfile.role}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {new Date(userProfile.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last sign in</p>
                <p className="font-medium">
                  {userProfile.last_sign_in_at 
                    ? formatDistanceToNow(new Date(userProfile.last_sign_in_at), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col gap-2 items-start">
          <h2 className="font-bold text-2xl mb-4">Your user details</h2>
          <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
