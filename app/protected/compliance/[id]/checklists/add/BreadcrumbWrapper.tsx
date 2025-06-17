"use client";

import { SimpleBreadcrumb } from "@/components/ui/simple-breadcrumb";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
  complianceId: string;
  complianceName?: string;
}

export default function ChecklistAddBreadcrumbWrapper({ children, complianceId, complianceName }: BreadcrumbWrapperProps) {
  const breadcrumbs = [
    { label: "Compliance", href: "/protected/compliance" },
    { label: complianceName || "Framework", href: `/protected/compliance/${complianceId}` },
    { label: "Checklists", href: `/protected/compliance/${complianceId}/checklists` },
    { label: "Add Checklist", href: `/protected/compliance/${complianceId}/checklists/add` }
  ];

  return (
    <>
      <div className="mb-6 border-b border-sky-100 pb-4">
        <SimpleBreadcrumb items={breadcrumbs} />
      </div>
      {children}
    </>
  );
}
