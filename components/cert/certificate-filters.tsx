"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CertificateFiltersProps {
  searchParams: {
    search?: string;
    folder?: string;
    status?: string;
    expiring?: string;
    page?: string;
  };
  folders: string[];
}

export function CertificateFilters({ searchParams, folders }: CertificateFiltersProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.search || "");

  const updateSearchParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    // Reset page when filters change
    params.delete('page');
    
    router.push(`/protected/cert?${params.toString()}`);
  }, [router, urlSearchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ search: searchValue });
  };

  const clearFilter = (filterKey: string) => {
    updateSearchParams({ [filterKey]: null });
  };

  const clearAllFilters = () => {
    setSearchValue("");
    router.push("/protected/cert");
  };

  const activeFiltersCount = [
    searchParams.search,
    searchParams.folder,
    searchParams.expiring,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search certificates by folder name..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
          </div>
        </form>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Folder Filter */}
            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
              FOLDER
            </DropdownMenuLabel>
            {folders.length > 0 ? (
              folders.map((folder) => (
                <DropdownMenuItem
                  key={folder}
                  onClick={() => updateSearchParams({ folder })}
                  className={searchParams.folder === folder ? "bg-accent" : ""}
                >
                  {folder}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                No folders available
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {/* Expiration Filter */}
            <DropdownMenuLabel className="text-xs font-medium text-gray-500">
              EXPIRATION
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => updateSearchParams({ expiring: "true" })}
              className={searchParams.expiring === "true" ? "bg-accent" : ""}
            >
              Expiring Soon (30 days)
            </DropdownMenuItem>
            
            {activeFiltersCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={clearAllFilters} className="text-red-600">
                  Clear All Filters
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {searchParams.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchParams.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => {
                  setSearchValue("");
                  clearFilter("search");
                }}
              />
            </Badge>
          )}
          
          {searchParams.folder && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Folder: {searchParams.folder}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("folder")}
              />
            </Badge>
          )}
          
          {searchParams.expiring && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Expiring Soon
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("expiring")}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700"
          >
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
