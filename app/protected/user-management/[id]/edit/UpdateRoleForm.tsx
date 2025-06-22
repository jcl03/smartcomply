"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, UserCheck, Save, X } from "lucide-react";
import { handleUpdateRole } from "./action";
import { useRouter } from "next/navigation";

interface UpdateRoleFormProps {
  userId: string;
  currentRole: string;
  currentTenant: { id: number; name: string } | null;
  tenants: { id: number; name: string }[];
}

const roleDescriptions = {
  user: "Basic access with limited permissions",
  manager: "Enhanced access for team management",
  external_auditor: "Read-only access for compliance review",
  admin: "Full system access and user management",
};

export default function UpdateRoleForm({ userId, currentRole, currentTenant, tenants }: UpdateRoleFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(currentTenant?.id.toString() || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();  // Debug logging
  console.log("UpdateRoleForm props:", {
    userId,
    currentRole,
    currentTenant,
    selectedRole,
    selectedTenantId,
    tenants
  });
  // Check if trying to change to non-admin role without tenant
  const isChangingToNonAdmin = selectedRole !== 'admin' && selectedRole !== currentRole;
  const isChangingFromAdmin = currentRole === 'admin';
  const needsTenantSelection = isChangingToNonAdmin && isChangingFromAdmin;
  const isChangingToNonAdminWithoutTenant = isChangingToNonAdmin && !currentTenant && !selectedTenantId;
  
  // Determine if the form is ready to submit
  const canSubmit = selectedRole !== currentRole && (!needsTenantSelection || selectedTenantId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showWarning) {
      setShowWarning(true);
      return;
    }

    setIsSubmitting(true);
      const formData = new FormData();
    formData.append("userId", userId);
    formData.append("role", selectedRole);
    
    // If changing to non-admin role and need tenant assignment, include tenant_id
    if (needsTenantSelection && selectedTenantId) {
      formData.append("tenant_id", selectedTenantId);
    }
    
    console.log("Submitting role update:", {
      userId,
      role: selectedRole,
      currentRole,
      tenant_id: needsTenantSelection ? selectedTenantId : undefined,
    });

    try {
      const result = await handleUpdateRole(formData);
      
      console.log("Update role result:", result);
      
      if (result?.error) {
        alert(`Error: ${result.error}`);
      } else {
        alert("Role updated successfully!");
        setIsEditing(false);
        setShowWarning(false);
        
        // Force a hard refresh to ensure data is updated
        window.location.reload();
      }
    } catch (error) {
      console.error("Error updating role:", error);
      alert(`An error occurred while updating the role: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setIsEditing(false);
    setShowWarning(false);
    setSelectedRole(currentRole);
    setSelectedTenantId(currentTenant?.id.toString() || "");
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Role Assignment
            </h4>
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Current role:</span>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg border bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1).replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {roleDescriptions[currentRole as keyof typeof roleDescriptions]}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4"
          >
            Edit Role
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
            <UserCheck className="h-5 w-5 text-indigo-600" />
            Update User Role
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
          <Label htmlFor="role" className="text-gray-900 font-semibold">
            Select Role
          </Label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
          >
            <option value="user">
              User - Basic access with limited permissions
            </option>
            <option value="manager">
              Manager - Enhanced access for team management
            </option>
            <option value="external_auditor">
              External Auditor - Read-only access for compliance review
            </option>
            <option value="admin">
              Admin - Full system access and user management
            </option>          </select>
        </div>

        {/* Tenant Selection - Only show when changing from admin to non-admin role */}
        {needsTenantSelection && (
          <div className="space-y-3">
            <Label htmlFor="tenant_id" className="text-gray-900 font-semibold">
              Select Tenant <span className="text-red-500">*</span>
            </Label>
            <select
              id="tenant_id"
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="flex h-12 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
              required
            >
              <option value="">Select a tenant...</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id.toString()}>
                  {tenant.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
              <p>
                Since you're changing from admin to a role with limited access, 
                please select the tenant this user should be assigned to.
              </p>
            </div>
          </div>
        )}

        {/* Warning Section */}
        {showWarning && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h5 className="text-red-800 font-bold text-lg">Warning: Role Change</h5>
                <div className="text-red-700 mt-2 space-y-2">
                  <p className="font-medium">This action cannot be undone and will:</p>                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Change the user's permissions immediately</li>
                    <li>Affect their access to system features and data</li>
                    <li>May require the user to re-authenticate</li>
                    <li>Update security logs and compliance records</li>
                    <li>Impact what actions they can perform in the system</li>
                    {selectedRole === 'admin' && (
                      <li className="text-red-800 font-medium">
                        <strong>Clear the user's tenant assignment</strong> (admin users have system-wide access)
                      </li>
                    )}
                  </ul>
                  <p className="font-medium mt-3">
                    From: <span className="font-bold">{currentRole.charAt(0).toUpperCase() + currentRole.slice(1).replace('_', ' ')}</span>
                  </p>
                  <p className="font-medium">
                    To: <span className="font-bold">
                      {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).replace('_', ' ')}
                    </span>
                  </p>                  <div className="mt-3 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm font-medium">New role description:</p>
                    <p className="text-sm">{roleDescriptions[selectedRole as keyof typeof roleDescriptions]}</p>
                    {selectedRole === 'admin' && (
                      <div className="mt-2 p-2 bg-red-200 rounded border border-red-300">
                        <p className="text-xs font-bold text-red-800">
                          ⚠️ IMPORTANT: Changing to admin role will automatically remove any tenant assignment, 
                          as admin users have system-wide access and are not restricted to specific tenants.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>          </div>
        )}

        {/* Tenant Requirement Warning - Only show for non-admin role changes without tenant */}
        {isChangingToNonAdminWithoutTenant && (
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h5 className="text-yellow-800 font-bold text-lg">Tenant Assignment Required</h5>
                <div className="text-yellow-700 mt-2 space-y-2">
                  <p className="font-medium">
                    Cannot assign role "{selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1).replace('_', ' ')}" 
                    without a tenant assignment.
                  </p>
                  <p className="text-sm">
                    This user currently has no tenant assigned. Non-admin users must be associated with a specific tenant 
                    to define their scope of access and data permissions.
                  </p>                  <div className="mt-3 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm font-medium">Please choose one of the following options:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                      <li>Select a tenant above, then proceed with the role change</li>
                      <li>Choose the "Admin" role for system-wide access without tenant restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}        <div className="flex gap-3 pt-4">
          {!showWarning ? (
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={!canSubmit}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {!canSubmit && needsTenantSelection && !selectedTenantId 
                ? "Select Tenant First" 
                : isChangingToNonAdminWithoutTenant 
                  ? "Cannot Change - No Tenant" 
                  : "Preview Changes"
              }
            </Button>
          ) : (
            <>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isSubmitting || !canSubmit}
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
