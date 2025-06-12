"use client";

import { useState } from "react";
import { resendActivation } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function ResendActivationButton({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleResendActivation() {
    if (!confirm('Resend activation link to this user?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await resendActivation({ email });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to resend activation",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Activation link sent successfully",
        });
      }
    } catch (error) {
      console.error('Error resending activation:', error);
      toast({
        title: "Error",
        description: "Failed to resend activation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <button
      onClick={handleResendActivation}
      disabled={isLoading}
      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
    >
      <Mail className="h-3 w-3" />
      {isLoading ? "Sending..." : "Resend"}
    </button>
  );
}
