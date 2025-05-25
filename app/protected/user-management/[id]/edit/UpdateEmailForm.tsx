"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateUserEmail } from "../../actions";

export default function UpdateEmailForm({ 
  userId, 
  currentEmail 
}: { 
  userId: string,
  currentEmail: string
}) {
  const [newEmail, setNewEmail] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newEmail) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }
    
    if (newEmail === currentEmail) {
      toast({
        title: "Error",
        description: "New email must be different from current email",
        variant: "destructive",
      });
      return;
    }
    
    // First step - show confirmation dialog
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }
    
    // Second step - perform the update
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("newEmail", newEmail);
      
      const result = await updateUserEmail(formData);
      
      if (result.error) {
        toast({
          title: "Error",
          description: result.error || "Failed to update email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Email updated successfully",
        });
        // Reset form state
        setNewEmail("");
        setIsConfirming(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    setIsConfirming(false);
    setNewEmail("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentEmail">Current Email</Label>
          <Input
            id="currentEmail"
            value={currentEmail}
            disabled
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="newEmail">New Email</Label>
          <Input 
            id="newEmail" 
            name="newEmail"
            type="email"
            placeholder="new-email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
          />
        </div>

        {isConfirming && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-md">
            <p className="font-medium">⚠️ This action is not reversible!</p>
            <p className="text-sm mt-1">
              You are about to change this user&apos;s email from <span className="font-medium">{currentEmail}</span> to <span className="font-medium">{newEmail}</span>.
            </p>
            <p className="text-sm mt-1">
              The user will need to use this new email address to log in going forward.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        {isConfirming ? (
          <>
            <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Confirm Update"}
            </Button>
          </>
        ) : (
          <Button type="submit" disabled={isLoading || !newEmail}>
            Update Email
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
