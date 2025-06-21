'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AuditorPerformanceData {
  auditorName: string;
  auditorId: string;
  completed: number;
  overdue: number;
  rejected: number;
  passRate: number;
  averageScore: number;
}

interface AuditorPerformanceChartProps {
  data: AuditorPerformanceData[];
  showDetails?: boolean;
}

const COLORS = {
  completed: '#10b981', // emerald-500
  overdue: '#f59e0b',   // amber-500
  rejected: '#ef4444',  // red-500
};

export default function AuditorPerformanceChart({ data, showDetails = true }: AuditorPerformanceChartProps) {
  // Calculate totals for summary
  const totals = data.reduce(
    (acc, auditor) => ({
      completed: acc.completed + auditor.completed,
      overdue: acc.overdue + auditor.overdue,
      rejected: acc.rejected + auditor.rejected,
    }),
    { completed: 0, overdue: 0, rejected: 0 }
  );

  const avgPassRate = data.length > 0 
    ? (data.reduce((acc, auditor) => acc + auditor.passRate, 0) / data.length).toFixed(1)
    : '0';

  // Transform data for chart
  const chartData = data.map(auditor => ({
    name: auditor.auditorName.split(' ')[0], // First name only for chart
    fullName: auditor.auditorName,
    completed: auditor.completed,
    overdue: auditor.overdue,
    rejected: auditor.rejected,
    passRate: auditor.passRate,
    averageScore: auditor.averageScore,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{data.fullName}</p>
          <div className="space-y-1">
            <p className="text-emerald-600">
              <span className="font-medium">Completed:</span> {data.completed}
            </p>
            <p className="text-amber-600">
              <span className="font-medium">Overdue:</span> {data.overdue}
            </p>
            <p className="text-red-600">
              <span className="font-medium">Rejected:</span> {data.rejected}
            </p>
            <p className="text-blue-600">
              <span className="font-medium">Pass Rate:</span> {data.passRate}%
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Avg Score:</span> {data.averageScore}%
            </p>
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
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-blue-500/10 to-purple-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Auditor Performance</h3>
              <p className="text-slate-300 text-sm">Audit completion and quality metrics</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {data.length} Auditors
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {showDetails && (
        <div className="p-6 bg-gradient-to-r from-slate-50 to-sky-50 border-b border-slate-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-900">{totals.completed}</p>
                  <p className="text-sm text-emerald-600">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-900">{totals.overdue}</p>
                  <p className="text-sm text-amber-600">Overdue</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-red-200">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-900">{totals.rejected}</p>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{avgPassRate}%</p>
                  <p className="text-sm text-blue-600">Avg Pass Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="p-6">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
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
              <Bar 
                dataKey="completed" 
                fill={COLORS.completed} 
                name="Completed"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="overdue" 
                fill={COLORS.overdue} 
                name="Overdue"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="rejected" 
                fill={COLORS.rejected} 
                name="Rejected"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-slate-100 to-sky-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 mb-2">No Auditor Data</h4>
            <p className="text-slate-500 mb-4 max-w-sm mx-auto">
              No auditor performance data available yet. Data will appear as audits are completed.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
