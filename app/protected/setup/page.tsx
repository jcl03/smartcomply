import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import SetupProfileForm from "@/components/user-management/setup-profile-form";

export default async function SetupPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    // If not authenticated, redirect to sign in
    redirect("/sign-in");
  }

  // Get the user's profile
  const { data: profile } = await supabase
    .from("view_user_profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Complete Your Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome to SmartComply! Please set up your account to continue.
          </p>
        </div>

        <SetupProfileForm user={session.user} profile={profile} />
      </div>
    </div>
  );
}