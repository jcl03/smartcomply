import { createClient } from "@/utils/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";

export default async function DebugPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get current user profile
  const profile = await getCurrentUserProfile();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug User Profile</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">User Email:</h2>
          <p>{user?.email || 'No user'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Profile Data:</h2>
          <pre className="whitespace-pre-wrap">{JSON.stringify(profile, null, 2)}</pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Role Check:</h2>
          <p>Role: {profile?.role}</p>
          <p>Is Admin: {profile?.role === 'admin' ? 'Yes' : 'No'}</p>
          <p>Is Manager: {profile?.role === 'manager' ? 'Yes' : 'No'}</p>
          <p>Is Admin or Manager: {['admin', 'manager'].includes(profile?.role || '') ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold">Tenant Info:</h2>
          <p>Tenant ID: {profile?.tenant_id || 'No tenant'}</p>
          <p>Tenant Name: {profile?.tenant_name || 'No tenant name'}</p>
        </div>
      </div>
    </div>
  );
}
