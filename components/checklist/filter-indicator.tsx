'use client';

import Link from "next/link";
import { Filter, X } from "lucide-react";

interface FilterIndicatorProps {
  complianceFilter?: string;
  frameworkName?: string;
}

export default function FilterIndicator({ complianceFilter, frameworkName }: FilterIndicatorProps) {
  if (!complianceFilter) return null;
  
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
        <Filter className="h-3.5 w-3.5" />
        <span className="font-medium">Filtered by: {frameworkName || 'Unknown Framework'}</span>
        <Link 
          href="/protected/checklist" 
          className="flex items-center ml-1 hover:bg-blue-200 p-0.5 rounded-full transition-colors"
          aria-label="Clear filter"
        >
          <X className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
