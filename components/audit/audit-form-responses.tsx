"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, FileText, Eye, Download, XCircle } from "lucide-react";

interface AuditData {
  id: number;
  form_id: number;
  user_id: string;
  status: string;
  created_at: string;
  last_edit_at: string;
  result: 'pass' | 'failed' | null;
  marks: number;
  percentage: number;
  comments: string;
  title: string;
  verification_status: 'pending' | 'accepted' | 'rejected' | null;
  verified_by: string | null;
  verified_at: string | null;
  corrective_action: string | null;
  tenant_id: number;
  audit_data: any;
  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;
    status: string;
    date_created: string;
    compliance?: {
      id: number;
      name: string;
    };
  };
  user_profile?: {
    full_name: string;
    email: string;
  };
}

interface AuditFormResponsesProps {
  audits: AuditData[];
}

export default function AuditFormResponses({ audits }: AuditFormResponsesProps) {
  if (!audits || audits.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-2xl shadow-lg">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-slate-100 p-3 rounded-xl">
              <FileText className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Audit Forms Found</h3>
              <p className="text-slate-700">
                No audit forms with responses are available to display.
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const renderResponse = (field: any, response: any) => {
    if (!response) {
      return (
        <div className="flex items-center gap-2 text-slate-400">
          <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
          <span className="italic">No response provided</span>
        </div>
      );
    }

    // Handle array responses (like ["Tidy", "Clean", "Got pork"])
    if (Array.isArray(response)) {
      return (
        <div className="space-y-2">
          {response.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-slate-900">{String(item)}</span>
            </div>
          ))}
        </div>
      );
    }

    // Handle image responses
    if (field.type === 'image' || field.type === 'file' || 
        (typeof response === 'string' && 
         (response.includes('supabase.co/storage') || 
          response.match(/\.(jpeg|jpg|gif|png|webp)$/i) ||
          response.startsWith('data:image/') ||
          response.startsWith('blob:') ||
          response.startsWith('http') && response.includes('image')))) {
      return (
        <div className="space-y-3">
          <div className="relative group">
            <img 
              src={response}
              alt={field.label || 'Uploaded image'}
              className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
              onClick={() => window.open(response, '_blank')}
            />
            <div className="hidden bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="text-red-600 text-sm mb-2">Failed to load image</div>
              <div className="text-slate-600 text-xs font-mono break-all">
                {response}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Handle object responses
    if (typeof response === 'object') {
      return (
        <pre className="text-sm text-slate-900 bg-slate-50 p-3 rounded border overflow-x-auto">
          {JSON.stringify(response, null, 2)}
        </pre>
      );
    }

    // Handle simple text responses
    return <span className="text-slate-900">{String(response)}</span>;
  };

  const renderFormResponses = (audit: AuditData) => {
    if (!audit.audit_data) {
      return (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No response data available</p>
        </div>
      );
    }

    const responses = audit.audit_data.responses || audit.audit_data;
    const formSchema = audit.form?.form_schema;

    if (!formSchema || !formSchema.fields) {
      return (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Form schema not available</p>
        </div>
      );
    }

    // Group fields by section structure
    const groupedFields = formSchema.fields.reduce((acc: any, field: any, index: number) => {
      let sectionName = 'General';
      
      if (field.section) {
        sectionName = field.section;
      } else if (field.label && field.label.length > 50) {
        // For long labels, create sections based on content
        if (field.label.toLowerCase().includes('fridge')) {
          sectionName = 'Fridge';
        } else if (field.label.toLowerCase().includes('store') || field.label.toLowerCase().includes('wear')) {
          sectionName = 'Store Operations';
        } else if (field.label.toLowerCase().includes('clean')) {
          sectionName = 'Cleanliness';
        }
      } else {
        // Use the label as section name for grouping
        sectionName = field.label || `Question ${index + 1}`;
      }
      
      if (!acc[sectionName]) {
        acc[sectionName] = {
          main: null,
          subsections: []
        };
      }
      
      if (field.isMain || (!acc[sectionName].main && acc[sectionName].subsections.length === 0)) {
        acc[sectionName].main = { ...field, index };
      } else {
        acc[sectionName].subsections.push({ ...field, index });
      }
      
      return acc;
    }, {});

    const hasResponse = (section: any) => {
      if (section.main) {
        const mainResponse = responses[section.main.id] || responses[section.main.index];
        if (mainResponse && mainResponse !== '') return true;
      }
      
      if (section.subsections && section.subsections.length > 0) {
        return section.subsections.some((field: any) => {
          const response = responses[field.id] || responses[field.index];
          return response && response !== '';
        });
      }
      
      return false;
    };

    return (
      <div className="space-y-4">
        {Object.entries(groupedFields)
          .filter(([sectionName, section]: [string, any]) => hasResponse(section))
          .map(([sectionName, section]: [string, any]) => (
            <Card key={sectionName} className="p-4 bg-white border-slate-200 shadow-sm">
              <div className="space-y-3">
                <div className="border-b border-slate-200 pb-2">
                  <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    {sectionName}
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                      section
                    </Badge>
                  </h4>
                </div>
                
                {section.main && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                      Response:
                    </div>
                    <div>
                      {renderResponse(section.main, responses[section.main.id] || responses[section.main.index])}
                    </div>
                  </div>
                )}
                
                {section.subsections.length > 0 && (
                  <div className="space-y-2">
                    {section.subsections.map((field: any, idx: number) => {
                      const response = responses[field.id] || responses[field.index];
                      if (!response) return null;
                      
                      return (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-blue-200 shadow-sm">
                          <div className="text-sm font-medium text-slate-700 mb-1">
                            {field.label || `Question ${field.index + 1}`}
                          </div>
                          <div className="text-sm">
                            {renderResponse(field, response)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {audits.map((audit) => (
        <Card key={audit.id} className="bg-white/90 backdrop-blur-md border-slate-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-sky-500/10 to-indigo-600/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl border border-white/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{audit.title || `Audit #${audit.id}`}</h3>
                  <p className="text-slate-300 text-sm">
                    {audit.user_profile?.full_name || 'Unknown User'} • {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                  {audit.form?.compliance?.name && (
                    <p className="text-slate-400 text-xs">{audit.form.compliance.name}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 rounded-lg text-sm font-medium ${
                  audit.result === 'pass' ? 'bg-green-500/20 text-green-200' :
                  audit.result === 'failed' ? 'bg-red-500/20 text-red-200' :
                  'bg-yellow-500/20 text-yellow-200'
                }`}>
                  {audit.result?.toUpperCase() || 'PENDING'}
                </div>
                {audit.percentage !== null && (
                  <div className="text-sm text-slate-300 mt-1">
                    Score: {audit.percentage}%
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {renderFormResponses(audit)}
          </div>
        </Card>
      ))}
    </div>
  );
}
