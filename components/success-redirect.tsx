"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SuccessRedirectProps {
  redirectUrl: string;
  delay?: number;
}

export function SuccessRedirect({ redirectUrl, delay = 3000 }: SuccessRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectUrl);
    }, delay);

    return () => clearTimeout(timer);
  }, [router, redirectUrl, delay]);

  return null;
}
