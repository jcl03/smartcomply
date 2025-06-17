"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
}

export default function ComplianceAddBreadcrumbWrapper({ children }: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "Compliance", href: "/protected/compliance" },
    { label: "Add Framework", href: "/protected/compliance/add" }
  ]);

  return <>{children}</>;
}
