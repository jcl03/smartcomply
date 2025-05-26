"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { revokeUserAccess, restoreUserAccess } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { Ban, ShieldCheck, AlertTriangle } from "lucide-react";

interface RevokeAccessFormProps {
  userId: string;
  userEmail: string;
  isRevoked?: boolean;
}

export default function RevokeAccessForm({ userId, userEmail, isRevoked = false }: RevokeAccessFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  // Track the revocation status locally to override server state when needed
  const [localIsRevoked, setLocalIsRevoked] = useState<boolean | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  // Use local state if it exists, otherwise fall back to server prop
  const displayIsRevoked = localIsRevoked !== null ? localIsRevoked : isRevoked;

  async function handleRevokeAccess() {
    if (!confirm(`Are you sure you want to revoke access for user "${userEmail}"? This will prevent them from accessing the application.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await revokeUserAccess({ userId });
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to revoke user access",
          variant: "destructive",
        });      } else {
        toast({
          title: "Success",
          description: `User access for "${userEmail}" has been revoked successfully`,
        });
        // Update local state to immediately reflect the change
        setLocalIsRevoked(true);
        // Refresh the page to update the UI with the new revocation status
        router.refresh();
      }
    } catch (error) {
      console.error('Error revoking user access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke user access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRestoreAccess() {
    if (!confirm(`Are you sure you want to restore access for user "${userEmail}"? This will allow them to access the application again.`)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await restoreUserAccess({ userId });
        if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to restore user access",
          variant: "destructive",
        });      } else {
        toast({
          title: "Success",
          description: `User access for "${userEmail}" has been restored successfully`,
        });
        // Update local state to immediately reflect the change
        setLocalIsRevoked(false);
        // Refresh the page to update the UI with the new revocation status
        router.refresh();
      }
    } catch (error) {
      console.error('Error restoring user access:', error);
      toast({
        title: "Error",
        description: "Failed to restore user access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (displayIsRevoked) {
    return (
      <div className="space-y-4">
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">User Access Revoked</p>
            <p className="text-sm mt-1">This user's access has been revoked and they cannot access the application.</p>
          </div>
        </div>
        <button
          onClick={handleRestoreAccess}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShieldCheck className="h-4 w-4" />
          {isLoading ? "Restoring Access..." : "Restore Access"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md flex items-start gap-2">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium">Revoke User Access</p>
          <p className="text-sm mt-1">
            Revoking access for this user will immediately prevent them from accessing the application and signing in.
          </p>
        </div>
      </div>
      <button
        onClick={handleRevokeAccess}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Ban className="h-4 w-4" />
        {isLoading ? "Revoking Access..." : "Revoke Access"}
      </button>
    </div>
  );
}
