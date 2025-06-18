"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
  auditTitle?: string;
  complianceName?: string;
}

export default function AuditDetailBreadcrumbWrapper({ 
  children, 
  auditTitle, 
  complianceName 
}: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "Audit History", href: "/protected/Audit" },
    { label: auditTitle || "Audit Details", href: "#" }
  ]);

  return <>{children}</>;
}
