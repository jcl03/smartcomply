"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface SimpleBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function SimpleBreadcrumb({ items, className = "" }: SimpleBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb navigation">
      <Link 
        href="/protected" 
        className="flex items-center px-2 py-1 rounded-md text-sky-600 hover:text-sky-900 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        title="Dashboard"
        aria-label="Go to Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-sky-400 flex-shrink-0" aria-hidden="true" />
          {index === items.length - 1 ? (
            <span 
              className="font-medium text-sky-900 px-2 py-1 bg-sky-100 rounded-md"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href} 
              className="px-2 py-1 rounded-md text-sky-600 hover:text-sky-900 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
              title={item.label}
              aria-label={`Go to ${item.label}`}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

export default SimpleBreadcrumb;
