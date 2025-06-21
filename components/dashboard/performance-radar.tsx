'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Target, TrendingUp, Award, Users, BarChart3 } from 'lucide-react';

interface SkillMetric {
  skill: string;
  current: number;
  target: number;
  improvement: number;
  fullName: string;
}

interface PerformanceRadarData {
  auditorId: string;
  auditorName: string;
  skills: SkillMetric[];
  overallScore: number;
  rank: number;
  totalAuditors: number;
}

interface PerformanceRadarProps {
  data: PerformanceRadarData[];
  compareMode?: boolean;
  selectedAuditors?: string[];
  userRole: string;
}

const SKILL_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald  
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
];

export default function PerformanceRadar({ 
  data, 
  compareMode = false, 
  selectedAuditors = [],
  userRole 
}: PerformanceRadarProps) {
  
  // Filter data for comparison mode
  const displayData = compareMode && selectedAuditors.length > 0
    ? data.filter(d => selectedAuditors.includes(d.auditorId))
    : data.slice(0, 3); // Show top 3 performers by default

  // Prepare radar chart data
  const radarData = prepareRadarData(displayData);
  
  // Calculate insights
  const topPerformer = data.reduce((best, current) => 
    current.overallScore > best.overallScore ? current : best
  , data[0] || { auditorName: 'N/A', overallScore: 0 });
  
  const skillGaps = identifySkillGaps(data);
  const improvementOpportunities = identifyImprovementOpportunities(data);

  return (
    <Card className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-500/10 to-emerald-600/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl border border-white/30">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Performance Radar</h3>
              <p className="text-slate-300 text-sm">Multi-dimensional skill analysis</p>
            </div>
          </div>
          <div className="bg-white/10 px-3 py-1 rounded-lg text-sm font-medium">
            {displayData.length} Auditors
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-purple-50 border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <Award className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-lg font-bold text-emerald-900 truncate" title={topPerformer.auditorName}>
                  {topPerformer.auditorName.split(' ')[0]}
                </p>
                <p className="text-sm text-emerald-600">Top Performer</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{topPerformer.overallScore.toFixed(0)}%</p>
                <p className="text-sm text-blue-600">Best Score</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{skillGaps.length}</p>
                <p className="text-sm text-purple-600">Skill Gaps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Radar Chart */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Skill Assessment Radar</h4>
            
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickCount={6}
                  />
                  
                  {displayData.map((auditor, index) => (
                    <Radar
                      key={auditor.auditorId}
                      name={auditor.auditorName}
                      dataKey={`auditor_${index}`}
                      stroke={SKILL_COLORS[index % SKILL_COLORS.length]}
                      fill={SKILL_COLORS[index % SKILL_COLORS.length]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  ))}
                  
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12">
                <Target className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No performance data available</p>
              </div>
            )}
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Individual Scores</h4>
              
              <div className="space-y-4">
                {displayData.map((auditor, auditorIndex) => (
                  <div key={auditor.auditorId} className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-slate-900">{auditor.auditorName}</h5>
                      <span 
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{ 
                          backgroundColor: SKILL_COLORS[auditorIndex % SKILL_COLORS.length] + '20',
                          color: SKILL_COLORS[auditorIndex % SKILL_COLORS.length]
                        }}
                      >
                        #{auditor.rank}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {auditor.skills.map((skill, skillIndex) => (
                        <div key={skillIndex}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">{skill.skill}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-slate-900">
                                {skill.current.toFixed(0)}%
                              </span>
                              {skill.improvement !== 0 && (
                                <span className={`text-xs ${
                                  skill.improvement > 0 ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                  {skill.improvement > 0 ? '+' : ''}{skill.improvement.toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${skill.current}%`,
                                backgroundColor: SKILL_COLORS[auditorIndex % SKILL_COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Overall Score</span>
                        <span className="text-lg font-bold text-slate-900">
                          {auditor.overallScore.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis */}
        {skillGaps.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <Target className="h-6 w-6 text-amber-600 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-amber-900 mb-3">Skill Gap Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillGaps.map((gap, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                      <h5 className="font-medium text-amber-900 mb-2">{gap.skill}</h5>
                      <p className="text-sm text-amber-800 mb-2">{gap.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-amber-600">Team Average:</span>
                        <span className="text-sm font-medium text-amber-900">{gap.teamAverage.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Recommendations */}
        {improvementOpportunities.length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-blue-900 mb-3">Improvement Recommendations</h4>
                <div className="space-y-3">
                  {improvementOpportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-blue-800 font-medium">{opportunity.title}</p>
                        <p className="text-sm text-blue-700">{opportunity.description}</p>
                        <p className="text-xs text-blue-600 mt-1">Expected improvement: +{opportunity.expectedImprovement}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function prepareRadarData(auditors: PerformanceRadarData[]) {
  if (auditors.length === 0) return [];
  
  // Get all unique skills
  const allSkills = Array.from(new Set(
    auditors.flatMap(auditor => auditor.skills.map(skill => skill.skill))
  ));
  
  return allSkills.map(skill => {
    const dataPoint: any = { skill };
    
    auditors.forEach((auditor, index) => {
      const skillData = auditor.skills.find(s => s.skill === skill);
      dataPoint[`auditor_${index}`] = skillData ? skillData.current : 0;
    });
    
    return dataPoint;
  });
}

function identifySkillGaps(auditors: PerformanceRadarData[]) {
  const skillAverages: { [skill: string]: number[] } = {};
  
  auditors.forEach(auditor => {
    auditor.skills.forEach(skill => {
      if (!skillAverages[skill.skill]) skillAverages[skill.skill] = [];
      skillAverages[skill.skill].push(skill.current);
    });
  });
  
  return Object.entries(skillAverages)
    .map(([skill, scores]) => ({
      skill,
      teamAverage: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      description: getSkillGapDescription(skill, scores)
    }))
    .filter(gap => gap.teamAverage < 70) // Only show skills below 70%
    .sort((a, b) => a.teamAverage - b.teamAverage);
}

function identifyImprovementOpportunities(auditors: PerformanceRadarData[]) {
  const opportunities = [];
  
  // Find skills with high variation (some excel, others struggle)
  const skillVariations = calculateSkillVariations(auditors);
  
  for (const [skill, variation] of Object.entries(skillVariations)) {
    if (variation.standardDeviation > 15) {
      opportunities.push({
        title: `Standardize ${skill} Training`,
        description: `High variation in ${skill} scores suggests need for standardized training`,
        expectedImprovement: 15
      });
    }
  }
  
  // Find overall improvement opportunities
  const avgScores = auditors.map(a => a.overallScore);
  const overallAvg = avgScores.reduce((sum, score) => sum + score, 0) / avgScores.length;
  
  if (overallAvg < 80) {
    opportunities.push({
      title: 'Comprehensive Skills Program',
      description: 'Overall team performance below target suggests need for comprehensive training',
      expectedImprovement: 20
    });
  }
  
  return opportunities.slice(0, 5); // Limit to top 5 recommendations
}

function getSkillGapDescription(skill: string, scores: number[]): string {
  const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const lowest = Math.min(...scores);
  const highest = Math.max(...scores);
  
  if (highest - lowest > 30) {
    return `Inconsistent performance (${lowest.toFixed(0)}% to ${highest.toFixed(0)}%)`;
  } else if (avg < 50) {
    return `Critical skill gap - immediate training needed`;
  } else if (avg < 70) {
    return `Below target performance - additional support recommended`;
  }
  
  return `Performance improvement opportunity`;
}

function calculateSkillVariations(auditors: PerformanceRadarData[]) {
  const skillStats: { [skill: string]: { scores: number[], standardDeviation: number } } = {};
  
  auditors.forEach(auditor => {
    auditor.skills.forEach(skill => {
      if (!skillStats[skill.skill]) skillStats[skill.skill] = { scores: [], standardDeviation: 0 };
      skillStats[skill.skill].scores.push(skill.current);
    });
  });
  
  Object.keys(skillStats).forEach(skill => {
    const scores = skillStats[skill].scores;
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    skillStats[skill].standardDeviation = Math.sqrt(variance);
  });
  
  return skillStats;
}
