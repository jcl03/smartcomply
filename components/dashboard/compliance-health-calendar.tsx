'use client';

import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, subDays } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Calendar, TrendingUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ComplianceHealthDay {
  date: string;
  completedTasks: number;
  totalTasks: number;
  criticalIssues: number;
  healthScore: number; // 0-100
  frameworks: Array<{
    name: string;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
  }>;
}

interface ComplianceHealthCalendarProps {
  data: ComplianceHealthDay[];
  currentMonth?: Date;
  userRole: string;
}

const getHealthColor = (score: number) => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-green-400';
  if (score >= 60) return 'bg-yellow-400';
  if (score >= 40) return 'bg-orange-400';
  if (score >= 20) return 'bg-red-400';
  return 'bg-red-600';
};

const getHealthColorLight = (score: number) => {
  if (score >= 90) return 'bg-emerald-100 border-emerald-300';
  if (score >= 75) return 'bg-green-100 border-green-300';
  if (score >= 60) return 'bg-yellow-100 border-yellow-300';
  if (score >= 40) return 'bg-orange-100 border-orange-300';
  if (score >= 20) return 'bg-red-100 border-red-300';
  return 'bg-red-200 border-red-400';
};

const getHealthText = (score: number) => {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-700' };
  if (score >= 75) return { label: 'Good', color: 'text-green-700' };
  if (score >= 60) return { label: 'Fair', color: 'text-yellow-700' };
  if (score >= 40) return { label: 'Poor', color: 'text-orange-700' };
  if (score >= 20) return { label: 'Critical', color: 'text-red-700' };
  return { label: 'Emergency', color: 'text-red-800' };
};

export default function ComplianceHealthCalendar({ 
  data, 
  currentMonth = new Date(),
  userRole 
}: ComplianceHealthCalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get calendar start (includes days from previous month to fill the grid)
  const calendarStart = subDays(monthStart, monthStart.getDay());
  const calendarEnd = addDays(monthEnd, 6 - monthEnd.getDay());
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Process data for calendar
  const calendarData = calendarDays.map(day => {
    const dayData = data.find(d => isSameDay(parseISO(d.date), day));
    const isCurrentMonth = day >= monthStart && day <= monthEnd;
    
    return {
      date: day,
      isCurrentMonth,
      data: dayData || {
        date: format(day, 'yyyy-MM-dd'),
        completedTasks: 0,
        totalTasks: 0,
        criticalIssues: 0,
        healthScore: 100,
        frameworks: []
      }
    };
  });

  // Calculate monthly insights
  const monthlyData = data.filter(d => {
    const date = parseISO(d.date);
    return date >= monthStart && date <= monthEnd;
  });

  const avgHealthScore = monthlyData.length > 0 
    ? monthlyData.reduce((sum, d) => sum + d.healthScore, 0) / monthlyData.length 
    : 100;

  const totalCriticalIssues = monthlyData.reduce((sum, d) => sum + d.criticalIssues, 0);
  const totalCompletedTasks = monthlyData.reduce((sum, d) => sum + d.completedTasks, 0);
  const totalTasks = monthlyData.reduce((sum, d) => sum + d.totalTasks, 0);
  const completionRate = totalTasks > 0 ? (totalCompletedTasks / totalTasks) * 100 : 0;

  // Identify patterns
  const patterns = identifyPatterns(monthlyData);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-yellow-500/10 to-red-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Compliance Health Calendar</h3>
              <p className="text-slate-300 text-sm">{format(currentMonth, 'MMMM yyyy')} - Daily compliance status</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {avgHealthScore.toFixed(0)}% Health Score
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-emerald-50 border-b border-slate-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`bg-white rounded-xl p-4 border-2 ${getHealthColorLight(avgHealthScore)}`}>
            <div className="flex items-center gap-3">
              <TrendingUp className={`h-6 w-6 ${getHealthText(avgHealthScore).color}`} />
              <div>
                <p className={`text-2xl font-bold ${getHealthText(avgHealthScore).color}`}>
                  {avgHealthScore.toFixed(0)}%
                </p>
                <p className={`text-sm ${getHealthText(avgHealthScore).color}`}>
                  {getHealthText(avgHealthScore).label}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-900">{completionRate.toFixed(0)}%</p>
                <p className="text-sm text-emerald-600">Completion Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-900">{totalCriticalIssues}</p>
                <p className="text-sm text-red-600">Critical Issues</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{totalCompletedTasks}/{totalTasks}</p>
                <p className="text-sm text-blue-600">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Daily Health Status</h4>
          
          {/* Calendar Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekdays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7 gap-2">
            {calendarData.map((day, index) => {
              const healthScore = day.data.healthScore;
              const isToday = isSameDay(day.date, new Date());
              
              return (
                <div
                  key={index}
                  className={`
                    aspect-square p-1 rounded-lg border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                    ${day.isCurrentMonth 
                      ? getHealthColorLight(healthScore)
                      : 'bg-slate-50 border-slate-200'
                    }
                    ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                  `}
                  title={`${format(day.date, 'MMM dd')}: ${healthScore.toFixed(0)}% health score`}
                >
                  <div className="h-full flex flex-col justify-between text-xs">
                    <div className="text-center">
                      <span className={`font-medium ${
                        day.isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                      }`}>
                        {format(day.date, 'd')}
                      </span>
                    </div>
                    
                    {day.isCurrentMonth && day.data.totalTasks > 0 && (
                      <div className="space-y-1">
                        {/* Health indicator dot */}
                        <div className="flex justify-center">
                          <div 
                            className={`w-2 h-2 rounded-full ${getHealthColor(healthScore)}`}
                          />
                        </div>
                        
                        {/* Task count */}
                        <div className="text-center">
                          <span className="text-[10px] text-slate-600">
                            {day.data.completedTasks}/{day.data.totalTasks}
                          </span>
                        </div>
                        
                        {/* Critical issues indicator */}
                        {day.data.criticalIssues > 0 && (
                          <div className="flex justify-center">
                            <div className="w-1 h-1 bg-red-600 rounded-full" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm mb-6">
          <span className="text-slate-600">Health Score:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500"></div>
            <span>90-100%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-400"></div>
            <span>60-89%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-400"></div>
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-400"></div>
            <span>0-39%</span>
          </div>
        </div>

        {/* Pattern Analysis */}
        {patterns.length > 0 && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-blue-900 mb-3">Pattern Analysis</h4>
                <div className="space-y-2">
                  {patterns.map((pattern, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <span className="font-medium text-blue-900">•</span>
                      <span>{pattern}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Risks */}
        <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-2xl">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 mt-1" />
            <div>
              <h4 className="text-lg font-bold text-amber-900 mb-3">Predictive Insights</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
                <div>
                  <p className="font-medium text-amber-900 mb-1">Risk Forecast:</p>
                  <p>Based on current trends, expect {Math.ceil(avgHealthScore < 70 ? 3 : 1)} critical issues next week</p>
                </div>
                <div>
                  <p className="font-medium text-amber-900 mb-1">Resource Needs:</p>
                  <p>Consider increasing capacity by {Math.ceil((100 - avgHealthScore) / 10)}% to maintain health</p>
                </div>
                <div>
                  <p className="font-medium text-amber-900 mb-1">Priority Actions:</p>
                  <p>Focus on frameworks with lowest health scores this week</p>
                </div>
                <div>
                  <p className="font-medium text-amber-900 mb-1">Trend Analysis:</p>
                  <p>Health score has {avgHealthScore > 75 ? 'improved' : 'declined'} compared to last month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function identifyPatterns(data: ComplianceHealthDay[]): string[] {
  const patterns: string[] = [];
  
  if (data.length === 0) return patterns;
  
  // Analyze day-of-week patterns
  const dayOfWeekScores: { [key: number]: number[] } = {};
  data.forEach(d => {
    const dayOfWeek = parseISO(d.date).getDay();
    if (!dayOfWeekScores[dayOfWeek]) dayOfWeekScores[dayOfWeek] = [];
    dayOfWeekScores[dayOfWeek].push(d.healthScore);
  });
  
  const avgByDay = Object.entries(dayOfWeekScores).map(([day, scores]) => ({
    day: parseInt(day),
    avg: scores.reduce((sum, score) => sum + score, 0) / scores.length
  }));
  
  const worstDay = avgByDay.reduce((min, day) => day.avg < min.avg ? day : min);
  const bestDay = avgByDay.reduce((max, day) => day.avg > max.avg ? day : max);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  if (worstDay.avg < bestDay.avg - 10) {
    patterns.push(`${dayNames[worstDay.day]} consistently shows lower compliance health (${worstDay.avg.toFixed(0)}% avg)`);
  }
  
  // Analyze weekly trends
  const weeklyScores = [];
  for (let i = 0; i < data.length; i += 7) {
    const weekData = data.slice(i, i + 7);
    const avgScore = weekData.reduce((sum, d) => sum + d.healthScore, 0) / weekData.length;
    weeklyScores.push(avgScore);
  }
  
  if (weeklyScores.length >= 2) {
    const trend = weeklyScores[weeklyScores.length - 1] - weeklyScores[0];
    if (Math.abs(trend) > 5) {
      patterns.push(`Monthly trend shows ${trend > 0 ? 'improving' : 'declining'} compliance health`);
    }
  }
  
  // Analyze critical issue patterns
  const avgCriticalIssues = data.reduce((sum, d) => sum + d.criticalIssues, 0) / data.length;
  if (avgCriticalIssues > 2) {
    patterns.push(`High frequency of critical issues detected (${avgCriticalIssues.toFixed(1)} per day avg)`);
  }
  
  return patterns;
}
