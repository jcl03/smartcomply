import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

// Check if a path is an admin path
const isAdminPath = (path: string) => {
  return path.startsWith("/protected/user-management");
};

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    // Create an unmodified response
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // protected routes
    if (request.nextUrl.pathname.startsWith("/protected") && user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }    // Check if authenticated user's access has been revoked
    if (request.nextUrl.pathname.startsWith("/protected") && !user.error && user.data.user) {
      // Check if user access is revoked based on metadata
      const isRevoked = user.data.user.user_metadata?.revoked === true;
      
      if (isRevoked) {
        // Create a new response with redirect
        let response = NextResponse.redirect(new URL("/sign-in?error=Your access has been revoked. Please contact an administrator.", request.url));
        
        // Create a new Supabase client to clear the session properly
        const clearSupabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            cookies: {
              getAll() {
                return request.cookies.getAll();
              },
              setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                  response.cookies.set(name, value, options);
                });
              },
            },
          },
        );
        
        // Clear the session
        await clearSupabase.auth.signOut();
        
        return response;
      }
    }
    
    // For admin paths, check if user is an admin
    if (isAdminPath(request.nextUrl.pathname) && !user.error) {
      // Fetch the user's role
      const { data: profile, error } = await supabase
        .from('view_user_profiles')
        .select('role')
        .eq('email', user.data.user?.email)
        .single();
      
      // If not admin, redirect to protected page
      if (error || !profile || profile.role !== 'admin') {
        return NextResponse.redirect(new URL("/protected", request.url));
      }
    }

    // redirect authenticated users from auth pages to protected route
    if ((request.nextUrl.pathname === "/sign-in" || request.nextUrl.pathname === "/forgot-password") && !user.error) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    // redirect authenticated users from home to protected route
    if (request.nextUrl.pathname === "/" && !user.error) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
