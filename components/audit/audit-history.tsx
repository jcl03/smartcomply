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

  // Filter audits based on status filter only
  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    
    return matchesStatus;
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
                <h3 className="text-2xl font-bold text-slate-900 mb-3">No audits found</h3>                <p className="text-slate-600 leading-relaxed">
                  {statusFilter !== "all"
                    ? "Try adjusting your filter criteria to see more results, or clear all filters to view the complete audit history."
                    : "No audits have been created yet. Start your compliance journey by creating your first audit to track and monitor your organization's performance."
                  }
                </p>
                {statusFilter !== "all" && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                    }}
                    className="mt-4 px-4 py-2 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition-colors text-sm font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </Card>        ) : (
          <Card className="overflow-hidden bg-white border border-slate-200/60 shadow-lg rounded-2xl">            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[300px]">
                      Audit Details
                    </th>
                    {isManager && (
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[150px] hidden lg:table-cell">
                        Auditor
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden md:table-cell">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:table-cell">
                      Score
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredAudits.map((audit, index) => {
                    const form = Array.isArray(audit.form) ? audit.form[0] : audit.form;
                    const compliance = Array.isArray(form?.compliance) ? form?.compliance[0] : form?.compliance;
                    
                    return (
                      <tr 
                        key={audit.id}                        className={`group hover:bg-slate-50 transition-colors duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                        }`}
                      >                        {/* Audit Details */}
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg border border-slate-200 group-hover:from-sky-50 group-hover:to-blue-50 group-hover:border-sky-200 transition-all duration-300 flex-shrink-0">
                              <FileText className="h-4 w-4 text-slate-600 group-hover:text-sky-600 transition-colors duration-300" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold text-slate-900 text-sm lg:text-base truncate">
                                {audit.title || `Audit #${audit.id}`}
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                {compliance?.name || `Form #${audit.form_id}` || 'General Audit'}
                              </p>
                              
                              {/* Mobile-only information */}
                              <div className="mt-2 space-y-1 md:hidden">
                                <div className="flex items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    audit.status === 'completed' 
                                      ? 'bg-green-100 text-green-800' 
                                      : audit.status === 'draft'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {audit.status}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {format(new Date(audit.created_at), 'MMM d, yyyy')} • {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                                </div>
                                {isManager && audit.user_profile && (
                                  <div className="text-xs text-slate-600">
                                    By: {audit.user_profile.full_name}
                                  </div>
                                )}
                                {audit.result && audit.percentage > 0 && (
                                  <div className="sm:hidden">
                                    <span className={`text-sm font-bold ${getPercentageColor(audit.percentage)}`}>
                                      {audit.percentage.toFixed(1)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                                {audit.comments && (
                                <p className="text-xs text-slate-600 mt-2 truncate">
                                  {audit.comments}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>{/* Auditor (only for managers) */}
                        {isManager && (
                          <td className="px-6 py-4 hidden lg:table-cell">
                            {audit.user_profile ? (
                              <div>
                                <div className="font-medium text-slate-900 text-sm">
                                  {audit.user_profile.full_name}
                                </div>
                                <div className="text-xs text-slate-500">
                                  {audit.user_profile.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">Unknown</span>
                            )}
                          </td>
                        )}

                        {/* Status */}
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            audit.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : audit.status === 'draft'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {audit.status}
                          </span>
                        </td>

                        {/* Result */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getResultIcon(audit.result)}
                            <div className="hidden sm:block">
                              {getResultBadge(audit.result, audit.percentage)}
                            </div>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 hidden sm:table-cell">
                          {audit.result && audit.percentage > 0 ? (
                            <div className="flex items-center gap-3">
                              <span className={`text-lg font-bold ${getPercentageColor(audit.percentage)}`}>
                                {audit.percentage.toFixed(1)}%
                              </span>
                              <div className="w-16 bg-slate-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    audit.percentage >= 80 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
                                    audit.percentage >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 
                                    'bg-gradient-to-r from-red-400 to-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(audit.percentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <div className="text-sm text-slate-900">
                            {format(new Date(audit.created_at), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-slate-500">
                            {formatDistanceToNow(new Date(audit.created_at), { addSuffix: true })}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <Link 
                            href={`/protected/Audit/${audit.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
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
