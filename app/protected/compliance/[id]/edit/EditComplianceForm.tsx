"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateComplianceFramework } from "../../actions";
import type { ActionResult } from "@/lib/types";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button 
      type="submit" 
      disabled={pending}
      className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
    >
      {pending ? "Updating..." : "Update Framework"}
    </Button>
  );
}

interface Framework {
  id: number;
  name: string;
  created_at: string;
}

export default function EditComplianceForm({ framework }: { framework: Framework }) {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  
  async function clientAction(formData: FormData) {
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const result = await updateComplianceFramework(formData);
      
      if (result?.error) {
        setErrorMessage(result.error);
      } else {
        setSuccessMessage("Framework updated successfully!");
        // Redirect after a short delay
        setTimeout(() => {
          router.push("/protected/compliance");
        }, 1000);
      }
    } catch (error: any) {
      setErrorMessage(error?.message || "An unexpected error occurred");
      console.error(error);
    }
  }
  
  return (
    <form action={clientAction}>
      <input type="hidden" name="id" value={framework.id} />      <CardContent className="space-y-6 p-6">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{errorMessage}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{successMessage}</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Label htmlFor="name" className="text-sky-700 font-semibold text-sm flex items-center gap-2">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 114 0 2 2 0 01-4 0z" clipRule="evenodd" />
            </svg>
            Framework Name
          </Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="Enter a descriptive framework name" 
            required 
            defaultValue={framework.name}
            className="bg-white border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200 px-3 py-2 rounded-lg shadow-sm"
          />
          <p className="text-xs text-sky-600 mt-1">
            Choose a clear and descriptive name for your compliance framework.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 rounded-b-xl border-t border-sky-100">
        <Link 
          href="/protected/compliance" 
          className="flex items-center gap-2 text-sky-600 hover:text-sky-700 hover:underline transition-colors font-medium text-sm"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Cancel
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}