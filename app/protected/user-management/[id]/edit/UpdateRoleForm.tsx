"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { handleUpdateRole } from "./action";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function UpdateRoleForm({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      const result = await handleUpdateRole(formData);
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <form action={handleSubmit}>
      <input type="hidden" name="userId" value={userId} />
      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="role" className="text-sm font-medium text-sky-700">
            Current Role: <span className="bg-sky-100 text-sky-800 px-2 py-1 rounded-full text-xs ml-2">{currentRole}</span>
          </Label>
          <select
            id="role"
            name="role"
            className="flex h-12 w-full rounded-lg border-2 border-sky-200 bg-white px-4 py-3 text-sm transition-colors hover:border-sky-300 focus:border-sky-400 focus:ring-2 focus:ring-sky-400 focus:ring-opacity-20 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={currentRole}
          >
            <option value="user">👤 User - Basic access with limited permissions</option>
            <option value="manager">👔 Manager - Enhanced access for team management</option>
            <option value="external_auditor">🔍 External Auditor - Read-only access for compliance review</option>
            <option value="admin">⚡ Admin - Full system access and user management</option>
          </select>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Updating Role...
              </>
            ) : (
              "Update User Role"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
