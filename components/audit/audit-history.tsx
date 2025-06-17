"use client";

import { useState } from "react";
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
  ChevronRight
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

type SortField = 'created_at' | 'title' | 'result' | 'percentage' | 'user_name';
type SortDirection = 'asc' | 'desc';

export default function AuditHistoryComponent({ audits, isManager, currentUserId }: AuditHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Filter audits based on status filter only
  const filteredAudits = audits.filter(audit => {
    const matchesStatus = statusFilter === "all" || audit.status === statusFilter;
    return matchesStatus;
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
  };  return (
    <div className="space-y-6">
      {/* Audit Summary Section */}
      {sortedAudits.length > 0 && (
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 border border-slate-200/60 shadow-lg rounded-2xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-sky-400/5 to-blue-500/5 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-400/5 to-green-500/5 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative p-6 lg:p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl shadow-inner">
                <FileText className="h-6 w-6 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-xl">Audit Summary</h3>
                <p className="text-slate-600 text-sm">Comprehensive audit analytics and performance insights</p>
              </div>
            </div>
            
            {(() => {
              const totalAudits = sortedAudits.length;
              const completedAudits = sortedAudits.filter(audit => audit.result !== null);
              const passedAudits = sortedAudits.filter(audit => audit.result === 'pass');
              const failedAudits = sortedAudits.filter(audit => audit.result === 'failed');
              const pendingAudits = sortedAudits.filter(audit => audit.result === null);
              
              const avgScore = completedAudits.length > 0 
                ? Math.round(completedAudits.reduce((sum, audit) => sum + audit.percentage, 0) / completedAudits.length)
                : 0;
              
              const successRate = completedAudits.length > 0 
                ? Math.round((passedAudits.length / completedAudits.length) * 100)
                : 0;
              
              const recentAudits = sortedAudits.filter(audit => {
                const auditDate = new Date(audit.created_at);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return auditDate >= thirtyDaysAgo;
              });

              return (
                <>
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <div className="text-center group">
                      <div className="relative mb-3">
                        <div className="text-3xl lg:text-4xl font-bold text-slate-900 group-hover:scale-110 transition-transform duration-300">
                          {totalAudits}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-60"></div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">Total Audits</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="relative mb-3">
                        <div className="text-3xl lg:text-4xl font-bold text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                          {passedAudits.length}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full opacity-60"></div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">Passed</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="relative mb-3">
                        <div className="text-3xl lg:text-4xl font-bold text-red-600 group-hover:scale-110 transition-transform duration-300">
                          {failedAudits.length}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full opacity-60"></div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">Failed</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="relative mb-3">
                        <div className="text-3xl lg:text-4xl font-bold text-amber-600 group-hover:scale-110 transition-transform duration-300">
                          {pendingAudits.length}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full opacity-60"></div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">Pending</div>
                    </div>
                    
                    <div className="text-center group">
                      <div className="relative mb-3">
                        <div className="text-3xl lg:text-4xl font-bold text-sky-600 group-hover:scale-110 transition-transform duration-300">
                          {successRate}%
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-sky-400 rounded-full opacity-60"></div>
                      </div>
                      <div className="text-sm font-medium text-slate-600">Success Rate</div>
                    </div>
                  </div>

                  {/* Detailed Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Performance Metrics */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        Performance Metrics
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Average Score</span>
                          <span className={`font-bold ${avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                            {avgScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Completion Rate</span>
                          <span className="font-bold text-slate-700">
                            {totalAudits > 0 ? Math.round((completedAudits.length / totalAudits) * 100) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Best Score</span>
                          <span className="font-bold text-green-600">
                            {completedAudits.length > 0 ? Math.max(...completedAudits.map(a => a.percentage)).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Lowest Score</span>
                          <span className="font-bold text-red-600">
                            {completedAudits.length > 0 ? Math.min(...completedAudits.map(a => a.percentage)).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-sky-600" />
                        Recent Activity (30 days)
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Recent Audits</span>
                          <span className="font-bold text-slate-700">{recentAudits.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Recently Passed</span>
                          <span className="font-bold text-green-600">
                            {recentAudits.filter(a => a.result === 'pass').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Recently Failed</span>
                          <span className="font-bold text-red-600">
                            {recentAudits.filter(a => a.result === 'failed').length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Still Pending</span>
                          <span className="font-bold text-amber-600">
                            {recentAudits.filter(a => a.result === null).length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Status Distribution */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-slate-200/50">
                      <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-purple-600" />
                        Status Distribution
                      </h4>
                      <div className="space-y-4">
                        {/* Pass Rate Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Pass Rate</span>
                            <span className="font-medium text-green-600">{successRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-emerald-400 to-green-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${successRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Completion Rate Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-600">Completion Rate</span>
                            <span className="font-medium text-sky-600">
                              {totalAudits > 0 ? Math.round((completedAudits.length / totalAudits) * 100) : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-sky-400 to-blue-500 h-2 rounded-full transition-all duration-700"
                              style={{ width: `${totalAudits > 0 ? (completedAudits.length / totalAudits) * 100 : 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Average Score Indicator */}
                        <div className="pt-2">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${avgScore >= 80 ? 'text-green-600' : avgScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {avgScore}%
                            </div>
                            <div className="text-xs text-slate-500">Average Score</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      )}

      <div className="space-y-6">
        {/* Modern Filter Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-700">
              {sortedAudits.length} {sortedAudits.length === 1 ? 'Record' : 'Records'}
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
        </div>

        {/* Audit Table */}
        <div className="space-y-4">
          {sortedAudits.length === 0 ? (
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
            </Card>
          ) : (
            <Card className="overflow-hidden bg-white border border-slate-200/60 shadow-lg rounded-2xl">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Audit Title */}
                    <div className="col-span-12 md:col-span-4">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center gap-2 font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                      >
                        <span>Audit Details</span>
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
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getResultBadge(audit.result, audit.percentage)}
                                {audit.result && (
                                  <span className={`text-sm font-semibold ${getPercentageColor(audit.percentage)}`}>
                                    {audit.percentage.toFixed(1)}%
                                  </span>
                                )}
                              </div>
                              <Link 
                                href={`/protected/Audit/${audit.id}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors text-xs font-medium"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </Link>
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
                              {audit.user_profile ? (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-slate-400" />
                                  <span className="text-sm text-slate-700 truncate">
                                    {audit.user_profile.full_name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400">Unknown</span>
                              )}
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
                            <div className="flex items-center gap-2">
                              {getResultIcon(audit.result)}
                              {getResultBadge(audit.result, audit.percentage)}
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
                          <div className={`${isManager ? 'col-span-1' : 'col-span-1'} text-center`}>
                            <Link 
                              href={`/protected/Audit/${audit.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:scale-105"
                            >
                              <Eye className="h-4 w-4" />
                              <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
