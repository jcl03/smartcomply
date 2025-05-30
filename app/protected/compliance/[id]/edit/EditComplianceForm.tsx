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
    <Button type="submit" disabled={pending}>
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
      <input type="hidden" name="id" value={framework.id} />
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
            placeholder="Enter framework name" 
            required 
            defaultValue={framework.name}
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