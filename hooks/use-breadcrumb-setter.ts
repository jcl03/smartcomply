"use client";

import { useEffect } from "react";
import { useBreadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb-context";

export function useBreadcrumbSetter(breadcrumbs: BreadcrumbItem[]) {
  const { setBreadcrumbs, clearBreadcrumbs } = useBreadcrumb();

  useEffect(() => {
    if (breadcrumbs.length > 0) {
      setBreadcrumbs(breadcrumbs);
    }

    // Cleanup on unmount
    return () => {
      clearBreadcrumbs();
    };
  }, [breadcrumbs, setBreadcrumbs, clearBreadcrumbs]);
}

export { type BreadcrumbItem };
