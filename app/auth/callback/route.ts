import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next")?.toString();
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // If the next parameter starts with /invite/, we're handling an invitation link
  if (next && next.startsWith('/invite/')) {
    // For invitation links, redirect to a special invite callback page that handles
    // the implicit flow tokens in the URL fragment
    return NextResponse.redirect(`${origin}/invite/callback?next=${encodeURIComponent(next)}`);
  }

  // Handle password reset redirects
  if (redirectTo) {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // For other redirects, use the next parameter if available
  if (next) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Default URL to redirect to after sign up process completes
  return NextResponse.redirect(`${origin}/protected`);
}
