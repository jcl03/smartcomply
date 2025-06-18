'use client';

import Link from "next/link";
import { Filter, CheckCircle } from "lucide-react";

interface FilterByComplianceProps {
  complianceId?: number;
  isFiltered: boolean;
  frameworkName: string;
}

export default function FilterByCompliance({ complianceId, isFiltered, frameworkName }: FilterByComplianceProps) {
  if (!complianceId) return null;
  
  return (
    <div className="flex flex-col gap-1">
      {isFiltered ? (
        <div className="flex items-center gap-1">
          <p className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 flex items-center">
            {frameworkName || 'Unknown Framework'} 
            <CheckCircle className="h-3.5 w-3.5 ml-1 text-green-600" />
          </p>
        </div>
      ) : (
        <p className="font-medium text-slate-700">
          {frameworkName || 'Unknown Framework'}
        </p>
      )}
      <Link 
        href={`/protected/checklist?compliance=${complianceId}`}
        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-0.5 rounded transition-colors"
      >
        <Filter className="h-3 w-3 mr-1" />
        Filter by this
      </Link>
    </div>
  );
}
