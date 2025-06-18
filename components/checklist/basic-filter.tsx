'use client';

import { Filter, X } from "lucide-react";
import Link from "next/link";

interface ComplianceFilterProps {
  complianceFrameworks: { id: number; name: string }[];
  activeFilterId?: string;
}

export default function BasicFilter({ complianceFrameworks, activeFilterId }: ComplianceFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <form className="flex items-center gap-2" action="" method="get">
        <div className="flex items-center mr-2">
          <Filter className="h-5 w-5 text-white mr-2" />
          <span className="text-white font-medium">Filter:</span>
        </div>
        
        <select
          name="compliance"
          onChange={(e) => e.target.form?.submit()}
          value={activeFilterId || ''}
          className="bg-blue-600 text-white rounded-full px-6 py-2 min-w-[180px] text-sm font-medium 
          focus:outline-none hover:bg-blue-700 transition-colors appearance-none cursor-pointer"
        >
          <option value="">All Frameworks</option>
          {complianceFrameworks?.map((framework) => (
            <option 
              key={framework.id} 
              value={framework.id}
            >
              {framework.name}
            </option>
          ))}
        </select>
      </form>
      
      {activeFilterId && (
        <Link
          href="/protected/checklist"
          className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-full px-4 py-2 text-sm transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Link>
      )}
    </div>
  );
}
