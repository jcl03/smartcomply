'use client';

import { Filter } from "lucide-react";

interface FilteredIndicatorProps {
  isFiltered: boolean;
}

export default function FilteredIndicator({ isFiltered }: FilteredIndicatorProps) {
  if (!isFiltered) return null;
  
  return (
    <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
      <Filter className="h-3 w-3" />
      <span>Filtered</span>
    </div>
  );
}
