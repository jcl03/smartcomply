"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import type { ActionResult } from "@/lib/types";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Framework"}
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
  
  return (    <form id="add-compliance-form" action={clientAction}>
      <CardContent className="p-6 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {errorMessage}
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              {successMessage}
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sm font-semibold text-sky-700">
            Framework Name
          </Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="e.g., SOX, GDPR, ISO 27001" 
            type="text" 
            required 
            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500 bg-white/50 backdrop-blur-sm"
          />
          <p className="text-xs text-sky-600 mt-1">
            Enter a descriptive name for your compliance framework
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-sky-50/50 border-t border-sky-100 p-6 flex justify-between items-center rounded-b-xl">
        <Link 
          href="/protected/compliance" 
          className="text-sm text-sky-600 hover:text-sky-700 hover:underline transition-colors font-medium"
        >
          Cancel
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
