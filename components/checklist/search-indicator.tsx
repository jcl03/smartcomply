'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchIndicatorProps {
  searchQuery?: string;
}

export default function SearchIndicator({ searchQuery }: SearchIndicatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (!searchQuery) return null;

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <Search className="h-4 w-4" />
      <span>Searching: "{searchQuery}"</span>
      <button
        onClick={clearSearch}
        className="text-slate-400 hover:text-slate-600 transition-colors"
        title="Clear search"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
