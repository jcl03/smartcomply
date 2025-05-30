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
    <Button type="submit" disabled={pending}>
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
  
  return (
    <form id="add-compliance-form" action={clientAction}>
      <CardContent className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-md">
            {successMessage}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Framework Name</Label>
          <Input 
            id="name" 
            name="name" 
            placeholder="e.g., SOX, GDPR, ISO 27001" 
            type="text" 
            required 
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/protected/compliance" className="text-sm text-muted-foreground hover:underline">
          Cancel
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
