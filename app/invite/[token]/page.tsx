"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { UserIcon } from "lucide-react";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState<string | null>(null);  const router = useRouter();
  
  // Get token from URL - using React.use() to unwrap the params promise
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  
  useEffect(() => {
    // When the component loads, get the current user session
    const getCurrentUser = async () => {
      try {
        const supabase = createClient();
        
        // Get the current user's session
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          setError("You need to be logged in to complete your registration. Please check your email for an invitation link.");
          return;
        }
        
        // Get the user information
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          setError("Could not retrieve your user information. Please contact your administrator.");
          return;
        }
        
        // If the user is found, save the email
        if (userData.user.email) {
          setEmail(userData.user.email);
        } else {
          setError("Could not retrieve user information from your account.");
        }
      } catch (err) {
        console.error("Error getting user session:", err);
        setError("An error occurred while validating your account. Please try again later.");
      }
    };    
    getCurrentUser();
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate password
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }
    
    try {
      const supabase = createClient();
      
      // Update the user's password
      const { error: passwordError } = await supabase.auth.updateUser({
        password,
      });
      
      if (passwordError) {
        throw passwordError;
      }
      
      // Update the user's profile with full name
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('email', email);
      
      if (profileError) {
        throw profileError;
      }
      
      // Success! 
      setSuccess(true);
      
      // Redirect to protected page after short delay
      setTimeout(() => {
        router.push('/protected');
      }, 2000);
      
    } catch (err: any) {
      console.error("Error accepting invitation:", err);
      setError(err.message || "An error occurred while setting up your account.");
    } finally {
      setLoading(false);
    }
  };
  
  if (error) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/sign-in')}>
              Go to Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (success) {
    return (
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Account Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Your account has been set up. You will be redirected to the application shortly.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserIcon size={18} />
            <CardTitle>Complete Your Registration</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {email ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  value={email} 
                  disabled 
                />
                <p className="text-sm text-muted-foreground">This is the email address your invitation was sent to.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input 
                  id="fullName" 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting up your account..." : "Complete Registration"}
              </Button>
            </form>
          ) : (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
