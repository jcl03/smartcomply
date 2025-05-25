"use client";

import { Suspense, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

function InviteCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    const handleInviteAuth = async () => {
      try {
        const supabase = createClient();
        
        // Check if we have authentication tokens in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        
        if (accessToken && refreshToken) {
          // Set the session using the tokens from the URL fragment
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error("Error setting session:", error);
            // Redirect to sign-in page on error
            router.push("/sign-in?message=Error logging in with invitation link");
            return;
          }
          
          // Successfully authenticated, now redirect to the invite page
          if (next) {
            router.push(next);
          } else {
            router.push("/protected");
          }
        } else {
          // No tokens found, redirect to sign-in
          router.push("/sign-in?message=Invalid invitation link");
        }
      } catch (error) {
        console.error("Error handling invite authentication:", error);
        router.push("/sign-in?message=Error processing invitation link");
      }
    };

    handleInviteAuth();
  }, [router, next]);
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Logging you in...</p>
        </div>
      </div>
    </div>
  );
}

export default function InviteCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    }>
      <InviteCallbackContent />
    </Suspense>
  );
}
