import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import { DocumentsClientWrapper } from "@/components/documents/documents-client-wrapper";

async function DocumentsContent() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  // Get user profile with role information  
  const { data: profile } = await supabase
    .from('view_user_profiles')
    .select('role')
    .eq('email', user.email)
    .single();
    
  // Only allow managers to access this page
  if (!profile || profile.role !== 'manager') {
    return redirect("/protected");
  }

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <DocumentsClientWrapper />
    </DashboardLayout>
  );
}

export default function DocumentsPage() {
  return <DocumentsContent />;
}
