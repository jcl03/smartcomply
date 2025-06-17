"use client";

import { useEffect, useMemo } from "react";
import { useBreadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb-context";

export function useBreadcrumbSetter(breadcrumbs: BreadcrumbItem[]) {
  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumb();

  // Serialize breadcrumbs to avoid reference equality issues
  const breadcrumbsKey = useMemo(() => 
    JSON.stringify(breadcrumbs), 
    [breadcrumbs]
  );

  useEffect(() => {
    if (breadcrumbs.length > 0) {
      setBreadcrumbs(breadcrumbs);
    }

    // Cleanup on unmount only
    return () => {
      clearBreadcrumbs();
    };
  }, [breadcrumbsKey]); // Use the serialized key as dependency
}

export { type BreadcrumbItem };
