"use client";

import { useBreadcrumbSetter } from "@/hooks/use-breadcrumb-setter";
import { ReactNode } from "react";

interface BreadcrumbWrapperProps {
  children: ReactNode;
  userName?: string;
  userEmail?: string;
}

export default function UserDetailBreadcrumbWrapper({ 
  children, 
  userName, 
  userEmail 
}: BreadcrumbWrapperProps) {
  useBreadcrumbSetter([
    { label: "User Management", href: "/protected/user-management" },
    { label: userName || userEmail || "User Details", href: "#" }
  ]);

  return <>{children}</>;
}
