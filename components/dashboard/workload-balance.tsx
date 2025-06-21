'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from '@/components/ui/card';
import { Users, TrendingUp, AlertTriangle, BarChart3, Clock } from 'lucide-react';

interface WorkloadData {
  period: string;
  auditor: string;
  audits: number;
  checklists: number;
  certifications: number;
  totalHours: number;
  capacity: number;
  utilization: number;
  overtime: number;
}

interface WorkloadBalanceProps {
  data: WorkloadData[];
  userRole: string;
  viewType?: 'team' | 'individual';
}

const WORKLOAD_COLORS = {
  audits: '#3b82f6',      // blue
  checklists: '#10b981',  // emerald
  certifications: '#8b5cf6', // purple
  overtime: '#ef4444',    // red
};

export default function WorkloadBalance({ data, userRole, viewType = 'team' }: WorkloadBalanceProps) {
  // Process data for team view (stacked by person) or individual view (stacked by task type)
  const processedData = viewType === 'team' 
    ? processTeamData(data)
    : processIndividualData(data);

  // Calculate insights
  const overloadedMembers = data.filter(d => d.utilization > 100).length;
  const underutilizedMembers = data.filter(d => d.utilization < 60).length;
  const avgUtilization = data.reduce((sum, d) => sum + d.utilization, 0) / data.length || 0;
  const totalOvertime = data.reduce((sum, d) => sum + d.overtime, 0);
  
  // Identify bottlenecks
  const bottleneckAnalysis = analyzeBottlenecks(data);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span> {entry.value}
                {entry.dataKey === 'utilization' && '%'}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-500/10 to-emerald-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Workload Balance</h3>
              <p className="text-slate-300 text-sm">Resource allocation and capacity analysis</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {avgUtilization.toFixed(0)}% Avg Utilization
          </div>
        </div>
      </div>

      {/* Insights Cards */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{overloadedMembers}</p>
                <p className="text-sm text-red-600">Overloaded</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900">{underutilizedMembers}</p>
                <p className="text-sm text-amber-600">Under-utilized</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{avgUtilization.toFixed(0)}%</p>
                <p className="text-sm text-blue-600">Avg Utilization</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{totalOvertime}</p>
                <p className="text-sm text-purple-600">Overtime Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="p-6">
        <div className="space-y-8">
          {/* Workload Distribution Chart */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">
              {viewType === 'team' ? 'Team Workload Distribution' : 'Task Distribution Over Time'}
            </h4>
            
            {processedData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="period" 
                    stroke="#64748b"
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="audits"
                    stackId="1"
                    stroke={WORKLOAD_COLORS.audits}
                    fill={WORKLOAD_COLORS.audits}
                    fillOpacity={0.8}
                    name="Audits"
                  />
                  <Area
                    type="monotone"
                    dataKey="checklists"
                    stackId="1"
                    stroke={WORKLOAD_COLORS.checklists}
                    fill={WORKLOAD_COLORS.checklists}
                    fillOpacity={0.8}
                    name="Checklists"
                  />
                  <Area
                    type="monotone"
                    dataKey="certifications"
                    stackId="1"
                    stroke={WORKLOAD_COLORS.certifications}
                    fill={WORKLOAD_COLORS.certifications}
                    fillOpacity={0.8}
                    name="Certifications"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No workload data available</p>
              </div>
            )}
          </div>

          {/* Utilization vs Capacity */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Utilization vs Capacity</h4>
            
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="auditor" 
                    stroke="#64748b"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'Utilization' ? '%' : ' hrs'}`, 
                      name
                    ]}
                  />
                  <Legend />
                  <Bar 
                    dataKey="capacity" 
                    fill="#e2e8f0" 
                    name="Capacity"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="totalHours" 
                    fill="#3b82f6" 
                    name="Actual Hours"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="overtime" 
                    fill="#ef4444" 
                    name="Overtime"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No utilization data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottleneck Analysis */}
        {bottleneckAnalysis.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-amber-900 mb-3">Bottleneck Analysis</h4>
                <div className="space-y-2">
                  {bottleneckAnalysis.map((issue, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-amber-800">
                      <span className="font-medium text-amber-900">•</span>
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-blue-900 mb-3">Optimization Recommendations</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-medium text-blue-900 mb-1">Resource Reallocation:</p>
                  <p>Consider redistributing tasks from overloaded to under-utilized team members</p>
                </div>
                <div>
                  <p className="font-medium text-blue-900 mb-1">Capacity Planning:</p>
                  <p>Plan for {Math.ceil(avgUtilization)}% average utilization in future sprints</p>
                </div>
                {totalOvertime > 0 && (
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Overtime Reduction:</p>
                    <p>Focus on reducing {totalOvertime} overtime hours through better planning</p>
                  </div>
                )}
                <div>
                  <p className="font-medium text-blue-900 mb-1">Skill Development:</p>
                  <p>Consider cross-training to increase flexibility in task assignment</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function processTeamData(data: WorkloadData[]) {
  const periods = Array.from(new Set(data.map(d => d.period)));
  
  return periods.map(period => {
    const periodData = data.filter(d => d.period === period);
    return {
      period,
      audits: periodData.reduce((sum, d) => sum + d.audits, 0),
      checklists: periodData.reduce((sum, d) => sum + d.checklists, 0),
      certifications: periodData.reduce((sum, d) => sum + d.certifications, 0),
      totalHours: periodData.reduce((sum, d) => sum + d.totalHours, 0),
      utilization: periodData.reduce((sum, d) => sum + d.utilization, 0) / periodData.length,
    };
  });
}

function processIndividualData(data: WorkloadData[]) {
  // For individual view, group by auditor
  const auditors = Array.from(new Set(data.map(d => d.auditor)));
  
  return auditors.map(auditor => {
    const auditorData = data.filter(d => d.auditor === auditor);
    const totalData = auditorData.reduce((acc, d) => ({
      audits: acc.audits + d.audits,
      checklists: acc.checklists + d.checklists,
      certifications: acc.certifications + d.certifications,
      totalHours: acc.totalHours + d.totalHours,
      utilization: acc.utilization + d.utilization,
    }), { audits: 0, checklists: 0, certifications: 0, totalHours: 0, utilization: 0 });
    
    return {
      period: auditor,
      ...totalData,
      utilization: totalData.utilization / auditorData.length,
    };
  });
}

function analyzeBottlenecks(data: WorkloadData[]): string[] {
  const issues = [];
  
  const overloadedCount = data.filter(d => d.utilization > 100).length;
  if (overloadedCount > data.length * 0.3) {
    issues.push(`${overloadedCount} team members are overloaded (>100% utilization)`);
  }
  
  const overtimeTotal = data.reduce((sum, d) => sum + d.overtime, 0);
  if (overtimeTotal > data.length * 10) {
    issues.push(`High overtime detected: ${overtimeTotal} total hours across team`);
  }
  
  const utilizationVariance = calculateVariance(data.map(d => d.utilization));
  if (utilizationVariance > 400) {
    issues.push('Uneven workload distribution detected across team members');
  }
  
  return issues;
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
}
