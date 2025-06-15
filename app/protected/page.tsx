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
  AlertTriangle,
  CheckSquare, 
  ListChecks
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
      <div className="space-y-8 p-6">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-blue-50 rounded-3xl border border-slate-200/50 shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-sky-500/5 to-indigo-600/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-sky-400/10 to-blue-600/10 rounded-full -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-sky-500/10 rounded-full translate-y-40 -translate-x-40"></div>
          
          <div className="relative z-10 p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Dashboard Overview</p>
                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Welcome back, {userProfile?.full_name || 'User'}!
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-slate-600 max-w-2xl">
                  Here's your compliance management overview. Monitor frameworks, track progress, and ensure regulatory excellence.
                </p>
                
                <div className="flex items-center gap-6 pt-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>System Operational</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Shield className="h-4 w-4" />
                    <span>Compliance Score: {complianceScore}%</span>
                  </div>
                </div>
              </div>
              
              <div className="lg:text-right">
                <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-lg">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Your Role</p>
                    <p className="text-lg font-bold text-slate-800">{userProfile?.role || 'Member'}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Frameworks */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/20 to-green-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-emerald-900">{totalFrameworks}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">Active Frameworks</h3>
              <p className="text-emerald-600 text-sm flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {totalFrameworks > 0 ? `${totalFrameworks} active` : 'Start building'}
              </p>
            </div>
          </Card>

          {/* Total Forms */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-sky-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-900">{totalForms}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-blue-700 uppercase tracking-wider mb-1">Total Forms</h3>
              <p className="text-blue-600 text-sm flex items-center gap-1">
                <ArrowUpRight className="h-4 w-4" />
                +{recentFormsCount} this week
              </p>
            </div>
          </Card>

          {/* Compliance Score */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-purple-900">{complianceScore}%</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-purple-700 uppercase tracking-wider mb-1">Compliance Score</h3>
              <p className="text-purple-600 text-sm flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                Excellent rating
              </p>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-amber-900">{pendingReviews}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">Recent Activity</h3>
              <p className="text-amber-600 text-sm flex items-center gap-1">
                <Activity className="h-4 w-4" />
                Items this month
              </p>
            </div>
          </Card>
        </div>        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Frameworks Overview */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Active Frameworks</h3>
                      <p className="text-slate-300 text-sm">Compliance management overview</p>
                    </div>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
                    {totalFrameworks} Active
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {frameworksData && frameworksData.length > 0 ? (
                    frameworksData.slice(0, 5).map((framework, index) => (
                      <div key={framework.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-sky-50 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:from-sky-200 group-hover:to-blue-200 transition-all duration-300">
                            <span className="text-sky-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 group-hover:text-sky-900 transition-colors">{framework.name}</h4>
                            <p className="text-sm text-slate-500">
                              Created {formatDistanceToNow(new Date(framework.created_at), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            {framework.status}
                          </span>
                          <Link 
                            href={`/protected/compliance/${framework.id}`}
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all duration-200"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="bg-gradient-to-br from-slate-100 to-sky-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-10 w-10 text-slate-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-700 mb-2">No Frameworks Yet</h4>
                      <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                        Start building your compliance foundation by creating your first framework.
                      </p>
                      <Link 
                        href="/protected/compliance"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Shield className="h-4 w-4" />
                        Create Framework
                      </Link>
                    </div>
                  )}
                  {frameworksData && frameworksData.length > 5 && (
                    <div className="text-center pt-4 border-t border-slate-200">
                      <Link 
                        href="/protected/compliance"
                        className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center justify-center gap-2"
                      >
                        View all {frameworksData.length} frameworks
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Summary */}
            {userProfile && (
              <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Profile Summary</h3>
                        <p className="text-sky-100 text-sm">Your account details</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">Role</span>
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 rounded-lg text-sm font-semibold border border-sky-200">
                      <Users className="h-3 w-3" />
                      {userProfile.role}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">Member since</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {new Date(userProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-sm font-medium text-slate-700">Last active</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {userProfile.last_sign_in_at 
                        ? formatDistanceToNow(new Date(userProfile.last_sign_in_at), { addSuffix: true })
                        : 'Never'}
                    </span>
                  </div>
                  
                  {isAdmin && usersData && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <span className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Admin: Total Users
                        </span>
                        <span className="text-lg font-bold text-emerald-900">
                          {usersData.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Target className="h-5 w-5 text-indigo-600" />
                  </div>
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/protected/compliance"
                    className="group flex items-center gap-3 p-3 bg-white/80 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-slate-200"
                  >
                    <div className="bg-sky-100 p-2 rounded-lg group-hover:bg-sky-200 transition-colors">
                      <Shield className="h-4 w-4 text-sky-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Manage Compliance
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600" />
                  </Link>
                  
                  {isAdmin && (
                    <Link 
                      href="/protected/user-management"
                      className="group flex items-center gap-3 p-3 bg-white/80 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-slate-200"
                    >
                      <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                        <Users className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        User Management
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600" />
                    </Link>
                  )}
                  
                  <Link 
                    href="/protected/reports"
                    className="group flex items-center gap-3 p-3 bg-white/80 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 border border-slate-200"
                  >
                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      View Reports
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 ml-auto group-hover:text-slate-600" />
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom Section - Only visible to admins */}
        {isAdmin && (
          <Card className="bg-white/80 backdrop-blur-sm border-sky-200 rounded-xl shadow-md p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h3 className="text-lg lg:text-xl font-semibold text-sky-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Overview
              </h3>
              <Link href="/protected/user-management" className="text-sm text-sky-600 hover:text-sky-800 font-medium">
                Manage Team
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/*
                { name: "Alex Johnson", role: "Security Officer", status: "active" },
                { name: "Sam Wilson", role: "Compliance Manager", status: "active" },
                { name: "Robin Chen", role: "Risk Analyst", status: "away" },
                { name: "Taylor Morgan", role: "Auditor", status: "inactive" }
              */}
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="p-3 lg:p-4 rounded-lg bg-sky-50/30 border border-sky-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index % 2 === 0 ? 'bg-green-500' :
                      index % 3 === 0 ? 'bg-amber-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-sky-900">Member Name</p>
                      <p className="text-xs text-sky-600">Member Role</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
