'use client';

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, AreaChart, Area } from 'recharts';
import { Card } from '@/components/ui/card';
import { TrendingDown, AlertTriangle, BarChart3, Calendar } from 'lucide-react';
import { format, parseISO, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';

interface ComplianceTrendData {
  date: string;
  framework: string;
  compliant: number;
  nonCompliant: number;
  total: number;
  complianceRate: number;
}

interface ComplianceTrendsChartProps {
  data: ComplianceTrendData[];
  timeRange?: 'week' | 'month' | 'quarter';
  showHeatmap?: boolean;
}

// Color scale for heatmap (compliance rates)
const getComplianceColor = (rate: number) => {
  if (rate >= 90) return '#10b981'; // emerald-500 - excellent
  if (rate >= 75) return '#84cc16'; // lime-500 - good
  if (rate >= 60) return '#eab308'; // yellow-500 - warning
  if (rate >= 40) return '#f97316'; // orange-500 - poor
  return '#ef4444'; // red-500 - critical
};

const getComplianceColorLight = (rate: number) => {
  if (rate >= 90) return '#d1fae5'; // emerald-100
  if (rate >= 75) return '#ecfccb'; // lime-100
  if (rate >= 60) return '#fef3c7'; // yellow-100
  if (rate >= 40) return '#fed7aa'; // orange-100
  return '#fee2e2'; // red-100
};

export default function ComplianceTrendsChart({ 
  data, 
  timeRange = 'month',
  showHeatmap = false 
}: ComplianceTrendsChartProps) {
  // Group data by date for trend chart
  const trendData = data.reduce((acc, item) => {
    const date = format(parseISO(item.date), 'MMM dd');
    const existing = acc.find(d => d.date === date);
    
    if (existing) {
      existing.compliant += item.compliant;
      existing.nonCompliant += item.nonCompliant;
      existing.total += item.total;
      existing.complianceRate = existing.total > 0 ? (existing.compliant / existing.total) * 100 : 0;
    } else {
      acc.push({
        date,
        compliant: item.compliant,
        nonCompliant: item.nonCompliant,
        total: item.total,
        complianceRate: item.total > 0 ? (item.compliant / item.total) * 100 : 0,
      });
    }
    
    return acc;
  }, [] as any[]);

  // Group data by framework for heatmap
  const frameworks = Array.from(new Set(data.map(d => d.framework)));
  const dates = Array.from(new Set(data.map(d => format(parseISO(d.date), 'MMM dd'))));
  
  const heatmapData = frameworks.map(framework => {
    const frameworkData = dates.map(date => {
      const dayData = data.filter(d => 
        d.framework === framework && 
        format(parseISO(d.date), 'MMM dd') === date
      );
      
      const totalCompliant = dayData.reduce((sum, d) => sum + d.compliant, 0);
      const totalItems = dayData.reduce((sum, d) => sum + d.total, 0);
      const rate = totalItems > 0 ? (totalCompliant / totalItems) * 100 : 0;
      
      return {
        date,
        rate,
        compliant: totalCompliant,
        total: totalItems,
      };
    });
    
    return {
      framework,
      data: frameworkData,
      avgRate: frameworkData.reduce((sum, d) => sum + d.rate, 0) / frameworkData.length || 0,
    };
  });

  // Calculate summary statistics
  const totalCompliant = data.reduce((sum, d) => sum + d.compliant, 0);
  const totalItems = data.reduce((sum, d) => sum + d.total, 0);
  const overallComplianceRate = totalItems > 0 ? (totalCompliant / totalItems) * 100 : 0;
  
  const worstFramework = heatmapData.reduce((worst, framework) => 
    framework.avgRate < worst.avgRate ? framework : worst
  , heatmapData[0] || { framework: 'N/A', avgRate: 100 });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} style={{ color: entry.color }}>
                <span className="font-medium">{entry.name}:</span> {entry.value}
                {entry.dataKey === 'complianceRate' && '%'}
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
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-yellow-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Compliance Trends</h3>
              <p className="text-slate-300 text-sm">Non-compliance patterns and trending issues</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {overallComplianceRate.toFixed(1)}% Compliant
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-orange-50 border-b border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{overallComplianceRate.toFixed(1)}%</p>
                <p className="text-sm text-emerald-600">Overall Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                <p className="text-sm text-blue-600">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-900">{totalItems - totalCompliant}</p>
                <p className="text-sm text-red-600">Non-Compliant</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-amber-900 truncate" title={worstFramework.framework}>
                  {worstFramework.framework.length > 8 
                    ? worstFramework.framework.substring(0, 8) + '...' 
                    : worstFramework.framework}
                </p>
                <p className="text-sm text-amber-600">Needs Attention</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="p-6">
        {!showHeatmap ? (
          // Trend Line Chart
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Compliance Rate Over Time</h4>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="nonCompliant" fill="#ef4444" name="Non-Compliant" />
                  <Bar dataKey="compliant" fill="#10b981" name="Compliant" />
                  <Line 
                    type="monotone" 
                    dataKey="complianceRate" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Compliance Rate (%)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <TrendingDown className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No trend data available</p>
              </div>
            )}
          </div>
        ) : (
          // Heatmap View
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Compliance Heatmap by Framework</h4>
            <div className="space-y-3">
              {heatmapData.map((framework, frameIndex) => (
                <div key={frameIndex} className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-slate-700">{framework.framework}</h5>
                    <span className="text-sm font-semibold px-2 py-1 rounded-lg" 
                          style={{ 
                            backgroundColor: getComplianceColorLight(framework.avgRate),
                            color: getComplianceColor(framework.avgRate)
                          }}>
                      {framework.avgRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="grid grid-cols-7 lg:grid-cols-14 gap-1">
                    {framework.data.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className="aspect-square rounded-md flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 hover:scale-110"
                        style={{
                          backgroundColor: getComplianceColorLight(day.rate),
                          color: getComplianceColor(day.rate),
                        }}
                        title={`${day.date}: ${day.rate.toFixed(1)}% (${day.compliant}/${day.total})`}
                      >
                        {day.rate > 0 ? day.rate.toFixed(0) : '-'}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <span className="text-slate-600">Compliance Rate:</span>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
                <span>0-40%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }}></div>
                <span>40-60%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }}></div>
                <span>60-75%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }}></div>
                <span>75-90%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
                <span>90-100%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
