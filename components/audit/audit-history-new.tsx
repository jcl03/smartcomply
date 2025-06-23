"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MessageSquare,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Download,
  Search,
  Check,
  X,
  AlertTriangle,
  RefreshCcw,
  ShieldCheck,
  ShieldX,
  Shield,
  Undo2
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { approveAudit, rejectAudit, resetAuditVerification } from "@/app/protected/Audit/actions";
import { useToast } from "@/hooks/use-toast";

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
  form?: {
    id: number;
    form_schema: any;
    compliance_id: number;
    compliance: {
      name: string;
    }[];
  }[];
  user_profile?: {
    full_name: string;
    email: string;
  };
  verified_by_profile?: {
    full_name: string;
    email: string;
  };
  tenant?: {
    id: number;
    name: string;
  };
}

interface AuditHistoryProps {
  audits: AuditData[];
  isManager: boolean;
  currentUserId: string;
}

type SortField = 'created_at' | 'title' | 'result' | 'percentage' | 'user_name';
type SortDirection = 'asc' | 'desc';

export default function AuditHistoryComponent({ audits, isManager, currentUserId }: AuditHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isPending, startTransition] = useTransition();
  const [selectedAuditForVerification, setSelectedAuditForVerification] = useState<AuditData | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isCorrectiveActionDialogOpen, setIsCorrectiveActionDialogOpen] = useState(false);
  const [correctiveAction, setCorrectiveAction] = useState("");
  const { toast } = useToast();
  
  // Debug: Log audit data to see what user profiles we have
  useEffect(() => {
    console.log("Audit History Debug - Received audits:", audits.map(a => ({
      id: a.id,
      title: a.title,
      user_id: a.user_id,
      user_profile: a.user_profile
    })));
  }, [audits]);

  // Filter audits based on status filter and search query
  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    const auditTitle = audit.title || `Audit #${audit.id}`;
    const matchesSearch = searchQuery === "" || 
      auditTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audit.comments.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (audit.user_profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Sort audits
  const sortedAudits = [...filteredAudits].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      case 'title':
        aValue = a.title || `Audit #${a.id}`;
        bValue = b.title || `Audit #${b.id}`;
        break;
      case 'result':
        aValue = a.result || 'pending';
        bValue = b.result || 'pending';
        break;
      case 'percentage':
        aValue = a.percentage;
        bValue = b.percentage;
        break;
      case 'user_name':
        aValue = a.user_profile?.full_name || '';
        bValue = b.user_profile?.full_name || '';
        break;
      default:
        aValue = a.created_at;
        bValue = b.created_at;
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 text-slate-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 text-sky-600" />
      : <ArrowDown className="h-4 w-4 text-sky-600" />;
  };

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getResultBadge = (result: string | null, percentage: number) => {
    if (result === 'pass') {
      return <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/60 font-semibold px-2 py-1 text-xs shadow-sm">PASS</Badge>;
    } else if (result === 'failed') {
      return <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/60 font-semibold px-2 py-1 text-xs shadow-sm">FAILED</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200/60 font-semibold px-2 py-1 text-xs shadow-sm">PENDING</Badge>;
    }
  };
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };
  
  // Verification action handlers
  const handleApproveAudit = (audit: AuditData) => {
    if (!isManager) return;
    
    setSelectedAuditForVerification(audit);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('audit_id', audit.id.toString());
      
      const result = await approveAudit(formData);
      
      if (result.success) {
        toast({
          title: "Audit Approved",
          description: `Audit #${audit.id} has been successfully verified.`,
          variant: "default"
        });
        
        // Update the local audit state to reflect the change
        audit.verification_status = 'accepted';
        audit.verified_by = currentUserId;
        audit.verified_at = new Date().toISOString();
        audit.corrective_action = null;
        
        setSelectedAuditForVerification(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to approve audit",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleRejectDialogOpen = (audit: AuditData) => {
    if (!isManager) return;
    
    setSelectedAuditForVerification(audit);
    setIsRejectDialogOpen(true);
    setCorrectiveAction("");
  };
  
  const handleSubmitRejection = () => {
    if (!selectedAuditForVerification || !correctiveAction.trim()) {
      toast({
        title: "Error",
        description: "Please provide corrective actions before rejecting the audit",
        variant: "destructive"
      });
      return;
    }
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('audit_id', selectedAuditForVerification.id.toString());
      formData.append('corrective_action', correctiveAction);
      
      const result = await rejectAudit(formData);
      
      if (result.success) {
        toast({
          title: "Audit Rejected",
          description: `Audit #${selectedAuditForVerification.id} has been rejected with corrective actions.`,
          variant: "default"
        });
        
        // Update the local audit state to reflect the change
        selectedAuditForVerification.verification_status = 'rejected';
        selectedAuditForVerification.verified_by = currentUserId;
        selectedAuditForVerification.verified_at = new Date().toISOString();
        selectedAuditForVerification.corrective_action = correctiveAction;
        
        setIsRejectDialogOpen(false);
        setSelectedAuditForVerification(null);
        setCorrectiveAction("");
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reject audit",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleResetVerification = (audit: AuditData) => {
    if (!isManager) return;
    
    setSelectedAuditForVerification(audit);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append('audit_id', audit.id.toString());
      
      const result = await resetAuditVerification(formData);
      
      if (result.success) {
        toast({
          title: "Verification Reset",
          description: `Audit #${audit.id} verification status has been reset.`,
          variant: "default"
        });
        
        // Update the local audit state to reflect the change
        audit.verification_status = 'pending';
        audit.verified_by = null;
        audit.verified_at = null;
        audit.corrective_action = null;
        
        setSelectedAuditForVerification(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset verification status",
          variant: "destructive"
        });
      }
    });
  };
  
  const showCorrectiveAction = (audit: AuditData) => {
    if (audit.corrective_action) {
      setSelectedAuditForVerification(audit);
      setCorrectiveAction(audit.corrective_action);
      setIsCorrectiveActionDialogOpen(true);
    }
  };

  const downloadAuditReport = (format: 'csv' | 'pdf') => {
    const data = sortedAudits.map(audit => {
      const getUserName = () => {
        if (audit.user_profile?.full_name) {
          return audit.user_profile.full_name;
        }
        if (audit.user_profile?.email) {
          return audit.user_profile.email.split('@')[0];
        }
        if (audit.user_id === currentUserId) {
          return 'You';
        }
        return `User ${audit.user_id ? audit.user_id.slice(-4) : 'Unknown'}`;
      };

      return {
        'Audit ID': audit.id,
        'Title': audit.title || `Audit #${audit.id}`,
        'User': getUserName(),
        'Email': audit.user_profile?.email || '',
        'Status': audit.status,
        'Result': audit.result || 'Pending',
        'Score': `${audit.percentage}%`,
        'Marks': audit.marks,
        'Created Date': format === 'csv' ? audit.created_at : new Date(audit.created_at).toLocaleDateString(),
        'Last Modified': format === 'csv' ? audit.last_edit_at : new Date(audit.last_edit_at).toLocaleDateString(),
        'Comments': audit.comments
      };
    });

    if (format === 'csv') {
      const headers = Object.keys(data[0] || {});
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'pdf') {
      // For PDF generation, we'll create a formatted HTML that can be printed
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const htmlContent = `
          <html>
            <head>
              <title>Audit Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #334155; border-bottom: 2px solid #0ea5e9; padding-bottom: 10px; }
                .meta { margin-bottom: 20px; color: #64748b; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                th { background-color: #f8fafc; font-weight: bold; }
                .status-completed { color: #059669; font-weight: bold; }
                .status-pending { color: #d97706; font-weight: bold; }
                .status-draft { color: #6366f1; font-weight: bold; }
                .result-pass { color: #059669; font-weight: bold; }
                .result-failed { color: #dc2626; font-weight: bold; }
                .result-pending { color: #d97706; font-weight: bold; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <h1>Audit Report</h1>
              <div class="meta">
                <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
                <p><strong>Total Records:</strong> ${data.length}</p>
                <p><strong>Report Type:</strong> ${isManager ? 'Organization-wide' : 'Personal'} Audit History</p>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Audit ID</th>
                    <th>Title</th>
                    ${isManager ? '<th>User</th>' : ''}
                    <th>Status</th>
                    <th>Result</th>
                    <th>Score</th>
                    <th>Created Date</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.map(audit => `
                    <tr>
                      <td>${audit['Audit ID']}</td>
                      <td>${audit['Title']}</td>
                      ${isManager ? `<td>${audit['User']}</td>` : ''}
                      <td class="status-${audit['Status']}">${audit['Status'].toUpperCase()}</td>
                      <td class="result-${audit['Result'].toLowerCase()}">${audit['Result'].toUpperCase()}</td>
                      <td>${audit['Score']}</td>
                      <td>${new Date(audit['Created Date']).toLocaleDateString()}</td>
                      <td>${audit['Comments'].substring(0, 100)}${audit['Comments'].length > 100 ? '...' : ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </body>
          </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };
  
  const getVerificationBadge = (verificationStatus: string | null) => {
    if (verificationStatus === 'accepted') {
      return <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200/60 font-semibold px-2 py-1 text-xs shadow-sm">VERIFIED</Badge>;
    } else if (verificationStatus === 'rejected') {
      return <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/60 font-semibold px-2 py-1 text-xs shadow-sm">REJECTED</Badge>;
    } else if (verificationStatus === 'pending') {
      return <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200/60 font-semibold px-2 py-1 text-xs shadow-sm">PENDING REVIEW</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-gray-100 to-slate-100 text-gray-600 border-gray-200/60 font-semibold px-2 py-1 text-xs shadow-sm">NOT REVIEWED</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Reject Audit Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Audit</DialogTitle>
            <DialogDescription>
              Please provide corrective actions that need to be taken. This information will be shared with the auditor.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Textarea 
              placeholder="Describe required corrective actions..."
              className="min-h-[120px]"
              value={correctiveAction}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCorrectiveAction(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setCorrectiveAction("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitRejection}
              disabled={!correctiveAction.trim() || isPending}
            >
              {isPending ? "Rejecting..." : "Reject Audit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Corrective Action Dialog */}
      <Dialog open={isCorrectiveActionDialogOpen} onOpenChange={setIsCorrectiveActionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Corrective Actions Required</DialogTitle>
            <DialogDescription>
              The following corrective actions were requested by the manager.
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-2">
            <p className="text-sm text-slate-700">{correctiveAction}</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCorrectiveActionDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Audit Summary Section */}
      {sortedAudits.length > 0 && (
        <div>
          {/* Action Buttons */}
          <div className="flex justify-end mb-6 gap-2">
            <Button
              onClick={() => downloadAuditReport('csv')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              onClick={() => downloadAuditReport('pdf')}
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>

          {/* Filter Section */}
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/70 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-sm font-medium text-slate-700">
                <Filter className="h-4 w-4 text-slate-500" />
                <span>Status:</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                <Button 
                  size="sm" 
                  variant={statusFilter === "all" ? "default" : "outline"}
                  className="h-7 text-xs font-medium"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === "completed" ? "default" : "outline"}
                  className="h-7 text-xs font-medium"
                  onClick={() => setStatusFilter("completed")}
                >
                  Completed
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === "draft" ? "default" : "outline"}
                  className="h-7 text-xs font-medium"
                  onClick={() => setStatusFilter("draft")}
                >
                  Draft
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  className="h-7 text-xs font-medium"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
            
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search audits..."
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Audit Cards */}
          <Card className="overflow-hidden border border-slate-200/80">
            {/* Table Header */}
            <div className="bg-slate-50 border-b border-slate-100">
              <div className="grid grid-cols-12 gap-4 px-6 py-3">
                {/* Audit */}
                <div className="col-span-6 md:col-span-4">
                  <button
                    onClick={() => handleSort('title')}
                    className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Audit</span>
                    {getSortIcon('title')}
                  </button>
                </div>
                
                {/* User (Manager only) */}
                {isManager && (
                  <div className="col-span-6 md:col-span-2 hidden md:block">
                    <button
                      onClick={() => handleSort('user_name')}
                      className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                    >
                      <span>User</span>
                      {getSortIcon('user_name')}
                    </button>
                  </div>
                )}
                
                {/* Date */}
                <div className={`col-span-6 ${isManager ? 'md:col-span-2' : 'md:col-span-3'} hidden md:block`}>
                  <button
                    onClick={() => handleSort('created_at')}
                    className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Date</span>
                    {getSortIcon('created_at')}
                  </button>
                </div>
                
                {/* Result */}
                <div className={`col-span-6 ${isManager ? 'md:col-span-2' : 'md:col-span-2'} hidden md:block`}>
                  <button
                    onClick={() => handleSort('result')}
                    className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Result</span>
                    {getSortIcon('result')}
                  </button>
                </div>
                
                {/* Score */}
                <div className={`col-span-6 ${isManager ? 'md:col-span-1' : 'md:col-span-2'} hidden md:block`}>
                  <button
                    onClick={() => handleSort('percentage')}
                    className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    <span>Score</span>
                    {getSortIcon('percentage')}
                  </button>
                </div>
                
                {/* Actions */}
                <div className={`col-span-6 ${isManager ? 'md:col-span-1' : 'md:col-span-1'} hidden md:block`}>
                  <span className="font-semibold text-slate-700">Actions</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {sortedAudits.map((audit, index) => {
                const form = Array.isArray(audit.form) ? audit.form[0] : audit.form;
                const compliance = Array.isArray(form?.compliance) ? form?.compliance[0] : form?.compliance;
                
                return (
                  <div key={audit.id} className="px-6 py-4 hover:bg-slate-50/50 transition-colors group">
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-200">
                              <FileText className="h-4 w-4 text-slate-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 text-sm">
                                {audit.title || `Audit #${audit.id}`}
                              </h3>
                              <p className="text-xs text-slate-500">
                                {compliance?.name || `Form #${audit.form_id}` || 'General Audit'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(audit.created_at), 'MMM d, yyyy')}</span>
                            </div>
                            {isManager && audit.user_profile && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{audit.user_profile.full_name}</span>
                              </div>
                            )}
                            {audit.tenant && (
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500">•</span>
                                <span>{audit.tenant.name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getResultBadge(audit.result, audit.percentage)}
                              {getVerificationBadge(audit.verification_status)}
                              {audit.result && (
                                <span className={`text-sm font-semibold ${getPercentageColor(audit.percentage)}`}>
                                  {audit.percentage.toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Link 
                                href={`/protected/Audit/${audit.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-xs font-medium"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Link>
                              
                              {/* Mobile Manager Verification Actions */}
                              {isManager && (
                                <div className="flex items-center gap-1">
                                  {audit.verification_status === null || audit.verification_status === 'pending' ? (
                                    <>
                                      {/* Approve Button */}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 p-1 h-8 w-8"
                                        onClick={() => handleApproveAudit(audit)}
                                        disabled={isPending && selectedAuditForVerification?.id === audit.id}
                                      >
                                        <ShieldCheck className="h-4 w-4" />
                                      </Button>
                                      
                                      {/* Reject Button */}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 p-1 h-8 w-8"
                                        onClick={() => handleRejectDialogOpen(audit)}
                                        disabled={isPending && selectedAuditForVerification?.id === audit.id}
                                      >
                                        <ShieldX className="h-4 w-4" />
                                      </Button>
                                    </>
                                  ) : (
                                    <>
                                      {/* Show corrective action if rejected */}
                                      {audit.verification_status === 'rejected' && audit.corrective_action && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 p-1 h-8 w-8"
                                          onClick={() => showCorrectiveAction(audit)}
                                        >
                                          <AlertTriangle className="h-4 w-4" />
                                        </Button>
                                      )}
                                      
                                      {/* Reset Button */}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 p-1 h-8 w-8"
                                        onClick={() => handleResetVerification(audit)}
                                      >
                                        <Undo2 className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {audit.comments && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-700 line-clamp-2">{audit.comments}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:block">
                      <div className="grid grid-cols-12 gap-4 items-center">
                        {/* Audit Details */}
                        <div className="col-span-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-200 group-hover:from-sky-50 group-hover:to-blue-50 group-hover:border-sky-200 transition-all duration-300">
                              <FileText className="h-4 w-4 text-slate-600 group-hover:text-sky-600 transition-colors duration-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 text-sm truncate">
                                {audit.title || `Audit #${audit.id}`}
                              </h3>
                              <p className="text-xs text-slate-500 truncate">
                                {compliance?.name || `Form #${audit.form_id}` || 'General Audit'}
                              </p>
                              {audit.comments && (
                                <div className="flex items-center gap-1 mt-1">
                                  <MessageSquare className="h-3 w-3 text-slate-400" />
                                  <p className="text-xs text-slate-600 truncate max-w-48">
                                    {audit.comments}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* User (Manager only) */}
                        {isManager && (
                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-slate-400" />
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm text-slate-700 truncate">
                                  {(() => {
                                    if (audit.user_profile?.full_name && 
                                        !audit.user_profile.full_name.startsWith('User ') && 
                                        audit.user_profile.full_name !== 'You') {
                                      return audit.user_profile.full_name;
                                    }
                                    if (audit.user_profile?.email && 
                                        audit.user_profile.email !== '' && 
                                        !audit.user_profile.email.includes('unknown')) {
                                      return audit.user_profile.email.split('@')[0];
                                    }
                                    if (audit.user_id === currentUserId) {
                                      return 'You';
                                    }
                                    return `User ${audit.user_id ? audit.user_id.slice(-4) : 'Unknown'}`;
                                  })()}
                                </span>
                                {audit.user_profile?.email && 
                                 !audit.user_profile.email.includes('unknown') && 
                                 audit.user_profile.email !== '' && (
                                  <span className="text-xs text-slate-400 truncate">
                                    {audit.user_profile.email}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Date */}
                        <div className={`${isManager ? 'col-span-2' : 'col-span-3'}`}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="text-sm text-slate-700 font-medium">
                                {format(new Date(audit.created_at), 'MMM d, yyyy')}
                              </div>
                              <div className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Result */}
                        <div className={`${isManager ? 'col-span-2' : 'col-span-2'}`}>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {getResultIcon(audit.result)}
                              {getResultBadge(audit.result, audit.percentage)}
                            </div>
                            <div>
                              {getVerificationBadge(audit.verification_status)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className={`${isManager ? 'col-span-1' : 'col-span-2'}`}>
                          {audit.result ? (
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getPercentageColor(audit.percentage)}`}>
                                {audit.percentage.toFixed(1)}%
                              </div>
                              <div className="text-xs text-slate-500">
                                {audit.marks} pts
                              </div>
                            </div>
                          ) : (
                            <div className="text-center">
                              <div className="text-lg font-bold text-slate-400">-</div>
                              <div className="text-xs text-slate-400">Pending</div>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className={`${isManager ? 'col-span-1' : 'col-span-1'} flex justify-center items-center gap-1`}>
                          <Link 
                            href={`/protected/Audit/${audit.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            <Eye className="h-4 w-4" />
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                          
                          {/* Manager Verification Actions */}
                          {isManager && (
                            <div className="flex flex-col md:flex-row gap-1 ml-1">
                              {/* Show different actions based on verification status */}
                              {audit.verification_status === null || audit.verification_status === 'pending' ? (
                                <>
                                  {/* Approve Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                    onClick={() => handleApproveAudit(audit)}
                                    disabled={isPending && selectedAuditForVerification?.id === audit.id}
                                  >
                                    <ShieldCheck className="h-4 w-4" />
                                  </Button>
                                  
                                  {/* Reject Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                                    onClick={() => handleRejectDialogOpen(audit)}
                                    disabled={isPending && selectedAuditForVerification?.id === audit.id}
                                  >
                                    <ShieldX className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {/* Show corrective action if rejected */}
                                  {audit.verification_status === 'rejected' && audit.corrective_action && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
                                      onClick={() => showCorrectiveAction(audit)}
                                    >
                                      <AlertTriangle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  {/* Reset Button */}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                    onClick={() => handleResetVerification(audit)}
                                  >
                                    <Undo2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
