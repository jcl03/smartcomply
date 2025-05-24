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
      {pending ? "Sending..." : "Send Invitation"}
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
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            name="email" 
            placeholder="user@example.com" 
            type="email" 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select 
            id="role" 
            name="role"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="external_auditor">External Auditor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link href="/protected/user-management" className="text-sm text-muted-foreground hover:underline">
          Cancel
        </Link>
        <SubmitButton />
      </CardFooter>
    </form>
  );
}
