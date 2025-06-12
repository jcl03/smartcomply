"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/types";
import { Mail, UserCheck, AlertCircle, CheckCircle, User, Shield } from "lucide-react";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
    >
      {pending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Sending Invitation...
        </>
      ) : (
        <>
          <Mail className="h-4 w-4 mr-2" />
          Send Invitation
        </>
      )}
    </Button>
  );
}

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddUserForm({ action }: { action: ServerAction }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  async function clientAction(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const result = await action(formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("User invitation sent successfully!");
        // Reset form
        const form = document.getElementById("add-user-form") as HTMLFormElement;
        if (form) form.reset();
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected error occurred");
      console.error(error);
    }
  }
    return (
    <form id="add-user-form" action={clientAction}>
      <CardContent className="space-y-6 p-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
            <div className="bg-emerald-100 p-1 rounded-full flex-shrink-0">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-emerald-800 font-medium">Success!</p>
              <p className="text-emerald-700 text-sm mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <div className="bg-red-100 p-1 rounded-full flex-shrink-0">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
            </div>
          </div>
        )}
        
        {/* Email Field */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-sky-900 font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-sky-600" />
            Email Address
          </Label>
          <Input 
            id="email" 
            name="email" 
            placeholder="Enter user's email address" 
            type="email" 
            required 
            className="bg-sky-50/50 border-sky-200 focus:border-sky-400 focus:ring-sky-400 rounded-lg px-4 py-3 text-sky-900 placeholder:text-sky-400"
          />
          <p className="text-xs text-sky-600">The invitation will be sent to this email address</p>
        </div>

        {/* Role Field */}
        <div className="space-y-3">
          <Label htmlFor="role" className="text-sky-900 font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-600" />
            User Role
          </Label>
          <select 
            id="role" 
            name="role"
            className="flex h-12 w-full rounded-lg border-2 border-sky-200 bg-sky-50/50 px-4 py-3 text-sm text-sky-900 ring-offset-background focus:border-sky-400 focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            required
          >
            <option value="">Select a role...</option>
            <option value="user">User - Basic access to compliance tools</option>
            <option value="manager">Manager - Can oversee compliance activities</option>
            <option value="external_auditor">External Auditor - Limited audit access</option>
            <option value="admin">Admin - Full system access</option>
          </select>
          <p className="text-xs text-sky-600">This determines what the user can access and do in the system</p>
        </div>

        {/* Role Information */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-lg p-4">
          <h4 className="text-sky-900 font-medium mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Role Permissions Overview
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-sky-700 font-medium">User:</span>
              <span className="text-sky-600">View compliance data, complete assessments</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-700 font-medium">Manager:</span>
              <span className="text-sky-600">User permissions + manage teams, approve actions</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-700 font-medium">External Auditor:</span>
              <span className="text-sky-600">Read-only access for audit purposes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sky-700 font-medium">Admin:</span>
              <span className="text-sky-600">Full system access and user management</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center px-8 py-6 bg-gradient-to-r from-sky-50 to-blue-50 border-t border-sky-200">
        <Link 
          href="/protected/user-management" 
          className="flex items-center gap-2 px-4 py-2 text-sm text-sky-600 hover:text-sky-800 hover:bg-sky-100 rounded-lg transition-all duration-200"
        >
          ← Back to User Management
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
