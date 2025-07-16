"use client";

import React, { useState } from 'react';
import { Bot, Lightbulb, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AuditRecommendationsProps {
  auditData: {
    title: string;
    status: string;
    findings: string[];
    riskLevel: string;
    complianceArea: string;
  };
}

interface Recommendation {
  category: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  timeline: string;
  rationale: string;
}

export default function AuditRecommendations({ auditData }: AuditRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateRecommendations = async () => {
    setIsLoading(true);
    
    try {
      const auditContext = `
        Audit Title: ${auditData.title}
        Status: ${auditData.status}
        Risk Level: ${auditData.riskLevel}
        Compliance Area: ${auditData.complianceArea}
        Failed Areas/Findings: ${auditData.findings.join(', ')}
        
        This audit has FAILED and needs immediate corrective action. Please provide specific, actionable recommendations for remediation.
      `;

      const detailedPrompt = `
        Based on this failed compliance audit, please provide specific corrective actions and recommendations. 
        
        Please structure your response with clear categories and actionable steps:
        
        1. **Immediate Actions** (High Priority) - What must be done within 7-14 days
        2. **Process Improvements** (Medium Priority) - What should be implemented within 30-45 days  
        3. **Long-term Measures** (Low Priority) - What should be established within 60-90 days
        
        For each recommendation, include:
        - Category: The area of focus
        - Priority: High/Medium/Low
        - Action: Specific steps to take
        - Timeline: When this should be completed
        - Rationale: Why this is important for compliance
        
        Focus on practical, implementable solutions that directly address the failed audit findings.
      `;

      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: detailedPrompt,
          context: `Failed Audit Remediation Analysis: ${auditContext}`
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI recommendations');
      }

      const data = await response.json();
      
      // Parse AI response into structured recommendations
      const parsedRecommendations = parseAIResponse(data.response);
      setRecommendations(parsedRecommendations);
      setHasGenerated(true);
      
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Fallback recommendations
      setRecommendations([
        {
          category: 'Immediate Action',
          priority: 'high',
          action: 'Review and address the primary audit findings',
          timeline: '7-14 days',
          rationale: 'Critical findings require immediate attention to prevent compliance violations'
        },
        {
          category: 'Process Improvement',
          priority: 'medium',
          action: 'Implement stronger controls and monitoring',
          timeline: '30-45 days',
          rationale: 'Strengthen processes to prevent future audit failures'
        },
        {
          category: 'Documentation',
          priority: 'medium',
          action: 'Update documentation and training materials',
          timeline: '21-30 days',
          rationale: 'Ensure all team members understand compliance requirements'
        }
      ]);
      setHasGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  const parseAIResponse = (response: string): Recommendation[] => {
    // Simple parsing logic - in a real implementation, you might want more sophisticated parsing
    const lines = response.split('\n').filter(line => line.trim());
    const recommendations: Recommendation[] = [];
    
    let currentRec: Partial<Recommendation> = {};
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('category:') || line.toLowerCase().includes('area:')) {
        if (currentRec.category) {
          // Ensure all required properties are present with fallbacks
          const completeRec: Recommendation = {
            category: currentRec.category || 'General',
            priority: (currentRec.priority as 'high' | 'medium' | 'low') || 'medium',
            action: currentRec.action || 'Review and implement necessary changes',
            timeline: currentRec.timeline || '14-21 days',
            rationale: currentRec.rationale || 'Recommended based on audit findings'
          };
          recommendations.push(completeRec);
        }
        currentRec = { category: line.split(':')[1]?.trim() || 'General' };
      } else if (line.toLowerCase().includes('priority:')) {
        const priority = line.split(':')[1]?.trim().toLowerCase();
        currentRec.priority = (priority === 'high' || priority === 'medium' || priority === 'low') ? priority : 'medium';
      } else if (line.toLowerCase().includes('action:')) {
        currentRec.action = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('timeline:')) {
        currentRec.timeline = line.split(':')[1]?.trim() || '';
      } else if (line.toLowerCase().includes('rationale:')) {
        currentRec.rationale = line.split(':')[1]?.trim() || '';
      }
    });
    
    if (currentRec.category) {
      // Ensure all required properties are present with fallbacks
      const completeRec: Recommendation = {
        category: currentRec.category || 'General',
        priority: (currentRec.priority as 'high' | 'medium' | 'low') || 'medium',
        action: currentRec.action || 'Review and implement necessary changes',
        timeline: currentRec.timeline || '14-21 days',
        rationale: currentRec.rationale || 'Recommended based on audit findings'
      };
      recommendations.push(completeRec);
    }
    
    // If parsing fails, return a generic recommendation
    if (recommendations.length === 0) {
      return [
        {
          category: 'AI Analysis',
          priority: 'high',
          action: 'Review AI recommendations and implement suggested improvements',
          timeline: '14-21 days',
          rationale: response.substring(0, 200) + '...'
        }
      ];
    }
    
    return recommendations;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Lightbulb className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-white border border-sky-200 shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-sky-900">AI Audit Recommendations</h3>
          </div>
          {!hasGenerated && (
            <Button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Generate Recommendations
                </>
              )}
            </Button>
          )}
        </div>

        {hasGenerated && (
          <div className="space-y-4">
            <div className="text-sm text-sky-600 mb-4">
              Based on the audit findings, here are AI-generated recommendations for remediation:
            </div>
            
            {recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gradient-to-r from-sky-50 to-blue-50">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-sky-900">{rec.category}</h4>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                    {getPriorityIcon(rec.priority)}
                    {(rec.priority || 'medium').charAt(0).toUpperCase() + (rec.priority || 'medium').slice(1)} Priority
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sky-800">Action:</span>
                    <p className="text-gray-700 mt-1">{rec.action || 'No action specified'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sky-800">Timeline:</span>
                    <p className="text-gray-700 mt-1">{rec.timeline || 'No timeline specified'}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sky-800">Rationale:</span>
                    <p className="text-gray-700 mt-1">{rec.rationale || 'No rationale provided'}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-sky-50 rounded-lg border border-sky-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-sky-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sky-800">Pro Tip:</p>
                  <p className="text-sky-700 text-sm mt-1">
                    Implement these recommendations in order of priority. Track progress and update your compliance documentation as you complete each action item.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
