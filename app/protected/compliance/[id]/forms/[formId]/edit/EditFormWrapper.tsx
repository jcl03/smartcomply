"use client";

import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditFormWrapperProps {
  children: React.ReactNode;
  hasAuditResponse?: boolean;
  redirectPath?: string;
}

export default function EditFormWrapper({ 
  children, 
  hasAuditResponse = false,
  redirectPath = "/protected"
}: EditFormWrapperProps) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (hasAuditResponse) {
      toast({
        title: "Form Already Filled",
        description: "We already have a response for this audit template. You may not edit it.",
        variant: "destructive",
      });
      
      // Redirect after showing the toast
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasAuditResponse, toast, router, redirectPath]);

  // If there's an audit response, don't render the children
  if (hasAuditResponse) {
    return null;
  }

  return <>{children}</>;
}
