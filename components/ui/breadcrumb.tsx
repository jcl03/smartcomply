"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreadcrumb, type BreadcrumbItem } from "./breadcrumb-context";

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
  maxItems?: number; // Maximum number of breadcrumb items to show
}

// Mapping of paths to readable names
const pathLabels: Record<string, string> = {
  '/protected': 'Dashboard',
  '/protected/user-management': 'User Management',
  '/protected/user-management/add': 'Add User',
  '/protected/compliance': 'Compliance',
  '/protected/compliance/add': 'Add Framework',
  '/protected/compliance/archive': 'Archived Frameworks',
  '/protected/compliance/test-fill': 'Test Fill',
  '/protected/documents': 'My Documents',
  '/protected/checklist': 'Checklist Responses',
  '/protected/Audit': 'Audit History',
  '/protected/reports': 'Reports',
  '/protected/profile': 'Profile',
  '/protected/setup': 'Setup Profile',
  '/protected/reset-password': 'Reset Password',
  '/protected/view-compliance': 'View Compliance',
  '/protected/first-time-login': 'First Time Login',
  '/protected/invite': 'Invite',
};

// Dynamic route patterns
const dynamicRouteLabels: Record<string, string> = {
  'edit': 'Edit',
  'forms': 'Forms',
  'checklists': 'Checklists',
  'archive': 'Archive',
  'add': 'Add',
  'test-fill': 'Test Fill',
  'details': 'Details',
  'preview': 'Preview',
  'fill': 'Fill',
  'checklist-fill': 'Fill Checklist',
  'view': 'View',
  'callback': 'Callback',
  'resend-activation': 'Resend Activation',
};

export function Breadcrumb({ items, className = "", maxItems = 5 }: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Try to use context breadcrumbs first, then custom items, then auto-generate
  let breadcrumbItems: BreadcrumbItem[] = [];
  
  try {
    const { breadcrumbs } = useBreadcrumb();
    breadcrumbItems = breadcrumbs.length > 0 ? breadcrumbs : (items || generateBreadcrumbsFromPath(pathname));
  } catch {
    // If context is not available, fall back to items or auto-generation
    breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  }

  if (breadcrumbItems.length === 0) return null;

  // Truncate breadcrumbs if they exceed maxItems
  const shouldTruncate = breadcrumbItems.length > maxItems;
  const displayItems = shouldTruncate 
    ? [
        ...breadcrumbItems.slice(0, 1), // First item
        { label: "...", href: "#" }, // Ellipsis
        ...breadcrumbItems.slice(-maxItems + 2) // Last items
      ]
    : breadcrumbItems;  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb navigation">
      <Link 
        href="/protected" 
        className="flex items-center px-2 py-1 rounded-md text-sky-600 hover:text-sky-900 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-colors"
        title="Dashboard"
        aria-label="Go to Dashboard"
      >
        <Home className="h-4 w-4" />
      </Link>        {displayItems.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1 text-sky-400 flex-shrink-0" aria-hidden="true" />
          {index === displayItems.length - 1 ? (
            <span 
              className="font-medium text-sky-900 px-2 py-1 bg-sky-100 rounded-md"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : item.label === "..." ? (
            <span className="px-2 py-1 text-sky-600" aria-hidden="true">...</span>
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

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Skip if we're on the main dashboard
  if (pathname === '/protected') {
    return [];
  }
  
  let currentPath = '';
  
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    // Skip the first 'protected' segment in display
    if (segments[i] === 'protected') continue;
    
    // Handle dynamic routes (like [id])
    let label = pathLabels[currentPath];
    
    if (!label) {
      // Check if this is a dynamic route
      const segment = segments[i];
      const nextSegment = segments[i + 1];
      const prevSegment = segments[i - 1];
      
      // Special handling for nested routes
      if (prevSegment === 'compliance' && segment.match(/^[0-9a-f-]+$/)) {
        // This is a compliance ID
        label = 'Framework Details';
      } else if (prevSegment === 'checklist' && segment.match(/^[0-9a-f-]+$/)) {
        // This is a checklist ID  
        label = 'Checklist Details';
      } else if (prevSegment === 'documents' && segment.match(/^[0-9a-f-]+$/)) {
        // This is a document ID
        label = 'Document Details';
      } else if (prevSegment === 'Audit' && segment.match(/^[0-9a-f-]+$/)) {
        // This is an audit ID
        label = 'Audit Details';
      } else if (prevSegment === 'user-management' && segment.match(/^[0-9a-f-]+$/)) {
        // This is a user ID
        label = 'User Details';
      } else if (prevSegment === 'view-compliance' && segment.match(/^[0-9a-f-]+$/)) {
        // This is a compliance view ID
        label = 'Compliance View';
      } else if (prevSegment === 'invite' && segment.match(/^[0-9a-f-]+$/)) {
        // This is an invite token
        label = 'Accept Invite';
      } else if (dynamicRouteLabels[segment]) {
        // First check if it's a known dynamic route label
        label = dynamicRouteLabels[segment];
      } else if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        // UUID pattern - likely an ID
        label = 'Details';
      } else if (segment.match(/^\d+$/)) {
        // Numeric ID
        label = 'Details';
      } else if (segment.startsWith('[') && segment.endsWith(']')) {
        // Next.js dynamic route parameter
        label = 'Details';
      } else {
        // Capitalize and clean up the segment
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }
    }
    
    breadcrumbs.push({
      label,
      href: currentPath
    });
  }
  
  return breadcrumbs;
}

export default Breadcrumb;
