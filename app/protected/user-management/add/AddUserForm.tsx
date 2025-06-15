"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/types";
import { Mail, UserCheck, AlertCircle, CheckCircle, User, Shield, UserPlus } from "lucide-react";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[180px]"
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
  }  return (
    <form id="add-user-form" action={clientAction} className="space-y-8">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-full flex-shrink-0">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-emerald-800 font-bold text-lg">Success!</p>
            <p className="text-emerald-700 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-red-800 font-bold text-lg">Error</p>
            <p className="text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Framework Details Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">User Details</h3>
        </div>

        {/* Email Field */}
        <div className="space-y-3">
          <Label htmlFor="email" className="text-gray-900 font-semibold text-base">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <Input 
            id="email" 
            name="email" 
            placeholder="e.g., john.doe@company.com" 
            type="email" 
            required 
            className="h-14 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-2 rounded-xl px-4 text-gray-900 placeholder:text-gray-400 text-base transition-all duration-200"
          />
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
            <p>Choose a descriptive email that clearly identifies the user you want to invite</p>
          </div>
        </div>

        {/* Role Field */}
        <div className="space-y-3">
          <Label htmlFor="role" className="text-gray-900 font-semibold text-base">
            User Role <span className="text-red-500">*</span>
          </Label>
          <select 
            id="role" 
            name="role"
            className="flex h-14 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
            required
          >
            <option value="">Select a role...</option>
            <option value="user">User - Basic access to compliance tools</option>
            <option value="manager">Manager - Can oversee compliance activities</option>
            <option value="external_auditor">External Auditor - Limited audit access</option>
            <option value="admin">Admin - Full system access</option>
          </select>
        </div>

        {/* What happens next section */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl text-white">
              <Shield className="h-6 w-6" />
            </div>
            <h4 className="text-gray-900 font-bold text-lg">What happens next?</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
              <p className="leading-relaxed">Your user invitation will be created and ready for team collaboration</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
              <p className="leading-relaxed">You can configure user permissions, access controls, and compliance workflows</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></span>
              <p className="leading-relaxed">Team members can be assigned and notification settings configured</p>
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-200">
          <Link 
            href="/protected/user-management" 
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
          >
            ← Back to User Management
          </Link>
          <SubmitButton />
        </div>
      </div>
    </form>
  );
}
