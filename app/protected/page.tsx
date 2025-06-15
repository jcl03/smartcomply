import { getUserProfile } from "@/lib/api";
import { createClient } from "@/utils/supabase/server";
import { 
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Calendar,
  Activity,
  ArrowUpRight,
  Target,
  Shield,
  Users,
  AlertTriangle
} from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Link from "next/link";

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

  // Fetch real-time data from the system
  
  // 1. Get compliance frameworks count
  const { data: frameworksData, error: frameworksError } = await supabase
    .from('compliance')
    .select('id, name, status, created_at')
    .eq('status', 'active');

  // 2. Get total forms count across all frameworks
  const { data: formsData, error: formsError } = await supabase
    .from('compliance_forms')
    .select('id, name, created_at, compliance_id')
    .order('created_at', { ascending: false });

  // 3. Get recent user activities (if you have an audit/activity table)
  // For now, we'll use the most recent form submissions or updates
  const { data: recentFormsData } = await supabase
    .from('compliance_forms')
    .select('id, name, created_at, compliance(name)')
    .order('created_at', { ascending: false })
    .limit(5);

  // 4. Get user management data (for admin users)
  let usersData = null;
  if (isAdmin) {
    const { data: userData } = await supabase
      .from('view_user_profiles')
      .select('id, full_name, email, role, created_at, last_sign_in_at')
      .order('created_at', { ascending: false });
    usersData = userData;
  }

  // 5. Calculate dynamic metrics
  const totalFrameworks = frameworksData?.length || 0;
  const totalForms = formsData?.length || 0;
  const recentFormsCount = formsData?.filter(form => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 7);
    return new Date(form.created_at) > dayAgo;
  }).length || 0;

  // Calculate compliance score (example calculation)
  const complianceScore = Math.round((totalFrameworks > 0 ? (totalForms / totalFrameworks) * 20 + 74 : 85));
  
  // Get pending reviews (forms created in last 30 days that might need review)
  const pendingReviews = formsData?.filter(form => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(form.created_at) > thirtyDaysAgo;
  }).length || 0;
  
  return (
    <DashboardLayout userProfile={userProfile}>
      {/* Dashboard Overview */}
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-sm border border-sky-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sky-900">
                Welcome back, {userProfile?.full_name || 'User'}!
              </h1>
              <p className="text-sky-600 mt-1">Here's what's happening with your compliance today.</p>
            </div>
            <div className="bg-sky-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </div>        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 p-4 lg:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sky-700 truncate">Active Frameworks</p>
                <p className="text-2xl lg:text-3xl font-bold text-sky-900 mt-1 lg:mt-2">{totalFrameworks}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {totalFrameworks > 0 ? `${totalFrameworks} active` : 'Start building'}
                  </span>
                </p>
              </div>
              <div className="bg-sky-100 p-2 lg:p-3 rounded-full group-hover:bg-sky-200 transition-colors flex-shrink-0 ml-2">
                <Shield className="h-5 w-5 lg:h-6 lg:w-6 text-sky-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 p-4 lg:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sky-700 truncate">Total Forms</p>
                <p className="text-2xl lg:text-3xl font-bold text-sky-900 mt-1 lg:mt-2">{totalForms}</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">+{recentFormsCount} this week</span>
                </p>
              </div>
              <div className="bg-emerald-100 p-2 lg:p-3 rounded-full group-hover:bg-emerald-200 transition-colors flex-shrink-0 ml-2">
                <FileText className="h-5 w-5 lg:h-6 lg:w-6 text-emerald-600" />
              </div>
            </div>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 p-4 lg:p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-sky-700 truncate">Recent Activity</p>
                <p className="text-2xl lg:text-3xl font-bold text-sky-900 mt-1 lg:mt-2">{pendingReviews}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">Items this month</span>
                </p>
              </div>
              <div className="bg-amber-100 p-2 lg:p-3 rounded-full group-hover:bg-amber-200 transition-colors flex-shrink-0 ml-2">
                <Clock className="h-5 w-5 lg:h-6 lg:w-6 text-amber-600" />
              </div>
            </div>          </Card>
        </div>        {/* Main Dashboard Content */}
        <div className="space-y-6">
          {/* Compliance Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-sky-900 mb-4">Active Frameworks</h3>
            <div className="space-y-3 lg:space-y-4">
              {frameworksData && frameworksData.length > 0 ? (
                frameworksData.slice(0, 4).map((framework) => (
                  <div key={framework.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-sky-700 truncate">{framework.name}</span>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                      {framework.status}
                    </span>
                  </div>
                ))
              ) : (                <div className="text-center py-4">
                  <p className="text-sm text-sky-600 mb-2">No frameworks yet</p>
                  <Link 
                    href="/protected/compliance/checklists/add"
                    className="text-xs text-sky-500 hover:text-sky-700 underline"
                  >
                    Create your first framework
                  </Link>
                </div>
              )}
              {frameworksData && frameworksData.length > 4 && (
                <div className="text-center pt-2">
                  <span className="text-xs text-sky-500">
                    +{frameworksData.length - 4} more frameworks
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* User Profile Summary */}
          {userProfile && (
            <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-sky-900 mb-4">Profile Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-sky-700 truncate">Role</span>
                  <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full flex-shrink-0">
                    {userProfile.role}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-sky-700 truncate">Member since</span>
                  <span className="text-sm text-sky-900 flex-shrink-0">
                    {new Date(userProfile.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-sky-700 truncate">Last active</span>
                  <span className="text-sm text-sky-900 flex-shrink-0">
                    {userProfile.last_sign_in_at 
                      ? formatDistanceToNow(new Date(userProfile.last_sign_in_at), { addSuffix: true })
                      : 'Never'}
                  </span>
                </div>
                {isAdmin && usersData && (
                  <div className="flex justify-between items-center gap-2 pt-2 border-t border-sky-200">
                    <span className="text-sm text-sky-700 truncate">Total Users</span>
                    <span className="text-sm text-sky-900 flex-shrink-0">
                      {usersData.length}
                    </span>
                  </div>
                )}
              </div>
            </Card>          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
