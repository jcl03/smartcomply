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
        <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-800 rounded-lg flex items-start gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold">User Access Revoked</p>
            <p className="text-sm mt-1 text-red-700">This user's access has been revoked and they cannot access the application.</p>
          </div>
        </div>
        <button
          onClick={handleRestoreAccess}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          <ShieldCheck className="h-4 w-4" />
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Restoring Access...
            </>
          ) : (
            "Restore Access"
          )}
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800 rounded-lg flex items-start gap-3">
        <div className="bg-amber-100 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <p className="font-semibold">Revoke User Access</p>
          <p className="text-sm mt-1 text-amber-700">
            Revoking access for this user will immediately prevent them from accessing the application and signing in.
          </p>
          <p className="text-xs mt-2 text-amber-600">
            ⚠️ This action can be reversed by restoring access later.
          </p>
        </div>
      </div>
      <button
        onClick={handleRevokeAccess}
        disabled={isLoading}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
      >
        <Ban className="h-4 w-4" />
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Revoking Access...
          </>
        ) : (
          "Revoke Access"
        )}
      </button>
    </div>
  );
}
