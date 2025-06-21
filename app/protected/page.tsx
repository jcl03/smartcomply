import { 
  getUserProfile, 
  getDashboardData, 
  getAuditorPerformanceData, 
  getComplianceTrendsData,
  getRiskTimelineData,
  getWorkloadData,
  getComplianceHealthData,
  getPerformanceRadarData
} from "@/lib/api";
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
import AuditorPerformanceChart from "@/components/dashboard/auditor-performance-chart";
import ComplianceTrendsChart from "@/components/dashboard/compliance-trends-chart";
import ComplianceSummary from "@/components/dashboard/compliance-summary";
import RiskTimeline from "@/components/dashboard/risk-timeline";
import WorkloadBalance from "@/components/dashboard/workload-balance";
import ComplianceHealthCalendar from "@/components/dashboard/compliance-health-calendar";
import PerformanceRadar from "@/components/dashboard/performance-radar";
import { 
  processAuditorPerformanceData, 
  processComplianceTrendsData, 
  processComplianceSummaryData,
  processRiskTimelineData,
  processWorkloadData,
  processComplianceHealthData,
  processPerformanceRadarData
} from "@/utils/dashboard-utils";
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
  
  if (!userProfile) {
    return redirect("/sign-in");
  }
  // Check user role
  const userRole = userProfile.role;
  const isAdmin = userRole === 'admin';
  const isAuditor = userRole === 'auditor' || userRole === 'user'; // Users are auditors in this system
  const isManager = userRole === 'manager';
  const isRegularUser = userRole === 'user' || (!userRole && !isAdmin && !isManager); // Default role

  // Fetch dashboard data based on role
  const dashboardData = await getDashboardData(userRole, user.id);
  
  // Process data for different visualizations
  const complianceSummaryData = processComplianceSummaryData(
    dashboardData.audits, 
    dashboardData.checklistResponses, 
    dashboardData.compliance
  );

  const complianceTrendsData = processComplianceTrendsData(
    dashboardData.audits, 
    dashboardData.checklistResponses
  );
  // Get auditor performance data (for admin and manager roles)
  let auditorPerformanceData: any[] = [];
  if (isAdmin || isManager) {
    const auditorData = await getAuditorPerformanceData();
    auditorPerformanceData = processAuditorPerformanceData(
      auditorData.auditors,
      auditorData.audits,
      auditorData.checklistResponses
    );
  }

  // Get additional story-driven data
  const riskTimelineRawData = await getRiskTimelineData();
  const riskTimelineData = processRiskTimelineData(
    riskTimelineRawData.audits,
    riskTimelineRawData.userProfiles
  );

  const workloadRawData = await getWorkloadData();
  const workloadData = processWorkloadData(
    workloadRawData.audits,
    workloadRawData.checklistResponses,
    workloadRawData.userProfiles
  );

  const complianceHealthRawData = await getComplianceHealthData();
  const complianceHealthData = processComplianceHealthData(
    complianceHealthRawData.audits,
    complianceHealthRawData.checklistResponses
  );

  const performanceRadarRawData = await getPerformanceRadarData();
  const performanceRadarData = processPerformanceRadarData(
    performanceRadarRawData.auditors,
    performanceRadarRawData.audits
  );

  // Legacy data for existing components
  const { data: frameworksData } = await supabase
    .from('compliance')
    .select('id, name, status, created_at')
    .eq('status', 'active');

  const { data: formsData } = await supabase
    .from('compliance_forms')
    .select('id, name, created_at, compliance_id')
    .order('created_at', { ascending: false });

  const totalFrameworks = frameworksData?.length || 0;
  const totalForms = formsData?.length || 0;
  const recentFormsCount = formsData?.filter(form => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 7);
    return new Date(form.created_at) > dayAgo;
  }).length || 0;
  const complianceScore = Math.round(complianceSummaryData.complianceRate);
  const pendingReviews = complianceSummaryData.pendingAudits;

  const usersData = dashboardData.userProfiles;
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
        </div>

        {/* Role-Specific Dashboard Visualizations */}
        <div className="space-y-8">
          {/* Compliance Summary - Available for all roles */}
          <ComplianceSummary data={complianceSummaryData} userRole={userRole} />          {/* Admin Dashboard - IT Admin Focus */}
          {isAdmin && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                IT Admin Dashboard - Framework & System Management
              </h2>
              
              {/* Framework Management Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">Framework Usage & Performance</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Framework Adoption</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ISO 27001</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '85%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">SOC 2</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '72%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">72%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">GDPR</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '61%'}}></div>
                          </div>
                          <span className="text-sm text-gray-600">61%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Schema Performance</h4>
                    <div className="space-y-3">                      <div className="flex justify-between">
                        <span className="text-sm">Active Templates</span>
                        <span className="font-semibold">{dashboardData.compliance.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Completion Rate</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Schema Updates</span>
                        <span className="font-semibold">12 this month</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">User Feedback Score</span>
                        <span className="font-semibold text-blue-600">4.8/5</span>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">System Health</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Uptime</span>
                        <span className="font-semibold text-green-600">99.9%</span>
                      </div>                      <div className="flex justify-between">
                        <span className="text-sm">Active Users</span>
                        <span className="font-semibold">{dashboardData.userProfiles.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">API Calls/min</span>
                        <span className="font-semibold">145</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Storage Used</span>
                        <span className="font-semibold">2.4 GB</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Configuration & Analytics Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">User Adoption & Template Analytics</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">User Adoption Trends</h4>
                    <ComplianceTrendsChart data={complianceTrendsData} />
                  </Card>
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Template Effectiveness</h4>                    <div className="space-y-4">
                      {dashboardData.compliance.slice(0, 4).map((complianceItem: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium">{complianceItem.name}</div>
                            <div className="text-sm text-gray-600">Active Framework</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">95%</div>
                            <div className="text-xs text-gray-500">Success Rate</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}          {/* Manager Dashboard - Operational Oversight */}
          {isManager && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                Manager Dashboard - Operational Oversight & Team Performance
              </h2>
              
              {/* Team Performance Overview */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">Team Performance & Workload</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <AuditorPerformanceChart 
                    data={auditorPerformanceData} 
                    showDetails={true}
                  />
                  <WorkloadBalance data={workloadData} userRole={userRole} viewType="team" />
                </div>
              </div>

              {/* Audit Pipeline & Compliance Status */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">Audit Pipeline & Compliance Status</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Audit Pipeline</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <div>
                          <div className="font-medium">In Progress</div>
                          <div className="text-sm text-gray-600">Active audits</div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">
                          {dashboardData.audits.filter(a => a.status === 'in_progress').length}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">Scheduled</div>
                          <div className="text-sm text-gray-600">Upcoming audits</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {dashboardData.audits.filter(a => a.status === 'scheduled').length}
                        </div>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div>
                          <div className="font-medium">Overdue</div>
                          <div className="text-sm text-gray-600">Needs attention</div>
                        </div>                        <div className="text-2xl font-bold text-red-600">
                          {dashboardData.audits.filter(a => {
                            return a.status !== 'completed' && new Date(a.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                          }).length}
                        </div>
                      </div>
                    </div>
                  </Card>
                  <ComplianceTrendsChart 
                    data={complianceTrendsData} 
                    timeRange="month"
                  />
                </div>
              </div>

              {/* Risk Management & Health Monitoring */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">Risk Management & Health Monitoring</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <RiskTimeline data={riskTimelineData} userRole={userRole} timeframe="month" />
                  <ComplianceHealthCalendar data={complianceHealthData} userRole={userRole} />
                </div>
              </div>

              {/* Performance Analytics */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">Team Skills & Performance Analysis</h3>
                <PerformanceRadar data={performanceRadarData} userRole={userRole} />
              </div>
            </div>
          )}          {/* Auditor Dashboard - Personal Tasks & Performance */}
          {isAuditor && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                My Auditor Dashboard - Tasks & Performance
              </h2>
              
              {/* Personal Assignment Overview */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">My Assignments & Deadlines</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="p-6 bg-emerald-50 border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-emerald-900">
                          {dashboardData.audits.filter(a => a.user_id === user.id && a.result === 'pass').length}
                        </p>
                        <p className="text-sm text-emerald-600">Completed Audits</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-amber-50 border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-8 w-8 text-amber-600" />
                      <div>
                        <p className="text-2xl font-bold text-amber-900">
                          {dashboardData.audits.filter(a => a.user_id === user.id && a.status === 'in_progress').length}
                        </p>
                        <p className="text-sm text-amber-600">In Progress</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-blue-50 border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">
                          {dashboardData.audits.filter(a => a.user_id === user.id && a.status === 'scheduled').length}
                        </p>
                        <p className="text-sm text-blue-600">Scheduled</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-purple-50 border-purple-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold text-purple-900">
                          {(() => {
                            const userAudits = dashboardData.audits.filter(a => a.user_id === user.id && a.percentage);
                            const avg = userAudits.length > 0 
                              ? userAudits.reduce((sum, a) => sum + a.percentage, 0) / userAudits.length 
                              : 0;
                            return avg.toFixed(0);
                          })()}%
                        </p>
                        <p className="text-sm text-purple-600">Avg Score</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* My Checklist Tasks */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">My Checklist Tasks</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="p-6 bg-emerald-50 border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckSquare className="h-8 w-8 text-emerald-600" />
                      <div>
                        <p className="text-2xl font-bold text-emerald-900">
                          {dashboardData.checklistResponses.filter(r => r.user_id === user.id && r.result === 'pass').length}
                        </p>
                        <p className="text-sm text-emerald-600">Completed</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-amber-50 border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Clock className="h-8 w-8 text-amber-600" />
                      <div>
                        <p className="text-2xl font-bold text-amber-900">
                          {dashboardData.checklistResponses.filter(r => r.user_id === user.id && r.status === 'pending').length}
                        </p>
                        <p className="text-sm text-amber-600">Pending</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-6 bg-blue-50 border-blue-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-900">
                          {(() => {
                            const userResponses = dashboardData.checklistResponses.filter(r => r.user_id === user.id);
                            const passed = userResponses.filter(r => r.result === 'pass').length;
                            const rate = userResponses.length > 0 ? (passed / userResponses.length) * 100 : 0;
                            return rate.toFixed(0);
                          })()}%
                        </p>
                        <p className="text-sm text-blue-600">Success Rate</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Personal Performance Trend */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">My Performance Trend</h3>                <ComplianceTrendsChart 
                  data={complianceTrendsData.filter(d => {
                    return dashboardData.audits.some(audit => {
                      const auditForm = audit.form;
                      if (Array.isArray(auditForm) && auditForm.length > 0) {
                        const compliance = auditForm[0].compliance;
                        if (Array.isArray(compliance) && compliance.length > 0) {
                          return audit.user_id === user.id && compliance[0].name === d.framework;
                        }
                      }
                      return false;
                    });
                  })} 
                  timeRange="week"
                />
              </div>

              {/* My Certificates & Skills */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700">My Certificates & Skills</h3>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Certifications</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                        <div>
                          <div className="font-medium">ISO 27001 Lead Auditor</div>
                          <div className="text-sm text-gray-600">Expires: Dec 2024</div>
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm">Active</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <div className="font-medium">SOC 2 Certified</div>
                          <div className="text-sm text-gray-600">Expires: Mar 2025</div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">Active</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Skill Development</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Audit Efficiency</span>
                          <span className="text-sm text-gray-600">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-emerald-600 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Risk Assessment</span>
                          <span className="text-sm text-gray-600">87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">Documentation</span>
                          <span className="text-sm text-gray-600">95%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-600 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}          {/* Regular User/Auditor Dashboard - Personal Compliance Status */}
          {isRegularUser && !isAdmin && !isManager && !isAuditor && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="bg-sky-100 p-2 rounded-lg">
                  <CheckSquare className="h-6 w-6 text-sky-600" />
                </div>
                My Compliance Dashboard
              </h2>
              
              {/* Personal compliance metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-emerald-50 border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                    <div>
                      <p className="text-2xl font-bold text-emerald-900">
                        {dashboardData.checklistResponses.filter(r => r.user_id === user.id && r.result === 'pass').length}
                      </p>
                      <p className="text-sm text-emerald-600">Completed Tasks</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-amber-50 border-amber-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="h-8 w-8 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-amber-900">
                        {dashboardData.checklistResponses.filter(r => r.user_id === user.id && r.status === 'pending').length}
                      </p>
                      <p className="text-sm text-amber-600">Pending Tasks</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 bg-blue-50 border-blue-200 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {(() => {
                          const userResponses = dashboardData.checklistResponses.filter(r => r.user_id === user.id);
                          const passed = userResponses.filter(r => r.result === 'pass').length;
                          const rate = userResponses.length > 0 ? (passed / userResponses.length) * 100 : 0;
                          return rate.toFixed(0);
                        })()}%
                      </p>
                      <p className="text-sm text-blue-600">Success Rate</p>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Personal upcoming deadlines or tasks */}
              <Card className="bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-sky-600" />
                  My Recent Activity
                </h3>
                <div className="space-y-3">
                  {dashboardData.checklistResponses
                    .filter(r => r.user_id === user.id)
                    .slice(0, 5)
                    .map((response, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-sky-200">
                        <div>
                          <p className="font-medium text-slate-900">Checklist Response</p>
                          <p className="text-sm text-slate-600">
                            {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          response.result === 'pass' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : response.result === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {response.result || response.status}
                        </span>
                      </div>
                    ))}
                  
                  {dashboardData.checklistResponses.filter(r => r.user_id === user.id).length === 0 && (
                    <div className="text-center py-8">
                      <ListChecks className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No recent activity to show</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Main Dashboard Content */}
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
      </div>
    </DashboardLayout>
  );
}
