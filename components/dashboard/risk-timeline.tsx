'use client';

import { format, parseISO, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Calendar, Clock, CheckCircle, TrendingUp, Users } from 'lucide-react';

interface RiskTimelineData {
  id: string;
  title: string;
  framework: string;
  assignee: string;
  dueDate: string;
  createdDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  estimatedDaysToComplete: number;
}

interface RiskTimelineProps {
  data: RiskTimelineData[];
  userRole: string;
  timeframe?: 'week' | 'month' | 'quarter';
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return { bg: 'bg-emerald-500', light: 'bg-emerald-100', text: 'text-emerald-700' };
    case 'medium': return { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' };
    case 'high': return { bg: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' };
    case 'critical': return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' };
    default: return { bg: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700' };
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
    case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-600" />;
    default: return <Calendar className="h-4 w-4 text-gray-600" />;
  }
};

export default function RiskTimeline({ data, userRole, timeframe = 'month' }: RiskTimelineProps) {
  const today = new Date();
  const timeframeDays = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 90;
  const endDate = addDays(today, timeframeDays);

  // Filter data based on timeframe and add risk calculations
  const processedData = data
    .filter(item => {
      const due = parseISO(item.dueDate);
      return isAfter(due, today) && isBefore(due, endDate);
    })
    .map(item => {
      const daysUntilDue = differenceInDays(parseISO(item.dueDate), today);
      const daysSinceCreated = differenceInDays(today, parseISO(item.createdDate));
      
      // Calculate predicted risk based on progress and time remaining
      let predictedRisk = item.riskLevel;
      if (daysUntilDue <= 3 && item.progress < 90) predictedRisk = 'critical';
      else if (daysUntilDue <= 7 && item.progress < 70) predictedRisk = 'high';
      else if (daysUntilDue <= 14 && item.progress < 50) predictedRisk = 'medium';
      
      return {
        ...item,
        daysUntilDue,
        daysSinceCreated,
        predictedRisk,
        urgencyScore: (100 - item.progress) * (30 - daysUntilDue) / 30
      };
    })
    .sort((a, b) => a.urgencyScore - b.urgencyScore);

  // Group by week for timeline visualization
  const weeks = [];
  for (let i = 0; i < Math.ceil(timeframeDays / 7); i++) {
    const weekStart = addDays(today, i * 7);
    const weekEnd = addDays(weekStart, 6);
    
    const weekItems = processedData.filter(item => {
      const due = parseISO(item.dueDate);
      return isAfter(due, weekStart) && isBefore(due, addDays(weekEnd, 1));
    });

    weeks.push({
      weekNumber: i + 1,
      startDate: weekStart,
      endDate: weekEnd,
      items: weekItems,
      riskScore: weekItems.reduce((sum, item) => sum + item.urgencyScore, 0) / weekItems.length || 0
    });
  }

  // Calculate insights
  const criticalItems = processedData.filter(item => item.predictedRisk === 'critical').length;
  const overallRisk = processedData.reduce((sum, item) => sum + item.urgencyScore, 0) / processedData.length || 0;
  const bottleneckWeek = weeks.reduce((max, week) => week.riskScore > max.riskScore ? week : max, weeks[0] || { riskScore: 0 });

  return (
    <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 via-red-500/10 to-purple-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Risk Timeline</h3>
              <p className="text-slate-300 text-sm">Upcoming deadlines and risk predictions</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {criticalItems} Critical Items
          </div>
        </div>
      </div>

      {/* Risk Insights */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-red-50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{criticalItems}</p>
                <p className="text-sm text-red-600">Critical Risk Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-900">{overallRisk.toFixed(0)}</p>
                <p className="text-sm text-amber-600">Risk Score (0-100)</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-lg font-bold text-blue-900">
                  Week {bottleneckWeek?.weekNumber || 'N/A'}
                </p>
                <p className="text-sm text-blue-600">Highest Risk Period</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="p-6">
        <div className="space-y-6">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="relative">
              {/* Week Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">
                    Week {week.weekNumber}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {format(week.startDate, 'MMM dd')} - {format(week.endDate, 'MMM dd')}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  week.riskScore > 50 
                    ? 'bg-red-100 text-red-700' 
                    : week.riskScore > 25 
                    ? 'bg-yellow-100 text-yellow-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Risk: {week.riskScore.toFixed(0)}
                </div>
              </div>

              {/* Week Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                {/* Timeline Items */}
                <div className="space-y-4">
                  {week.items.length > 0 ? (
                    week.items.map((item, itemIndex) => {
                      const riskColors = getRiskColor(item.predictedRisk);
                      
                      return (
                        <div key={itemIndex} className="relative flex items-start gap-4">
                          {/* Timeline Dot */}
                          <div className={`relative z-10 w-8 h-8 ${riskColors.bg} rounded-full flex items-center justify-center shadow-lg`}>
                            {getStatusIcon(item.status)}
                          </div>
                          
                          {/* Item Card */}
                          <div className={`flex-1 ${riskColors.light} border-2 border-opacity-50 rounded-xl p-4 hover:shadow-md transition-all duration-300`}>
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-slate-900">{item.title}</h5>
                              <span className={`px-2 py-1 text-xs font-medium rounded-lg ${riskColors.light} ${riskColors.text}`}>
                                {item.predictedRisk.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                              <div>
                                <p className="text-slate-600">Framework</p>
                                <p className="font-medium text-slate-900">{item.framework}</p>
                              </div>
                              <div>
                                <p className="text-slate-600">Assignee</p>
                                <p className="font-medium text-slate-900 flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {item.assignee}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-600">Due in</p>
                                <p className={`font-medium ${
                                  item.daysUntilDue <= 3 ? 'text-red-600' :
                                  item.daysUntilDue <= 7 ? 'text-amber-600' : 'text-slate-900'
                                }`}>
                                  {item.daysUntilDue} days
                                </p>
                              </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-600">Progress</span>
                                <span className="text-xs font-medium text-slate-900">{item.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    item.progress >= 80 ? 'bg-emerald-500' :
                                    item.progress >= 50 ? 'bg-blue-500' :
                                    item.progress >= 25 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${item.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="ml-12 p-4 text-center text-slate-500 bg-slate-50 rounded-xl">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p>No items due this week</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Recommendations */}
        {criticalItems > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-red-900 mb-2">Immediate Action Required</h4>
                <div className="space-y-2 text-sm text-red-800">
                  <p>• {criticalItems} items require immediate attention to avoid compliance failures</p>
                  <p>• Consider reallocating resources to Week {bottleneckWeek?.weekNumber} to reduce bottleneck</p>
                  <p>• Review workload distribution and extend deadlines where possible</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
