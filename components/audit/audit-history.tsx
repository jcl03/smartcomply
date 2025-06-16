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
      return <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200/60 font-semibold px-3 py-1 shadow-sm">PASS</Badge>;
    } else if (result === 'failed') {
      return <Badge className="bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200/60 font-semibold px-3 py-1 shadow-sm">FAILED</Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200/60 font-semibold px-3 py-1 shadow-sm">PENDING</Badge>;
    }
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-amber-600";
    return "text-red-600";
  };  return (
    <div className="space-y-6">
      <div className="space-y-6">          {/* Modern Filter Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                {filteredAudits.length} {filteredAudits.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            
            <Card className="p-4 bg-white/90 backdrop-blur-sm border border-slate-200/60 shadow-lg rounded-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Filters</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  
                  <div>
                    <select
                      value={resultFilter}
                      onChange={(e) => setResultFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white hover:border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                    >
                      <option value="all">All Results</option>
                      <option value="pass">Pass</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          </div>      {/* Audit List */}
      <div className="space-y-4">
        {filteredAudits.length === 0 ? (
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200/60 shadow-lg rounded-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sky-400/5 to-blue-500/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="relative mb-6">
                  <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl w-fit mx-auto shadow-inner">
                    <FileText className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-100 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No audits found</h3>
                <p className="text-slate-600 leading-relaxed">
                  {statusFilter !== "all" || resultFilter !== "all" 
                    ? "Try adjusting your filter criteria to see more results, or clear all filters to view the complete audit history."
                    : "No audits have been created yet. Start your compliance journey by creating your first audit to track and monitor your organization's performance."
                  }
                </p>
                {(statusFilter !== "all" || resultFilter !== "all") && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setResultFilter("all");
                    }}
                    className="mt-4 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredAudits.map((audit) => {
              const form = Array.isArray(audit.form) ? audit.form[0] : audit.form;
              const compliance = Array.isArray(form?.compliance) ? form?.compliance[0] : form?.compliance;
                return (
                <Card key={audit.id} className="group relative overflow-hidden bg-white border border-slate-200/60 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300 hover:border-slate-300/60 rounded-2xl">
                  {/* Subtle background pattern */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-sky-50/50 to-blue-50/50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
                  
                  <div className="relative p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Left section - Audit Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="relative">
                                <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl border border-slate-200 group-hover:from-sky-50 group-hover:to-blue-50 group-hover:border-sky-200 transition-all duration-300">
                                  <FileText className="h-6 w-6 text-slate-600 group-hover:text-sky-600 transition-colors duration-300" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <h3 className="font-bold text-slate-900 text-xl lg:text-2xl">
                                    {audit.title || `Audit #${audit.id}`}
                                  </h3>
                                  {getResultBadge(audit.result, audit.percentage)}
                                </div>
                                <p className="text-sm text-slate-500 font-medium">
                                  {compliance?.name || `Form #${audit.form_id}` || 'General Audit'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-slate-600 mb-4">
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}</span>
                              </div>
                              {isManager && audit.user_profile && (
                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                  <User className="h-4 w-4 text-slate-400" />
                                  <span className="font-medium">By: {audit.user_profile.full_name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                <Clock className="h-4 w-4 text-slate-400" />
                                <span className="font-medium">{format(new Date(audit.created_at), 'MMM d, yyyy')}</span>
                              </div>
                            </div>

                            {/* Enhanced Comments Preview */}
                            {audit.comments && (
                              <div className="relative bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-200/60">
                                <div className="flex items-start gap-3">
                                  <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                    <MessageSquare className="h-4 w-4 text-slate-400" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
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
                      <div className="flex flex-col items-center lg:items-end gap-4 lg:w-56">
                        {/* Enhanced Score Display */}
                        {audit.result && (
                          <div className="text-center lg:text-right">
                            <div className="flex items-center justify-center lg:justify-end gap-3 mb-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                {getResultIcon(audit.result)}
                              </div>
                              <span className={`text-3xl lg:text-4xl font-bold ${getPercentageColor(audit.percentage)}`}>
                                {audit.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="text-sm text-slate-600 mb-4 font-medium">
                              Score: {audit.marks} points
                            </div>
                            <div className="w-36 bg-slate-200 rounded-full h-3 shadow-inner">
                              <div 
                                className={`h-3 rounded-full transition-all duration-700 shadow-sm ${
                                  audit.percentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
                                  audit.percentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                                  'bg-gradient-to-r from-red-400 to-rose-500'
                                }`}
                                style={{ width: `${Math.min(audit.percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Enhanced Action Button */}
                        <Link 
                          href={`/protected/Audit/${audit.id}`}
                          className="group/btn flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl hover:from-sky-600 hover:to-blue-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                        >
                          <Eye className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
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
      </div>      {/* Enhanced Performance Overview */}
      {filteredAudits.length > 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200/60 shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-sky-400/5 to-blue-500/5 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/5 to-green-500/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl shadow-inner">
                <BarChart3 className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Performance Overview</h3>
                <p className="text-slate-600 text-sm">Comprehensive audit analytics and insights</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center group">
                <div className="relative mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-slate-900 group-hover:scale-110 transition-transform duration-300">
                    {filteredAudits.length}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Total Audits</div>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                    {filteredAudits.filter(a => a.result === 'pass').length}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full opacity-60"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Passed</div>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-300">
                    {filteredAudits.filter(a => a.result === 'failed').length}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full opacity-60"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Failed</div>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">
                    {filteredAudits.filter(a => !a.result).length}
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-60"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Pending</div>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-3">
                  <div className="text-3xl lg:text-4xl font-bold text-sky-600 group-hover:scale-110 transition-transform duration-300">
                    {filteredAudits.length > 0 ? 
                      Math.round((filteredAudits.filter(a => a.result === 'pass').length / filteredAudits.filter(a => a.result).length) * 100) || 0
                      : 0}%
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full opacity-60"></div>
                </div>
                <div className="text-sm font-medium text-slate-600">Success Rate</div>
              </div>
            </div>
          </div>
        </Card>
      )}
        </div>
    </div>
  );
}
