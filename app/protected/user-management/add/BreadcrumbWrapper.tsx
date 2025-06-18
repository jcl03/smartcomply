"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
}

export default function UserAddBreadcrumbWrapper({ children }: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "User Management", href: "/protected/user-management" },
    { label: "Add User", href: "/protected/user-management/add" }
  ]);

  return <>{children}</>;
}
