import { format, parseISO, subDays, startOfDay, endOfDay, isAfter, isBefore, differenceInDays, addDays } from 'date-fns';

// Utility functions for processing dashboard data

export interface ProcessedAuditData {
  auditorId: string;
  auditorName: string;
  completed: number;
  overdue: number;
  rejected: number;
  passRate: number;
  averageScore: number;
}

export interface ProcessedComplianceData {
  date: string;
  framework: string;
  compliant: number;
  nonCompliant: number;
  total: number;
  complianceRate: number;
}

export interface ProcessedSummaryData {
  totalAudits: number;
  completedAudits: number;
  pendingAudits: number;
  draftAudits: number;
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

export function processAuditorPerformanceData(
  auditors: any[], 
  audits: any[], 
  checklistResponses: any[]
): ProcessedAuditData[] {
  return auditors.map(auditor => {
    // Get auditor's audits
    const auditorAudits = audits.filter(audit => audit.user_id === auditor.id);
    const auditorChecklists = checklistResponses.filter(resp => resp.user_id === auditor.id);
    
    // Calculate metrics
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    
    const completed = auditorAudits.filter(audit => 
      audit.status === 'completed' || audit.result === 'pass' || audit.result === 'failed'
    ).length;
    
    const overdue = auditorAudits.filter(audit => {
      const createdDate = parseISO(audit.created_at);
      const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return audit.status !== 'completed' && daysDiff > 14; // Consider 14+ days as overdue
    }).length;
    
    const rejected = auditorAudits.filter(audit => audit.result === 'failed').length;
    
    const passedAudits = auditorAudits.filter(audit => audit.result === 'pass').length;
    const totalWithResults = auditorAudits.filter(audit => audit.result).length;
    const passRate = totalWithResults > 0 ? (passedAudits / totalWithResults) * 100 : 0;
    
    const scores = auditorAudits
      .filter(audit => audit.percentage !== null && audit.percentage !== undefined)
      .map(audit => audit.percentage);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;

    return {
      auditorId: auditor.id,
      auditorName: auditor.full_name,
      completed,
      overdue,
      rejected,
      passRate,
      averageScore,
    };
  });
}

export function processComplianceTrendsData(
  audits: any[], 
  checklistResponses: any[]
): ProcessedComplianceData[] {
  const trendData: ProcessedComplianceData[] = [];
  const last30Days = Array.from({ length: 30 }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  ).reverse();
  // Combine audits and checklist responses
  const allItems = [
    ...audits.map(audit => ({
      id: audit.id,
      date: format(parseISO(audit.created_at), 'yyyy-MM-dd'),
      framework: (() => {
        const compliance = audit.form?.compliance;
        if (Array.isArray(compliance) && compliance.length > 0) {
          return compliance[0].name;
        }
        return compliance?.name || 'Unknown Framework';
      })(),
      result: audit.result,
      status: audit.status,
      type: 'audit'
    })),
    ...checklistResponses.map(resp => ({
      id: resp.id,
      date: format(parseISO(resp.created_at), 'yyyy-MM-dd'),
      framework: (() => {
        const compliance = resp.checklist?.compliance;
        if (Array.isArray(compliance) && compliance.length > 0) {
          return compliance[0].name;
        }
        return compliance?.name || 'Unknown Framework';
      })(),
      result: resp.result,
      status: resp.status,
      type: 'checklist'
    }))
  ];

  // Group by date and framework
  const frameworks = Array.from(new Set(allItems.map(item => item.framework)));
  
  frameworks.forEach(framework => {
    last30Days.forEach(date => {
      const dayItems = allItems.filter(item => 
        item.date === date && item.framework === framework
      );
      
      const compliant = dayItems.filter(item => 
        item.result === 'pass' || item.status === 'completed'
      ).length;
      
      const nonCompliant = dayItems.filter(item => 
        item.result === 'failed' || (item.status !== 'completed' && item.status !== 'pending')
      ).length;
      
      const total = dayItems.length;
      const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

      if (total > 0) {
        trendData.push({
          date,
          framework,
          compliant,
          nonCompliant,
          total,
          complianceRate,
        });
      }
    });
  });

  return trendData;
}

export function processComplianceSummaryData(
  audits: any[], 
  checklistResponses: any[], 
  compliance: any[]
): ProcessedSummaryData {  // Combine all compliance items
  const allItems = [...audits, ...checklistResponses];
  // Use only audits for status distribution counts
  const auditItems = audits;
  
  const totalAudits = allItems.length;
  const completedAudits = auditItems.filter(item => 
    item.status === 'completed'
  ).length;
  
  const pendingAudits = auditItems.filter(item => 
    item.status === 'pending' || item.status === 'in_progress'
  ).length;
  
  const draftAudits = auditItems.filter(item => 
    item.status === 'draft'
  ).length;
    const now = new Date();
  const overdueAudits = auditItems.filter(item => {
    const createdDate = parseISO(item.created_at);
    const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    return item.status !== 'completed' && daysDiff > 14;
  }).length;
  
  const passedAudits = allItems.filter(item => item.result === 'pass').length;
  const failedAudits = allItems.filter(item => item.result === 'failed').length;
  
  // Calculate average score from audits only (they have percentage)
  const auditScores = audits
    .filter(audit => audit.percentage !== null && audit.percentage !== undefined)
    .map(audit => audit.percentage);
  const averageScore = auditScores.length > 0 
    ? auditScores.reduce((sum, score) => sum + score, 0) / auditScores.length 
    : 0;
  
  const complianceRate = totalAudits > 0 ? (passedAudits / totalAudits) * 100 : 0;
  
  // Pending corrective actions (failed items that need action)
  const pendingCorrectiveActions = failedAudits + overdueAudits;
  
  // Framework breakdown
  const frameworkBreakdown = compliance.map(framework => {
    const frameworkAudits = audits.filter(audit => {
      const auditCompliance = audit.form?.compliance;
      if (Array.isArray(auditCompliance) && auditCompliance.length > 0) {
        return auditCompliance[0].id === framework.id;
      }
      return auditCompliance?.id === framework.id;
    });
    
    const frameworkChecklists = checklistResponses.filter(resp => {
      const checklistCompliance = resp.checklist?.compliance;
      if (Array.isArray(checklistCompliance) && checklistCompliance.length > 0) {
        return checklistCompliance[0].id === framework.id;
      }
      return checklistCompliance?.id === framework.id;
    });
    
    const frameworkItems = [...frameworkAudits, ...frameworkChecklists];
    const completed = frameworkItems.filter(item => 
      item.status === 'completed' || item.result === 'pass' || item.result === 'failed'
    ).length;
    const total = frameworkItems.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return {
      name: framework.name,
      completed,
      total,
      percentage,
    };
  });
  
  // Calculate trend (compare last 7 days vs previous 7 days)
  const last7Days = subDays(new Date(), 7);
  const previous7Days = subDays(new Date(), 14);
  
  const recentItems = allItems.filter(item => {
    const itemDate = parseISO(item.created_at);
    return isAfter(itemDate, last7Days);
  });
  
  const previousItems = allItems.filter(item => {
    const itemDate = parseISO(item.created_at);
    return isAfter(itemDate, previous7Days) && isBefore(itemDate, last7Days);
  });
  
  const recentCompliance = recentItems.length > 0 
    ? (recentItems.filter(item => item.result === 'pass').length / recentItems.length) * 100 
    : 0;
  
  const previousCompliance = previousItems.length > 0 
    ? (previousItems.filter(item => item.result === 'pass').length / previousItems.length) * 100 
    : 0;
  
  const trendPercentage = recentCompliance - previousCompliance;
  const recentTrend = Math.abs(trendPercentage) < 2 
    ? 'stable' 
    : trendPercentage > 0 
      ? 'up' 
      : 'down';
  return {
    totalAudits,
    completedAudits,
    pendingAudits,
    draftAudits,
    overdueAudits,
    passedAudits,
    failedAudits,
    averageScore,
    complianceRate,
    pendingCorrectiveActions,
    frameworkBreakdown,
    recentTrend,
    trendPercentage,
  };
}

// New utility functions for story-driven visualizations

export function processRiskTimelineData(
  audits: any[],
  userProfiles: any[]
): any[] {
  const now = new Date();
  
  return audits.map(audit => {
    const daysOld = differenceInDays(now, parseISO(audit.created_at));
    const estimatedDaysToComplete = Math.max(14 - daysOld, 1);
    const dueDate = addDays(parseISO(audit.created_at), 14); // Assume 14-day SLA
    
    const assignee = userProfiles.find(p => p.id === audit.user_id);
    const progress = audit.percentage || 0;
    
    // Calculate risk level based on progress and time
    let riskLevel = 'low';
    if (daysOld > 10 && progress < 50) riskLevel = 'critical';
    else if (daysOld > 7 && progress < 70) riskLevel = 'high';
    else if (daysOld > 5 && progress < 90) riskLevel = 'medium';
    
    const compliance = audit.form?.compliance;
    const frameworkName = Array.isArray(compliance) && compliance.length > 0 
      ? compliance[0].name 
      : compliance?.name || 'Unknown Framework';
    
    return {
      id: audit.id,
      title: audit.title || `Audit ${audit.id}`,
      framework: frameworkName,
      assignee: assignee?.full_name || 'Unassigned',
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      createdDate: audit.created_at,
      status: audit.status,
      riskLevel,
      progress,
      estimatedDaysToComplete,
    };
  });
}

export function processWorkloadData(
  audits: any[],
  checklistResponses: any[],
  userProfiles: any[]
): any[] {
  const last30Days = Array.from({ length: 4 }, (_, i) => 
    format(subDays(new Date(), i * 7), 'MMM dd')
  ).reverse();
  
  return userProfiles
    .filter(profile => profile.role === 'auditor')
    .flatMap(auditor => {
      return last30Days.map(period => {
        const weekStart = parseISO(period);
        const weekEnd = addDays(weekStart, 7);
        
        const weekAudits = audits.filter(audit => {
          const auditDate = parseISO(audit.created_at);
          return audit.user_id === auditor.id && 
                 auditDate >= weekStart && 
                 auditDate < weekEnd;
        });
        
        const weekChecklists = checklistResponses.filter(resp => {
          const respDate = parseISO(resp.created_at);
          return resp.user_id === auditor.id && 
                 respDate >= weekStart && 
                 respDate < weekEnd;
        });
        
        const totalHours = weekAudits.length * 8 + weekChecklists.length * 2; // Estimated hours
        const capacity = 40; // Standard work week
        const utilization = (totalHours / capacity) * 100;
        const overtime = Math.max(totalHours - capacity, 0);
        
        return {
          period,
          auditor: auditor.full_name,
          audits: weekAudits.length,
          checklists: weekChecklists.length,
          certifications: 0, // No cert data available
          totalHours,
          capacity,
          utilization,
          overtime,
        };
      });
    });
}

export function processComplianceHealthData(
  audits: any[],
  checklistResponses: any[]
): any[] {
  const last30Days = Array.from({ length: 30 }, (_, i) => 
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  ).reverse();
  
  return last30Days.map(date => {
    const dayAudits = audits.filter(audit => 
      format(parseISO(audit.created_at), 'yyyy-MM-dd') === date
    );
    
    const dayResponses = checklistResponses.filter(resp => 
      format(parseISO(resp.created_at), 'yyyy-MM-dd') === date
    );
    
    const allItems = [...dayAudits, ...dayResponses];
    const completedTasks = allItems.filter(item => 
      item.status === 'completed' || item.result === 'pass'
    ).length;
    
    const totalTasks = allItems.length;
    const criticalIssues = allItems.filter(item => 
      item.result === 'failed' || item.status === 'overdue'
    ).length;
    
    const healthScore = totalTasks > 0 
      ? ((completedTasks / totalTasks) * 100) - (criticalIssues * 10)
      : 100;
    
    // Get frameworks for this day
    const frameworks = Array.from(new Set([
      ...dayAudits.map(audit => {
        const compliance = audit.form?.compliance;
        return Array.isArray(compliance) && compliance.length > 0 
          ? compliance[0].name 
          : compliance?.name || 'Unknown';
      }),
      ...dayResponses.map(resp => {
        const compliance = resp.checklist?.compliance;
        return Array.isArray(compliance) && compliance.length > 0 
          ? compliance[0].name 
          : compliance?.name || 'Unknown';
      })
    ])).map(name => ({
      name,
      status: healthScore >= 80 ? 'healthy' : 
              healthScore >= 60 ? 'warning' : 'critical'
    }));
    
    return {
      date,
      completedTasks,
      totalTasks,
      criticalIssues,
      healthScore: Math.max(0, Math.min(100, healthScore)),
      frameworks,
    };
  });
}

export function processPerformanceRadarData(
  auditors: any[],
  audits: any[]
): any[] {
  return auditors.map((auditor, index) => {
    const auditorAudits = audits.filter(audit => audit.user_id === auditor.id);
    
    // Calculate skill metrics
    const skills = [
      {
        skill: 'Accuracy',
        current: calculateAccuracy(auditorAudits),
        target: 90,
        improvement: 5,
        fullName: 'Audit Accuracy Rate'
      },
      {
        skill: 'Speed',
        current: calculateSpeed(auditorAudits),
        target: 85,
        improvement: -2,
        fullName: 'Task Completion Speed'
      },
      {
        skill: 'Quality',
        current: calculateQuality(auditorAudits),
        target: 88,
        improvement: 8,
        fullName: 'Work Quality Score'
      },
      {
        skill: 'Compliance',
        current: calculateComplianceExpertise(auditorAudits),
        target: 92,
        improvement: 3,
        fullName: 'Compliance Framework Knowledge'
      },
      {
        skill: 'Documentation',
        current: calculateDocumentation(auditorAudits),
        target: 80,
        improvement: 10,
        fullName: 'Documentation Quality'
      },
      {
        skill: 'Communication',
        current: calculateCommunication(auditorAudits),
        target: 85,
        improvement: 0,
        fullName: 'Communication Effectiveness'
      }
    ];
    
    const overallScore = skills.reduce((sum, skill) => sum + skill.current, 0) / skills.length;
    
    return {
      auditorId: auditor.id,
      auditorName: auditor.full_name,
      skills,
      overallScore,
      rank: index + 1, // This would be calculated based on actual ranking
      totalAuditors: auditors.length,
    };
  });
}

// Helper functions for skill calculations
function calculateAccuracy(audits: any[]): number {
  const passedAudits = audits.filter(audit => audit.result === 'pass').length;
  return audits.length > 0 ? (passedAudits / audits.length) * 100 : 0;
}

function calculateSpeed(audits: any[]): number {
  // Mock calculation - in real system would calculate based on completion time
  return Math.random() * 40 + 60; // 60-100%
}

function calculateQuality(audits: any[]): number {
  const scores = audits.filter(audit => audit.percentage).map(audit => audit.percentage);
  return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
}

function calculateComplianceExpertise(audits: any[]): number {
  // Mock calculation based on framework diversity
  const frameworks = new Set(audits.map(audit => {
    const compliance = audit.form?.compliance;
    return Array.isArray(compliance) && compliance.length > 0 
      ? compliance[0].name 
      : compliance?.name;
  }));
  return Math.min(frameworks.size * 25, 100); // 25% per framework, max 100%
}

function calculateDocumentation(audits: any[]): number {
  // Mock calculation - would be based on actual documentation quality metrics
  return Math.random() * 30 + 70; // 70-100%
}

function calculateCommunication(audits: any[]): number {
  // Mock calculation - would be based on feedback scores
  return Math.random() * 25 + 75; // 75-100%
}
