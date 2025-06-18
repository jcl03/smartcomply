'use client';

import { useRouter } from "next/navigation";
import { Filter, ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";

interface ComplianceFilterProps {
  complianceFrameworks: { id: number; name: string }[];
  activeFilterId?: string;
}

export default function ComplianceFilter({ complianceFrameworks, activeFilterId }: ComplianceFilterProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Find active framework name
  const activeName = activeFilterId ? 
    complianceFrameworks.find(f => f.id.toString() === activeFilterId)?.name || 'Unknown Framework' 
    : 'All Frameworks';

  const handleFilterChange = useCallback((value: string) => {
    // Create URL with or without the filter parameter
    const url = new URL(window.location.href);
    if (value && value !== '') {
      url.searchParams.set('compliance', value);
    } else {
      url.searchParams.delete('compliance');
    }
    
    // Navigate to the new URL
    router.push(url.pathname + url.search);
    setIsOpen(false);
  }, [router]);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
    return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-white mr-2" />
          <span className="text-white font-medium mr-1">Filter:</span>
        </div>
        
        {/* Custom dropdown button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative inline-flex items-center justify-between bg-blue-600/50 border border-blue-400/50 text-white rounded-full px-6 py-2 min-w-[160px] text-sm font-medium focus:outline-none hover:bg-blue-600/60 transition-colors"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="truncate">{activeName}</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </button>
        
        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full min-w-[200px] z-10 bg-white rounded-md shadow-lg py-1 max-h-60 overflow-auto">
            <div 
              className="px-4 py-2 text-gray-900 hover:bg-blue-50 cursor-pointer"
              onClick={() => handleFilterChange('')}
            >
              All Frameworks
            </div>
            
            {complianceFrameworks?.map((framework) => (
              <div 
                key={framework.id}
                className={`px-4 py-2 cursor-pointer ${
                  activeFilterId === framework.id.toString() 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-900 hover:bg-blue-50'
                }`}
                onClick={() => handleFilterChange(framework.id.toString())}
              >
                {framework.name}
              </div>
            ))}
          </div>
        )}
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
