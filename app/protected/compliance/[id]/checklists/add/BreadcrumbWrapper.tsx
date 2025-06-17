"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
  complianceId: string;
  complianceName?: string;
}

export default function ChecklistAddBreadcrumbWrapper({ children, complianceId, complianceName }: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "Compliance", href: "/protected/compliance" },
    { label: complianceName || "Framework", href: `/protected/compliance/${complianceId}` },
    { label: "Checklists", href: `/protected/compliance/${complianceId}/checklists` },
    { label: "Add Checklist", href: `/protected/compliance/${complianceId}/checklists/add` }
  ]);

  return <>{children}</>;
}
