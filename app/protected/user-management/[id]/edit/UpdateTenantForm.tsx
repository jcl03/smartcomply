"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Save, X } from "lucide-react";
import { updateUserTenant } from "./action";
import { useRouter } from "next/navigation";

interface Tenant {
  id: number;
  name: string;
}

interface UpdateTenantFormProps {
  userId: string;
  currentTenant: Tenant | null;
  tenants: Tenant[];
}

export default function UpdateTenantForm({ userId, currentTenant, tenants }: UpdateTenantFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    currentTenant?.id.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Debug logging
  console.log("UpdateTenantForm props:", {
    userId,
    currentTenant,
    tenants,
    selectedTenantId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showWarning) {
      setShowWarning(true);
      return;
    }    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("tenant_id", selectedTenantId);
    
    console.log("Submitting tenant update:", {
      userId,
      tenant_id: selectedTenantId,
      currentTenant: currentTenant?.id,
      selectedTenantName: selectedTenantId ? tenants.find(t => t.id.toString() === selectedTenantId)?.name : "No tenant"
    });
      try {
      const result = await updateUserTenant(formData);
      
      console.log("Update tenant result:", result);
        if (result.error) {
        alert(`Error: ${result.error}`);
      } else if (result.success) {
        alert("Team updated successfully!");
        setIsEditing(false);
        setShowWarning(false);
        
        // Force a hard refresh to ensure data is updated
        window.location.reload();
      } else {
        alert("Unknown response from server");
      }
    } catch (error) {
      console.error("Error updating team:", error);
      alert(`An error occurred while updating the team: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowWarning(false);
    setSelectedTenantId(currentTenant?.id.toString() || "");
  };
  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Team Assignment
            </h4>
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Current team:</span>
                {currentTenant ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg border bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border-slate-200">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    {currentTenant.name}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    No team assigned
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {currentTenant 
                  ? `This user is currently assigned to the "${currentTenant.name}" team organization.`
                  : "This user has not been assigned to any team organization."
                }
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4"
          >
            Edit Team
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-600" />
            Update Team Assignment
          </h4>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>

        <div className="space-y-3">
          <Label htmlFor="tenant_id" className="text-gray-900 font-semibold">
            Select Team
          </Label>
          <select
            id="tenant_id"
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          >
            <option value="">No team</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id.toString()}>
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Warning Section */}
        {showWarning && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-full flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h5 className="text-amber-800 font-bold text-lg">Warning: Team Change</h5>
                <div className="text-amber-700 mt-2 space-y-2">
                  <p className="font-medium">This action cannot be undone and will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Change the user's team assignment immediately</li>
                    <li>Potentially affect their access to team-specific data</li>
                    <li>May require the user to re-authenticate</li>
                    <li>Update audit logs and compliance records</li>
                  </ul>
                  <p className="font-medium mt-3">
                    From: <span className="font-bold">{currentTenant ? currentTenant.name : "No team"}</span>
                  </p>
                  <p className="font-medium">
                    To: <span className="font-bold">
                      {selectedTenantId ? tenants.find(t => t.id.toString() === selectedTenantId)?.name : "No team"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!showWarning ? (
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={selectedTenantId === (currentTenant?.id.toString() || "")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Preview Changes
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Updating..." : "Confirm Update"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowWarning(false)}
                disabled={isSubmitting}
              >
                Review Again
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
