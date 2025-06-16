import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import { getUserProfile } from "@/lib/api";
import ProfileForm from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get current user profile for dashboard layout
  const currentUserProfile = await getUserProfile();

  return (
    <DashboardLayout userProfile={currentUserProfile}>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-slate-50 via-blue-50 to-sky-50 rounded-2xl p-8 border border-slate-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-sky-600 p-3 rounded-xl shadow-sm">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Account Settings</p>
              <h1 className="text-3xl font-bold text-slate-800">
                My Profile
              </h1>
              <p className="text-slate-600 mt-1 max-w-2xl">
                Update your personal information and security settings
              </p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Account Active</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.75a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75" />
              </svg>
              <span className="text-sm text-slate-600">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-slate-600">Profile Management</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <ProfileForm user={user} currentUserProfile={currentUserProfile} />
      </div>
    </DashboardLayout>
  );
}
