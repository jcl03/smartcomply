'use client';

import { useRouter } from "next/navigation";
import { Filter, X } from "lucide-react";
import Link from "next/link";

interface ComplianceFilterProps {
  complianceFrameworks: { id: number; name: string }[];
  activeFilterId?: string;
}

export default function ComplianceFilter({ complianceFrameworks, activeFilterId }: ComplianceFilterProps) {
  const router = useRouter();
  
  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const url = new URL(window.location.href);
    
    if (value && value !== '') {
      url.searchParams.set('compliance', value);
    } else {
      url.searchParams.delete('compliance');
    }
    
    router.push(url.pathname + url.search);
  };
  return (
    <div className="flex items-center gap-3">
      <form className="flex items-center gap-2" action="" method="get">
        <div className="flex items-center mr-2">
          <Filter className="h-5 w-5 text-white mr-2" />
          <span className="text-white font-medium">Filter:</span>
        </div>
        
        <div className="relative z-50">
          <select
            name="compliance"
            onChange={handleFilterChange}
            value={activeFilterId || ''}
            className="bg-blue-600 text-white rounded-full px-6 py-2 min-w-[180px] text-sm font-medium 
            focus:outline-none hover:bg-blue-700 transition-colors appearance-none cursor-pointer"
            style={{ 
              backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '16px',
              paddingRight: '40px'
            }}
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
        </div>
      </div>
      
      {activeFilterId && (
        <Link
          href="/protected/checklist"
          className="inline-flex items-center justify-center bg-slate-700/80 hover:bg-slate-600/80 text-white rounded-full px-4 py-2 text-sm transition-colors"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Link>
      )}
    </div>
  );
}
