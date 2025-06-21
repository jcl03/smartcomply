'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Shield
} from 'lucide-react';

interface ComplianceSummaryData {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  overdueAudits: number;
  passedAudits: number;
  failedAudits: number;
  averageScore: number;
  complianceRate: number;
  pendingCorrectiveActions: number;
  frameworkBreakdown: Array<{
    name: string;
    completed: number;
    total: number;
    percentage: number;
  }>;
  recentTrend: 'up' | 'down' | 'stable';
  trendPercentage: number;
}

interface ComplianceSummaryProps {
  data: ComplianceSummaryData;
  userRole: string;
}

const PIE_COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ComplianceSummary({ data, userRole }: ComplianceSummaryProps) {
  const pieData = [
    { name: 'Passed', value: data.passedAudits, color: '#10b981' },
    { name: 'Pending', value: data.pendingAudits, color: '#f59e0b' },
    { name: 'Failed', value: data.failedAudits, color: '#ef4444' },
    { name: 'Overdue', value: data.overdueAudits, color: '#8b5cf6' },
  ].filter(item => item.value > 0);

  const getTrendIcon = () => {
    switch (data.recentTrend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-emerald-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-slate-600" />;
    }
  };

  const getTrendColor = () => {
    switch (data.recentTrend) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-slate-600';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'bg-blue-50 border-blue-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Completion Rate */}
        <Card className={`p-6 ${getScoreBgColor(data.complianceRate)} border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/80 p-3 rounded-xl shadow-sm">
              <Target className={`h-6 w-6 ${getScoreColor(data.complianceRate)}`} />
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getScoreColor(data.complianceRate)}`}>
                {data.complianceRate.toFixed(1)}%
              </p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Compliance Rate
          </h3>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {data.trendPercentage > 0 ? '+' : ''}{data.trendPercentage.toFixed(1)}% from last period
            </span>
          </div>
        </Card>

        {/* Completed Audits */}
        <Card className="p-6 bg-emerald-50 border-emerald-200 border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl shadow-sm">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-900">{data.completedAudits}</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-1">
            Completed Audits
          </h3>
          <p className="text-emerald-600 text-sm">
            {data.totalAudits > 0 ? `${((data.completedAudits / data.totalAudits) * 100).toFixed(0)}% of total` : 'No audits yet'}
          </p>
        </Card>

        {/* Pending Corrective Actions */}
        <Card className="p-6 bg-amber-50 border-amber-200 border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-100 p-3 rounded-xl shadow-sm">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-900">{data.pendingCorrectiveActions}</p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-1">
            Pending Actions
          </h3>
          <p className="text-amber-600 text-sm">
            Corrective actions needed
          </p>
        </Card>

        {/* Average Score */}
        <Card className={`p-6 ${getScoreBgColor(data.averageScore)} border-2 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/80 p-3 rounded-xl shadow-sm">
              <Shield className={`h-6 w-6 ${getScoreColor(data.averageScore)}`} />
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getScoreColor(data.averageScore)}`}>
                {data.averageScore.toFixed(0)}%
              </p>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Average Score
          </h3>
          <p className="text-slate-600 text-sm">
            Across all audits
          </p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Status Distribution */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              Audit Status Distribution
            </h3>
          </div>
          
          <div className="p-6">
            {pieData.length > 0 ? (
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-full lg:w-1/2 space-y-3">
                  {pieData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No audit data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Framework Progress */}
        <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              Framework Progress
            </h3>
          </div>
          
          <div className="p-6">
            {data.frameworkBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.frameworkBreakdown}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}%`, 
                      'Completion Rate'
                    ]}
                    labelFormatter={(name) => `Framework: ${name}`}
                  />
                  <Bar 
                    dataKey="percentage" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No framework data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Role-specific Info */}
      {userRole === 'admin' && (
        <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Administrative Overview</h3>
              <p className="text-slate-600">System-wide compliance insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Total Frameworks</p>
              <p className="text-2xl font-bold text-slate-900">{data.frameworkBreakdown.length}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Overdue Items</p>
              <p className="text-2xl font-bold text-red-600">{data.overdueAudits}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600 mb-1">System Health</p>
              <p className={`text-2xl font-bold ${data.complianceRate >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {data.complianceRate >= 80 ? 'Good' : 'Attention Needed'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
