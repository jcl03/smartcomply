import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import "./sign-in.css";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Only redirect authenticated users to protected if their access is not revoked
  if (user && !user.user_metadata?.revoked) {
    redirect("/protected");
  }

  const searchParams = await props.searchParams;
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h1>Welcome Back</h1>
        <p>
          This is an invite-only application
        </p>
      </div>
      
      <div className="auth-card-body">
        <form className="auth-form">
          <div className="form-group">
            <Label htmlFor="email">Email</Label>
            <Input 
              className="auth-input" 
              name="email" 
              id="email"
              placeholder="you@example.com" 
              required 
            />
          </div>
          
          <div className="form-group">
            <div className="form-row">
              <Label htmlFor="password">Password</Label>
              <Link
                className="forgot-password-link"
                href="/forgot-password"
              >
                Forgot Password?
              </Link>
            </div>
            <Input
              className="auth-input"
              type="password"
              name="password"
              id="password"
              placeholder="Your password"
              required
            />
          </div>
          
          <SubmitButton 
            className="auth-button" 
            pendingText="Signing In..." 
            formAction={signInAction}
          >
            Sign in
          </SubmitButton>
          
          {searchParams && (
            <div className={`form-message-container ${searchParams.type === "error" ? "error" : "success"}`}>
              <FormMessage message={searchParams} />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
