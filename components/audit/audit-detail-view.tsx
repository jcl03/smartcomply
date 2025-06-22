"use client";

import { useState, useRef, useCallback } from "react";
import { 
  ArrowLeft,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  BarChart3,
  Info,
  Eye,
  Download,
  Share2,
  FileDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { generatePDF } from "@/utils/pdf-utils";

interface AuditDetailData {
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
  audit_data: any;
  verification_status: 'pending' | 'accepted' | 'rejected' | null;
  verified_by: string | null;
  verified_at: string | null;
  corrective_action: string | null;
  tenant_id: number;
  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;
    status: string;
    date_created: string;    
    compliance?: {
      id: number;
      name: string;
    } | null;
  } | null;
  user_profile?: {
    full_name: string;
    email: string;
  } | null;
  verified_by_profile?: {
    full_name: string;
    email: string;
  } | null;
  tenant?: {
    id: number;
    name: string;
  } | null;
}

interface AuditDetailViewProps {
  audit: AuditDetailData;
  isManager: boolean;
  currentUserId: string;
}

export default function AuditDetailView({ audit, isManager, currentUserId }: AuditDetailViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'comments'>('overview');
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
    // Function to handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Generate filename based on audit title or ID
      const filename = `${audit.title || `Audit_${audit.id}`}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      
      // Create complete PDF content with all tabs
      const pdfContainer = document.createElement('div');
      pdfContainer.innerHTML = pdfRef.current.innerHTML;
      pdfContainer.classList.add('pdf-container');
      
      // Style for print
      pdfContainer.style.padding = '20px';
      pdfContainer.style.backgroundColor = 'white';
      
      // Add e-signature section at the bottom
      const signatureDiv = document.createElement('div');
      signatureDiv.innerHTML = `
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
          <h3 style="font-weight: bold; margin-bottom: 15px;">E-Signature</h3>
          <div style="display: flex; margin-bottom: 10px;">
            <div style="width: 150px;">Audited by:</div>
            <div style="flex: 1; font-weight: bold;">${audit.user_profile?.full_name || audit.user_profile?.email || 'Unknown'}</div>
          </div>
          <div style="display: flex; margin-bottom: 10px;">
            <div style="width: 150px;">Date:</div>
            <div style="flex: 1; font-weight: bold;">${format(new Date(audit.last_edit_at), 'MMMM dd, yyyy')}</div>
          </div>
          <div style="display: flex; margin-bottom: 10px;">
            <div style="width: 150px;">Signature ID:</div>
            <div style="flex: 1; font-weight: bold;">${audit.id}-${audit.user_id.substring(0, 8)}</div>
          </div>
        </div>
      `;
      pdfContainer.appendChild(signatureDiv);
      
      // Add to DOM temporarily for conversion
      document.body.appendChild(pdfContainer);
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      
      // Generate PDF
      await generatePDF(pdfContainer, filename, {
        margin: { top: 10, right: 10, bottom: 15, left: 10 },
        format: 'a4',
        orientation: 'portrait',
        scale: 1.5,
        quality: 2,
        pagebreak: true
      });
      
      // Clean up
      document.body.removeChild(pdfContainer);
      setIsPdfGenerating(false);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsPdfGenerating(false);
    }
  }, [pdfRef, audit]);
  
  // Helper function to get form and compliance data
  const getFormData = () => {
    const form = audit.form;
    const compliance = form?.compliance;
    return { form, compliance };
  };

  const { form, compliance } = getFormData();

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getResultBadge = (result: string | null) => {
    if (result === 'pass') {
      return <Badge className="bg-green-100 text-green-800 border-green-200 text-lg px-3 py-1">PASS</Badge>;
    } else if (result === 'failed') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 text-lg px-3 py-1">FAILED</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-lg px-3 py-1">PENDING</Badge>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  const renderFormResponses = () => {
    if (!audit.audit_data) {
      return (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No response data available</p>
        </div>
      );
    }

    const responses = audit.audit_data.responses || audit.audit_data;
    const formSchema = form?.form_schema;

    if (!formSchema || !formSchema.fields) {
      return (
        <div className="text-center py-8">
          <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Form schema not available</p>
        </div>
      );
    }    // Group fields by section structure
    const groupedFields = formSchema.fields.reduce((acc: any, field: any, index: number) => {
      const fieldLabel = field.label || field.question || `Question ${index + 1}`;
      
      // Group all kitchen-related fields under "Kitchen Clean Level"
      if (fieldLabel.toLowerCase().includes('kitchen')) {
        if (!acc['Kitchen Clean Level']) {
          acc['Kitchen Clean Level'] = { subsections: [] };
        }
        
        // Don't show "Kitchen Clean Level" as a subsection since it's the section title
        if (!fieldLabel.toLowerCase().includes('clean level')) {
          acc['Kitchen Clean Level'].subsections.push({ ...field, index });
        }
      } 
      // Group floor-related fields and "Question 4" under "Floor Cleanliness"
      else if (fieldLabel.toLowerCase().includes('floor') || fieldLabel === 'Question 4') {
        if (!acc['Floor Cleanliness']) {
          acc['Floor Cleanliness'] = { subsections: [] };
        }
        
        // Don't show "Floor Cleanliness" as a subsection since it's the section title
        if (!fieldLabel.toLowerCase().includes('cleanliness')) {
          acc['Floor Cleanliness'].subsections.push({ ...field, index });
        }
      } else {
        // For other fields, treat as individual sections
        acc[fieldLabel] = { main: { ...field, index }, subsections: [] };
      }
      
      return acc;
    }, {});    const renderField = (field: any, isSubsection = false) => {
      const response = responses[field.id] || responses[field.index];
        return (
        <div key={field.id || field.index} className={isSubsection ? 'ml-4 relative group' : 'group'}>
          {isSubsection && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-200 to-blue-300 rounded-full group-hover:from-blue-300 group-hover:to-blue-400 transition-all duration-200"></div>
          )}
          <div className={`space-y-3 transition-all duration-200 ${isSubsection 
            ? 'ml-6 p-4 bg-blue-50/30 hover:bg-blue-50/50 rounded-lg border border-blue-100 hover:border-blue-200 hover:shadow-sm' 
            : 'hover:bg-slate-50/50 rounded-lg p-2 -m-2'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className={isSubsection 
                  ? 'font-semibold text-slate-800 text-base flex items-center gap-2' 
                  : 'font-semibold text-slate-900 text-lg'
                }>
                  {isSubsection && <span className="text-blue-500">▸</span>}
                  {field.label || field.question || `Question ${field.index + 1}`}
                </h4>
                {field.description && (
                  <p className="text-slate-600 text-sm mt-1">{field.description}</p>
                )}
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${isSubsection ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}`}
              >
                {field.type || 'text'}
              </Badge>
            </div>
            
            <div className={`rounded-lg p-4 border ${isSubsection 
              ? 'bg-white border-blue-200 shadow-sm' 
              : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-500" />
                Response:
              </div>
              <div className="text-slate-900">
                {response ? (
                  (() => {
                    const responseStr = typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response);
                    
                    // Check if response is an image URL
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
                              className="max-w-full h-auto max-h-96 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(response, '_blank');
                                  }}
                                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                                  title="View full size"
                                >
                                  <Eye className="h-4 w-4 text-slate-700" />
                                </button>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = response;
                                    link.download = `${field.label || 'image'}.jpg`;
                                    link.click();
                                  }}
                                  className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                                  title="Download image"
                                >
                                  <Download className="h-4 w-4 text-slate-700" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 font-mono break-all bg-slate-100 p-2 rounded border">
                            {response}
                          </div>
                        </div>
                      );
                    }
                    
                    return responseStr;
                  })()                ) : (
                  <div className="flex items-center gap-2 text-slate-400">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                    <span className="italic">No response provided</span>
                  </div>
                )}
              </div>
            </div>

            {field.required && !response && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <XCircle className="h-4 w-4" />
                <span>Required field not completed</span>
              </div>
            )}
          </div>
        </div>
      );    };

    // Helper function to check if a section has any responses
    const hasResponse = (section: any) => {
      // Check main field response
      if (section.main) {
        const mainResponse = responses[section.main.id] || responses[section.main.index];
        if (mainResponse && mainResponse !== '') return true;
      }
      
      // Check subsection responses
      if (section.subsections && section.subsections.length > 0) {
        return section.subsections.some((field: any) => {
          const response = responses[field.id] || responses[field.index];
          return response && response !== '';
        });
      }
      
      return false;
    };

    return (
      <div className="space-y-6">
        {Object.entries(groupedFields)
          .filter(([sectionName, section]: [string, any]) => hasResponse(section))
          .map(([sectionName, section]: [string, any]) => (
          <Card key={sectionName} className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-4">
              <div className="border-b border-gradient-to-r from-slate-200 to-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  {sectionName}
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                    section
                  </Badge>
                </h3>
              </div>
                {section.main && section.subsections.length > 0 && renderField(section.main)}
              
              {section.subsections.length > 0 && (
                <div className="space-y-4 mt-6">
                  <div className="text-sm font-medium text-slate-600 mb-3 pl-4 border-l-2 border-blue-200">
                    Subsections ({section.subsections.length})
                  </div>
                  {section.subsections.map((field: any) => renderField(field, true))}
                </div>
              )}
              
              {/* For sections without subsections, show the main field content directly */}
              {section.main && section.subsections.length === 0 && (
                <div className="mt-4">
                  {(() => {
                    const field = section.main;
                    const response = responses[field.id] || responses[field.index];
                    return (
                      <div className="space-y-3">
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                          <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-slate-500" />
                            Response:
                          </div>                          <div className="text-slate-900">
                            {response ? (
                              (() => {
                                const responseStr = typeof response === 'object' ? JSON.stringify(response, null, 2) : String(response);
                                
                                // Check if response is an image URL
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
                                          className="max-w-full h-auto max-h-96 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
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
                                
                                return responseStr;
                              })()
                            ) : (
                              <div className="flex items-center gap-2 text-slate-400">
                                <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                                <span className="italic">No response provided</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {field.required && !response && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <XCircle className="h-4 w-4" />
                            This field is required
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </Card>        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link 
          href="/protected/Audit"
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Audit History
        </Link>
        
        <Button 
          onClick={handleDownloadPDF}
          disabled={isPdfGenerating}
          className="flex items-center gap-2"
          variant="outline"
        >
          {isPdfGenerating ? (
            <>Generating PDF...</>
          ) : (
            <>
              <FileDown className="h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      </div>

      {/* Main Audit Info Card */}
      <Card className="p-8 bg-white border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left Section - Audit Details */}
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {audit.title || `Audit #${audit.id}`}
                </h1>
                {getResultBadge(audit.result)}
              </div>
              
              <div className="flex items-center gap-6 text-slate-600">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">
                    {compliance?.name || (form?.id ? `Form #${form?.id}` : 'Unknown Form')}
                  </span>
                </div>
                {isManager && (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>
                      Audited by: {audit.user_profile?.full_name || audit.user_profile?.email || 'Loading...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Created:</span>
                  <span className="font-medium text-slate-900">
                    {format(new Date(audit.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Last Modified:</span>
                  <span className="font-medium text-slate-900">
                    {formatDistanceToNow(new Date(audit.last_edit_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Info className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Status:</span>
                  <Badge variant="outline" className="text-xs">
                    {audit.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600">Form Type:</span>
                  <span className="font-medium text-slate-900">
                    {compliance?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Score */}
          {audit.result && (
            <div className="lg:text-right">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <div className="text-center lg:text-right space-y-3">
                  <div className="flex items-center justify-center lg:justify-end gap-3">
                    {getResultIcon(audit.result)}
                    <span className={`text-4xl font-bold ${getPercentageColor(audit.percentage)}`}>
                      {audit.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Score: {audit.marks} points
                  </div>
                  <div className="w-32 bg-slate-200 rounded-full h-3 mx-auto lg:mx-0 lg:ml-auto">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        audit.percentage >= 80 ? 'bg-green-500' : 
                        audit.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(audit.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'responses'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Form Responses
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'comments'
                ? 'border-sky-500 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}          >
            Comments
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Information */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Compliance Type:</span>
                  <p className="font-medium text-slate-900">{compliance?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Form Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {form?.status || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Form Created:</span>
                  <p className="text-slate-900">
                    {form?.date_created 
                      ? format(new Date(form.date_created), 'MMM d, yyyy')
                      : 'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Tenant:</span>
                  <p className="font-medium text-slate-900">{audit.tenant?.name || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Audit Statistics */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Audit Statistics</h3>
              <div className="space-y-4">
                {audit.result && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Final Result:</span>
                      <div className="flex items-center gap-2">
                        {getResultIcon(audit.result)}
                        <span className="font-medium text-slate-900 capitalize">{audit.result}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Score:</span>
                      <span className="font-medium text-slate-900">{audit.marks} points</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Percentage:</span>
                      <span className={`font-medium ${getPercentageColor(audit.percentage)}`}>
                        {audit.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Status:</span>
                  <Badge variant="outline">{audit.status}</Badge>
                </div>
              </div>
            </Card>

            {/* Verification Status */}
            <Card className="p-6 bg-white border-slate-200 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Verification Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600">Verification Status:</span>
                  <div className="mt-1">
                    {audit.verification_status ? (
                      <Badge 
                        className={`
                          ${audit.verification_status === 'accepted' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                          ${audit.verification_status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                          ${audit.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                        `}
                      >
                        {audit.verification_status.charAt(0).toUpperCase() + audit.verification_status.slice(1)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Yet Verified</Badge>
                    )}
                  </div>
                </div>
                
                {audit.verified_by_profile && (
                  <div>
                    <span className="text-sm text-slate-600">Verified By:</span>
                    <p className="font-medium text-slate-900">{audit.verified_by_profile.full_name}</p>
                    <p className="text-sm text-slate-500">{audit.verified_by_profile.email}</p>
                  </div>
                )}
                
                {audit.verified_at && (
                  <div>
                    <span className="text-sm text-slate-600">Verified At:</span>
                    <p className="text-slate-900">
                      {format(new Date(audit.verified_at), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                
                {audit.corrective_action && (
                  <div className="md:col-span-2">
                    <span className="text-sm text-slate-600">Corrective Action:</span>
                    <div className="mt-1 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <p className="text-slate-900 whitespace-pre-wrap">{audit.corrective_action}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'responses' && (
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Form Responses</h3>
            {renderFormResponses()}
          </Card>
        )}

        {activeTab === 'comments' && (
          <Card className="p-6 bg-white border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Comments & Notes</h3>
            {audit.comments ? (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600 mb-2">Audit Comments:</div>
                    <p className="text-slate-900 whitespace-pre-wrap">{audit.comments}</p>
                  </div>
                </div>
              </div>            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No comments available for this audit</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Hidden content for PDF generation - includes ALL tabs */}
      <div ref={pdfRef} className="hidden">
        {/* PDF Header with Professional Layout */}
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #334155', paddingBottom: '20px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            SmartComply Audit Report
          </div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '15px' }}>
            {audit.title || `Audit Report #${audit.id}`}
          </div>
          
          {/* Header Information Table */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', marginTop: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: '#f8fafc' }}>
              <div style={{ padding: '10px', borderRight: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Date:</div>
              <div style={{ padding: '10px', borderRight: '1px solid #cbd5e1', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Day:</div>
              <div style={{ padding: '10px', fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>Time:</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', backgroundColor: 'white' }}>
              <div style={{ padding: '10px', borderRight: '1px solid #cbd5e1', fontSize: '13px' }}>
                {format(new Date(audit.created_at), 'MMMM dd, yyyy')}
              </div>
              <div style={{ padding: '10px', borderRight: '1px solid #cbd5e1', fontSize: '13px' }}>
                {format(new Date(audit.created_at), 'EEEE')}
              </div>
              <div style={{ padding: '10px', fontSize: '13px' }}>
                {format(new Date(audit.created_at), 'HH:mm')}
              </div>
            </div>
          </div>
        </div>

        {/* Objective Section */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', minWidth: '100px' }}>OBJECTIVE</span>
            <span style={{ fontSize: '14px', color: '#334155' }}>:</span>
            <span style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
              To monitor and assess compliance standards through systematic audit procedures. 
              This audit ensures that all requirements are met according to the specified compliance framework: {compliance?.name || 'N/A'}.
            </span>
          </div>
        </div>

        {/* Method Section */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', minWidth: '100px' }}>METHOD</span>
            <span style={{ fontSize: '14px', color: '#334155' }}>:</span>
            <span style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
              The audit was conducted using a structured assessment form with standardized evaluation criteria. 
              Performance score calculation was completed at the end of the audit process.
            </span>
          </div>
        </div>

        {/* Scale Section */}
        <div style={{ marginBottom: '25px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px', backgroundColor: '#f8fafc' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', marginBottom: '10px' }}>SCALE:</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', fontSize: '12px' }}>
            <div><strong>5 = Excellent</strong> : Exceeds all standards</div>
            <div><strong>4 = Good</strong> : Meets all standards</div>
            <div><strong>3 = Fair</strong> : Minor improvements needed</div>
            <div><strong>2 = Poor</strong> : Standards not met</div>
            <div><strong>1 = Very poor</strong> : Significant deficiencies</div>
          </div>
        </div>

        {/* Audit Information Grid */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', marginBottom: '8px' }}>Audit Information</div>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '4px' }}><strong>Compliance Type:</strong> {compliance?.name || 'N/A'}</div>
                <div style={{ marginBottom: '4px' }}><strong>Form Status:</strong> {form?.status || 'N/A'}</div>
                <div style={{ marginBottom: '4px' }}><strong>Created:</strong> {format(new Date(audit.created_at), 'MMM d, yyyy h:mm a')}</div>
                <div><strong>Last Modified:</strong> {format(new Date(audit.last_edit_at), 'MMM d, yyyy h:mm a')}</div>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1e293b', marginBottom: '8px' }}>Audit Results</div>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                {audit.result && (
                  <>
                    <div style={{ marginBottom: '4px' }}><strong>Final Result:</strong> <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: audit.result === 'pass' ? '#059669' : '#dc2626' }}>{audit.result}</span></div>
                    <div style={{ marginBottom: '4px' }}><strong>Score:</strong> {audit.marks} points</div>
                    <div style={{ marginBottom: '4px' }}><strong>Percentage:</strong> {audit.percentage.toFixed(1)}%</div>
                  </>
                )}
                <div style={{ marginBottom: '4px' }}><strong>Audited by:</strong> {audit.user_profile?.full_name || audit.user_profile?.email || 'Unknown'}</div>
                <div><strong>Status:</strong> {audit.status}</div>
              </div>
            </div>        </div>

        {/* Form Responses Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
            📋 FORM RESPONSES
          </div>
          {(() => {
            if (!audit.audit_data) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div>No response data available</div>
                </div>
              );
            }

            const responses = audit.audit_data.responses || audit.audit_data;
            const formSchema = form?.form_schema;

            if (!formSchema || !formSchema.fields) {
              return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <div>Form schema not available</div>
                </div>
              );
            }

            return (
              <div style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Table Header */}
                <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px 200px', gap: '16px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>
                    <div style={{ textAlign: 'center' }}>No</div>
                    <div>Item</div>
                    <div>Response</div>
                    <div style={{ textAlign: 'center' }}>Marks Received</div>
                    <div style={{ textAlign: 'center' }}>Remark / Action Required</div>
                  </div>
                </div>                {/* Table Body - Using the same grouping logic as main view */}
                <div>
                  {(() => {
                    // Use the same grouping logic as the main view
                    const groupedFields = formSchema.fields.reduce((acc: any, field: any, index: number) => {
                      const fieldLabel = field.label || field.question || `Question ${index + 1}`;
                      
                      // Group all kitchen-related fields under "Kitchen Clean Level"
                      if (fieldLabel.toLowerCase().includes('kitchen')) {
                        if (!acc['Kitchen Clean Level']) {
                          acc['Kitchen Clean Level'] = { subsections: [] };
                        }
                        
                        // Don't show "Kitchen Clean Level" as a subsection since it's the section title
                        if (!fieldLabel.toLowerCase().includes('clean level')) {
                          acc['Kitchen Clean Level'].subsections.push({ ...field, index });
                        }
                      } 
                      // Group floor-related fields and "Question 4" under "Floor Cleanliness"
                      else if (fieldLabel.toLowerCase().includes('floor') || fieldLabel === 'Question 4') {
                        if (!acc['Floor Cleanliness']) {
                          acc['Floor Cleanliness'] = { subsections: [] };
                        }
                        
                        // Don't show "Floor Cleanliness" as a subsection since it's the section title
                        if (!fieldLabel.toLowerCase().includes('cleanliness')) {
                          acc['Floor Cleanliness'].subsections.push({ ...field, index });
                        }
                      } else {
                        // For other fields, treat as individual sections
                        acc[fieldLabel] = { main: { ...field, index }, subsections: [] };
                      }
                      
                      return acc;
                    }, {});

                    // Helper function to check if a section has any responses (same as main view)
                    const hasResponse = (section: any) => {
                      // Check main field response
                      if (section.main) {
                        const mainResponse = responses[section.main.id] || responses[section.main.index];
                        if (mainResponse && mainResponse !== '') return true;
                      }
                      
                      // Check subsection responses
                      if (section.subsections && section.subsections.length > 0) {
                        return section.subsections.some((field: any) => {
                          const response = responses[field.id] || responses[field.index];
                          return response && response !== '';
                        });
                      }
                      
                      return false;
                    };

                    let itemNumber = 1;

                    return Object.entries(groupedFields)
                      .filter(([sectionName, section]: [string, any]) => hasResponse(section))
                      .map(([sectionName, section]: [string, any]) => (
                      <div key={sectionName}>                        <div style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #cbd5e1', padding: '12px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📋 {sectionName}
                          </div>
                        </div>

                        {/* Render main field if exists and has subsections */}
                        {section.main && section.subsections.length > 0 && (() => {
                          const field = section.main;
                          const response = responses[field.id] || responses[field.index];
                          if (response && response !== '') {
                            const responseStr = typeof response === 'object' ? JSON.stringify(response) : String(response);
                            let marks = '';
                            if (field.type === 'radio' || field.type === 'select') {
                              if (field.enhancedOptions) {
                                const selectedOption = field.enhancedOptions.find((opt: any) => opt.value === response);
                                marks = selectedOption ? selectedOption.points.toString() : '0';
                              } else {
                                marks = response ? '1' : '0';
                              }
                            } else if (field.weightage) {
                              marks = response ? field.weightage.toString() : '0';
                            } else {
                              marks = response ? '1' : '0';
                            }
                            
                            const currentItemNumber = itemNumber++;
                            return (
                              <div style={{ borderBottom: '1px solid #e2e8f0', padding: '12px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px 200px', gap: '16px', fontSize: '13px' }}>
                                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentItemNumber}</div>
                                  <div style={{ fontWeight: '600' }}>
                                    {field.label || field.question || `Question ${field.index + 1}`}
                                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Type: {field.type}</div>
                                  </div>
                                  <div style={{ lineHeight: '1.4' }}>
                                    {field.type === 'image' && response && (response.includes('supabase.co/storage') || response.includes('image') || response.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>📷 Image uploaded</div>
                                    ) : (
                                      <div style={{ wordBreak: 'break-word' }}>{responseStr}</div>
                                    )}
                                  </div>
                                  <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>{marks}</div>
                                  <div style={{ textAlign: 'center', fontSize: '12px', color: marks === '0' ? '#dc2626' : '#059669', fontWeight: '500' }}>
                                    {marks === '0' ? 'FAILED' : 'Completed'}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {/* Render subsections */}
                        {section.subsections.map((field: any) => {
                          const response = responses[field.id] || responses[field.index];
                          if (!response || response === '') return null;
                          
                          const responseStr = typeof response === 'object' ? JSON.stringify(response) : String(response);
                          let marks = '';
                          if (field.type === 'radio' || field.type === 'select') {
                            if (field.enhancedOptions) {
                              const selectedOption = field.enhancedOptions.find((opt: any) => opt.value === response);
                              marks = selectedOption ? selectedOption.points.toString() : '0';
                            } else {
                              marks = response ? '1' : '0';
                            }
                          } else if (field.weightage) {
                            marks = response ? field.weightage.toString() : '0';
                          } else {
                            marks = response ? '1' : '0';
                          }
                          
                          const currentItemNumber = itemNumber++;
                          
                          return (
                            <div key={field.id || field.index} style={{ borderBottom: '1px solid #e2e8f0', padding: '12px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px 200px', gap: '16px', fontSize: '13px' }}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentItemNumber}</div>
                                <div style={{ fontWeight: '600', paddingLeft: '20px' }}>
                                  ▸ {field.label || field.question || `Question ${field.index + 1}`}
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Type: {field.type}</div>
                                </div>
                                <div style={{ lineHeight: '1.4' }}>
                                  {field.type === 'image' && response && (response.includes('supabase.co/storage') || response.includes('image') || response.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>📷 Image uploaded</div>
                                  ) : (
                                    <div style={{ wordBreak: 'break-word' }}>{responseStr}</div>
                                  )}
                                </div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>{marks}</div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: marks === '0' ? '#dc2626' : '#059669', fontWeight: '500' }}>
                                  {marks === '0' ? 'FAILED' : 'Completed'}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Render main field content if no subsections */}
                        {section.main && section.subsections.length === 0 && (() => {
                          const field = section.main;
                          const response = responses[field.id] || responses[field.index];
                          if (!response || response === '') return null;
                          
                          const responseStr = typeof response === 'object' ? JSON.stringify(response) : String(response);
                          let marks = '';
                          if (field.type === 'radio' || field.type === 'select') {
                            if (field.enhancedOptions) {
                              const selectedOption = field.enhancedOptions.find((opt: any) => opt.value === response);
                              marks = selectedOption ? selectedOption.points.toString() : '0';
                            } else {
                              marks = response ? '1' : '0';
                            }
                          } else if (field.weightage) {
                            marks = response ? field.weightage.toString() : '0';
                          } else {
                            marks = response ? '1' : '0';
                          }
                          
                          const currentItemNumber = itemNumber++;
                          
                          return (
                            <div style={{ borderBottom: '1px solid #e2e8f0', padding: '12px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px 200px', gap: '16px', fontSize: '13px' }}>
                                <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{currentItemNumber}</div>
                                <div style={{ fontWeight: '600' }}>
                                  {field.label || field.question || `Question ${field.index + 1}`}
                                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Type: {field.type}</div>
                                </div>
                                <div style={{ lineHeight: '1.4' }}>
                                  {field.type === 'image' && response && (response.includes('supabase.co/storage') || response.includes('image') || response.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? (
                                    <div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>📷 Image uploaded</div>
                                  ) : (
                                    <div style={{ wordBreak: 'break-word' }}>{responseStr}</div>
                                  )}
                                </div>
                                <div style={{ textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>{marks}</div>
                                <div style={{ textAlign: 'center', fontSize: '12px', color: marks === '0' ? '#dc2626' : '#059669', fontWeight: '500' }}>
                                  {marks === '0' ? 'FAILED' : 'Completed'}
                                </div>
                              </div>
                            </div>                          );
                        })()}
                      </div>
                    ));
                  })()}
                </div>

                {/* Table Footer Summary */}
                <div style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #cbd5e1', padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr 1fr 120px 200px', gap: '16px', fontWeight: 'bold', fontSize: '14px', color: '#334155' }}>
                    <div></div>
                    <div>TOTAL</div>
                    <div></div>
                    <div style={{ textAlign: 'center', color: '#059669' }}>
                      {audit.marks}
                    </div>
                    <div style={{ textAlign: 'center', color: audit.result === 'pass' ? '#059669' : '#dc2626' }}>
                      {audit.result === 'pass' ? 'PASS' : audit.result === 'failed' ? 'FAILED' : 'PENDING'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Comments Section */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#1e293b', marginBottom: '15px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
            💬 COMMENTS & NOTES
          </div>
          <div style={{ padding: '15px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            {audit.comments ? (
              <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>Audit Comments:</div>                    <div style={{ color: '#1e293b', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{audit.comments}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                <div>No comments available for this audit</div>
              </div>
            )}
          </div>        </div>
      </div>
    </div>
    </div>
  );
}
