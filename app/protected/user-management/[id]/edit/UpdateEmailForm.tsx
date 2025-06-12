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
      <CardContent className="space-y-6 p-6">
        <div className="space-y-3">
          <Label htmlFor="currentEmail" className="text-sm font-medium text-sky-700 flex items-center gap-2">
            Current Email Address
          </Label>
          <div className="bg-sky-50/50 p-3 rounded-lg border border-sky-200">
            <p className="font-medium text-sky-900">{currentEmail}</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="newEmail" className="text-sm font-medium text-sky-700">
            New Email Address
          </Label>
          <Input 
            id="newEmail" 
            name="newEmail"
            type="email"
            placeholder="new-email@example.com"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="border-sky-200 focus:border-sky-400 focus:ring-sky-400 bg-white text-gray-700"
            required
          />
        </div>

        {isConfirming && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 p-2 rounded-full mt-0.5">
                <span className="text-amber-600 font-bold text-sm">⚠️</span>
              </div>
              <div>
                <p className="font-semibold">This action cannot be undone!</p>
                <p className="text-sm mt-1 text-amber-700">
                  You are about to change this user's email from <span className="font-semibold bg-amber-100 px-1 rounded">{currentEmail}</span> to <span className="font-semibold bg-amber-100 px-1 rounded">{newEmail}</span>.
                </p>
                <p className="text-sm mt-2 text-amber-700">
                  The user will need to use this new email address to log in going forward.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end gap-3 p-6 bg-sky-50/30 rounded-b-xl">
        {isConfirming ? (
          <>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              disabled={isLoading}
              className="border-sky-300 text-sky-700 hover:bg-sky-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
            >
              {isLoading ? "Updating..." : "Confirm Update"}
            </Button>
          </>
        ) : (
          <Button 
            type="submit" 
            disabled={isLoading || !newEmail}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white"
          >
            {isLoading ? "Processing..." : "Update Email"}
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
