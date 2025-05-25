"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { updateUserRole } from "../../actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useFormStatus } from "react-dom";

// Submit button with loading state
function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Updating..." : "Update Role"}
    </Button>
  );
}

export default function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Use React.use() to unwrap the params Promise
  const { id: userId } = React.use(params);
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();  useEffect(() => {
    async function loadUserProfile() {
      try {
        const supabase = createClient();
        
        // Check if current user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/sign-in");
          return;
        }

        const { data: currentUserProfile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (currentUserProfile?.role !== 'admin') {
          router.push("/protected");
          return;
        }        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('view_user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (profileError || !profileData) {
          setError("User not found");
          return;
        }

        setProfile(profileData);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    }    loadUserProfile();
  }, [userId, router]);

  async function handleUpdateRole(formData: FormData) {
    try {
      const result = await updateUserRole(formData);
      
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "User role updated successfully!",
        });
        // Optionally redirect back to user management
        setTimeout(() => {
          router.push("/protected/user-management");
        }, 1500);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 w-full flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2">{error || "User not found"}</p>
          <Link 
            href="/protected/user-management"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to User Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Edit User</h1>
        </div>
        <Link 
          href="/protected/user-management"
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="font-medium">{profile.full_name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <Label>Member since</Label>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <Label>Last sign in</Label>
              <p className="font-medium">
                {profile.last_sign_in_at 
                  ? new Date(profile.last_sign_in_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Update Role</CardTitle>
        </CardHeader>        <CardContent>
          <form action={handleUpdateRole}>
            <input type="hidden" name="userId" value={profile.id} />
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">User Role</Label>
                <select 
                  id="role" 
                  name="role" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={profile.role}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
