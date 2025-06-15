"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Shield, Sparkles } from "lucide-react";
import type { ActionResult } from "@/lib/types";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
    >
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative flex items-center gap-2">
        {pending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating Framework...
          </>
        ) : (
          <>
            <Shield className="w-4 h-4" />
            Create Framework
          </>
        )}
      </div>
    </Button>
  );
}

type ServerAction = (formData: FormData) => Promise<ActionResult>;

export default function AddComplianceForm({ action }: { action: ServerAction }) {
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
        setSuccessMessage("Compliance framework created successfully!");
        // Reset form
        const form = document.getElementById("add-compliance-form") as HTMLFormElement;
        if (form) form.reset();
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected error occurred");
      console.error(error);
    }
  }
    return (
    <form id="add-compliance-form" action={clientAction}>
      <CardContent className="p-8 space-y-8">
        {/* Status Messages */}
        {errorMessage && (
          <div className="relative overflow-hidden rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600"></div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm font-semibold">!</span>
              </div>
              <div>
                <h4 className="font-semibold text-red-800">Error</h4>
                <p className="text-red-700 text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="relative overflow-hidden rounded-xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm font-semibold">✓</span>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800">Success!</h4>
                <p className="text-emerald-700 text-sm mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Form Field */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <Label htmlFor="name" className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Framework Details
            </Label>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              Framework Name
              <span className="text-red-500">*</span>
            </Label>
            <div className="relative group">
              <Input 
                id="name" 
                name="name" 
                placeholder="e.g., SOX Compliance, GDPR Data Protection, ISO 27001 Security" 
                type="text" 
                required 
                className="h-14 w-full rounded-xl border-2 border-slate-200 bg-white/80 backdrop-blur-sm px-6 py-4 text-base font-medium transition-all duration-300 placeholder:text-slate-400 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white group-hover:shadow-lg"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-focus-within:from-indigo-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Choose a descriptive name that clearly identifies the compliance standard or regulation this framework addresses
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-6 border border-slate-200/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-800">What happens next?</h3>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              <span>Your framework will be created and ready for configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              <span>You can add forms, checklists, and compliance requirements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
              <span>Team members can be assigned and workflows configured</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200/50 px-8 py-6">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>
        <div className="flex justify-between items-center w-full">
          <Link 
            href="/protected/compliance" 
            className="group flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-200 hover:shadow-sm"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span>
            Back to Frameworks
          </Link>
          <SubmitButton />
        </div>
      </CardFooter>
    </form>
  );
}
