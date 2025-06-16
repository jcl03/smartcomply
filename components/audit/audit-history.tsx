"use client";

import { useState } from "react";
import { 
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Eye,
  MessageSquare,
  Filter
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";

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
  form: {
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
}

interface AuditHistoryProps {
  audits: AuditData[];
  isManager: boolean;
  currentUserId: string;
}

export default function AuditHistoryComponent({ audits, isManager, currentUserId }: AuditHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [resultFilter, setResultFilter] = useState<string>("all");

  // Filter audits based on filters only (removed search)
  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    const matchesResult = resultFilter === "all" || audit.result === resultFilter;
    
    return matchesStatus && matchesResult;
  });

  const getResultIcon = (result: string | null) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-amber-600" />;
    }
  };

  const getResultBadge = (result: string | null, percentage: number) => {
    if (result === 'pass') {
      return <Badge className="bg-green-100 text-green-800 border-green-200 font-medium">PASS</Badge>;
    } else if (result === 'failed') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 font-medium">FAILED</Badge>;
    } else {
      return <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">PENDING</Badge>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-8">
      {/* Header Stats & Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Passed Audits</p>
                <p className="text-3xl font-bold text-green-700">
                  {filteredAudits.filter(a => a.result === 'pass').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">Failed Audits</p>
                <p className="text-3xl font-bold text-red-700">
                  {filteredAudits.filter(a => a.result === 'failed').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Pending Audits</p>
                <p className="text-3xl font-bold text-amber-700">
                  {filteredAudits.filter(a => !a.result).length}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filter Controls */}
        <Card className="p-6 bg-white border-slate-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-slate-500" />
              <h3 className="font-semibold text-slate-900">Filters</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-sky-500 focus:ring-sky-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Result</label>
              <select
                value={resultFilter}
                onChange={(e) => setResultFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:border-sky-500 focus:ring-sky-500 text-sm"
              >
                <option value="all">All Results</option>
                <option value="pass">Pass</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Audit List */}
      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-slate-200 rounded-full w-fit mx-auto mb-4">
                <FileText className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No audits found</h3>
              <p className="text-slate-600">
                {statusFilter !== "all" || resultFilter !== "all" 
                  ? "Try adjusting your filter criteria to see more results."
                  : "No audits have been created yet. Create your first audit to get started."
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAudits.map((audit) => {
              const form = Array.isArray(audit.form) ? audit.form[0] : audit.form;
              const compliance = Array.isArray(form?.compliance) ? form?.compliance[0] : form?.compliance;
              
              return (
                <Card key={audit.id} className="overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left section - Audit Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 bg-slate-100 rounded-lg">
                                <FileText className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-xl">
                                  {audit.title || `Audit #${audit.id}`}
                                </h3>
                                <p className="text-sm text-slate-500">
                                  {compliance?.name || 'Unknown Form'}
                                </p>
                              </div>
                              {getResultBadge(audit.result, audit.percentage)}
                            </div>
                            
                            <div className="flex items-center gap-6 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}</span>
                              </div>
                              {isManager && audit.user_profile && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>By: {audit.user_profile.full_name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{format(new Date(audit.created_at), 'MMM d, yyyy')}</span>
                              </div>
                            </div>

                            {/* Comments Preview */}
                            {audit.comments && (
                              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                <div className="flex items-start gap-3">
                                  <MessageSquare className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-700 line-clamp-2">
                                      {audit.comments}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right section - Score and Actions */}
                      <div className="flex flex-col items-center lg:items-end gap-4 lg:w-48">
                        {/* Score Display */}
                        {audit.result && (
                          <div className="text-center lg:text-right">
                            <div className="flex items-center justify-center lg:justify-end gap-3 mb-3">
                              {getResultIcon(audit.result)}
                              <span className={`text-3xl font-bold ${getPercentageColor(audit.percentage)}`}>
                                {audit.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mb-3">
                              Score: {audit.marks} points
                            </div>
                            <div className="w-32 bg-slate-200 rounded-full h-3">
                              <div 
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  audit.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                                  audit.percentage >= 60 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                                  'bg-gradient-to-r from-red-500 to-red-600'
                                }`}
                                style={{ width: `${Math.min(audit.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <Link 
                          href={`/protected/Audit/${audit.id}`}
                          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg hover:from-sky-700 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Enhanced Summary Stats */}
      {filteredAudits.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-200 rounded-lg">
              <BarChart3 className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg">Performance Overview</h3>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 mb-1">{filteredAudits.length}</div>
              <div className="text-sm text-slate-600">Total Audits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {filteredAudits.filter(a => a.result === 'pass').length}
              </div>
              <div className="text-sm text-slate-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">
                {filteredAudits.filter(a => a.result === 'failed').length}
              </div>
              <div className="text-sm text-slate-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {filteredAudits.filter(a => !a.result).length}
              </div>
              <div className="text-sm text-slate-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-sky-600 mb-1">
                {filteredAudits.length > 0 ? 
                  Math.round((filteredAudits.filter(a => a.result === 'pass').length / filteredAudits.filter(a => a.result).length) * 100) || 0
                  : 0}%
              </div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
