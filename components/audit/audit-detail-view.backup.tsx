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
  audit_data: any;  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;
    status: string;
    date_created: string;    compliance?: {
      id: number;
      name: string;
    } | null;
  } | null;user_profile?: {
    full_name: string;
    email: string;
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
      
      // Add some custom styling for PDF
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
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState<boolean>(false);
  
  // Function to handle PDF download
  const handleDownloadPDF = useCallback(async () => {
    if (!pdfRef.current) return;
    
    try {
      setIsPdfGenerating(true);
      
      // Temporarily display all sections for PDF generation
      const originalTab = activeTab;
      setActiveTab('overview');
      
      // Allow time for the state to update and render
      setTimeout(async () => {
        // Generate filename based on audit title or ID
        const filename = `${audit.title || `Audit_${audit.id}`}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        
        // Element to be converted to PDF
        const element = pdfRef.current;
        
        // Generate PDF with appropriate options
        await generatePDF(element, filename, {
          margin: { top: 10, right: 10, bottom: 15, left: 10 },
          format: 'a4',
          orientation: 'portrait',
          scale: 1.5,
          quality: 2,
          pagebreak: true
        });
        
        // Reset to original tab
        setActiveTab(originalTab);
        setIsPdfGenerating(false);
      }, 100);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setIsPdfGenerating(false);
    }
  }, [pdfRef, audit, activeTab]);
  
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
    }

    return (
      <div className="space-y-6">
        {formSchema.fields.map((field: any, index: number) => {
          const response = responses[field.id] || responses[index];
          
          return (
            <Card key={field.id || index} className="p-6 bg-white border-slate-200">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 text-lg">
                      {field.label || field.question || `Question ${index + 1}`}
                    </h4>
                    {field.description && (
                      <p className="text-slate-600 text-sm mt-1">{field.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {field.type || 'text'}
                  </Badge>
                </div>                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="text-sm text-slate-600 mb-1">Response:</div>
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
                                {/* Overlay with download/view buttons */}
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
                        
                        // For non-image responses, display as before
                        return responseStr;
                      })()
                    ) : (
                      <span className="text-slate-400 italic">No response provided</span>
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
            </Card>
          );
        })}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
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
              </div>              <div className="flex items-center gap-6 text-slate-600">
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
            }`}
          >
            Comments
          </button>
        </nav>
      </div>      {/* Tab Content */}
      <div ref={pdfRef} className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form Information */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Information</h3>              <div className="space-y-3">
                <div>
                  <span className="text-sm text-slate-600">Compliance Type:</span>                  <p className="font-medium text-slate-900">{compliance?.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Form Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {form?.status || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-slate-600">Form Created:</span>
                  <p className="text-slate-900">                    {form?.date_created 
                      ? format(new Date(form.date_created), 'MMM d, yyyy')
                      : 'N/A'
                    }
                  </p>
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
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No comments available for this audit</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* PDF Download Button - Always visible */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={handleDownloadPDF}
          className="flex items-center gap-2"
          variant="outline"
          size="lg"
          disabled={isPdfGenerating}
        >
          {isPdfGenerating ? (
            <span className="animate-spin">
              <Download className="h-5 w-5" />
            </span>
          ) : (
            <FileDown className="h-5 w-5" />
          )}
          {isPdfGenerating ? 'Generating PDF...' : 'Download PDF Report'}
        </Button>
      </div>

      {/* Hidden div for PDF generation - This will be converted to PDF */}
      <div ref={pdfRef} className="hidden">
        {/* PDF Content - Repeat the structure of the audit detail view */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{audit.title || `Audit #${audit.id}`}</h1>
          <div className="mb-4">
            <span className="text-sm text-slate-600">Compliance Type:</span>            <p className="font-medium text-slate-900">{compliance?.name || 'N/A'}</p>
          </div>
          <div className="mb-4">
            <span className="text-sm text-slate-600">Form Status:</span>
            <Badge variant="outline" className="ml-2">
              {form?.status || 'N/A'}
            </Badge>
          </div>
          <div className="mb-4">
            <span className="text-sm text-slate-600">Form Created:</span>
            <p className="text-slate-900">              {form?.date_created 
                ? format(new Date(form.date_created), 'MMM d, yyyy')
                : 'N/A'
              }
            </p>
          </div>

          {/* Audit Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

          {/* Audit Statistics */}
          {audit.result && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600">Final Result:</span>
                <div className="flex items-center gap-2">
                  {getResultIcon(audit.result)}
                  <span className="font-medium text-slate-900 capitalize">{audit.result}</span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-600">Score:</span>
                <span className="font-medium text-slate-900">{audit.marks} points</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Percentage:</span>
                <span className={`font-medium ${getPercentageColor(audit.percentage)}`}>
                  {audit.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          )}

          {/* Form Responses - Repeat the rendering logic for responses */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Form Responses</h3>
            {renderFormResponses()}
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Comments & Notes</h3>
            {audit.comments ? (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-slate-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm text-slate-600 mb-2">Audit Comments:</div>
                    <p className="text-slate-900 whitespace-pre-wrap">{audit.comments}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-600">No comments available for this audit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
