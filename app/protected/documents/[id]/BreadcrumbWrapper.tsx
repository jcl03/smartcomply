"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
  documentTitle?: string;
  complianceName?: string;
}

export default function DocumentDetailBreadcrumbWrapper({ 
  children, 
  documentTitle, 
  complianceName 
}: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "My Documents", href: "/protected/documents" },
    { label: documentTitle || "Document Details", href: "#" }
  ]);

  return <>{children}</>;
}
