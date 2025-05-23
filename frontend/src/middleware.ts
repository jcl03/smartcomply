import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware to protect routes that require authentication
 * This runs on the Edge runtime
 */
export async function middleware(request: NextRequest) {
  // Get the token from the cookies
  const token = request.cookies.get('authToken')?.value;
  
  // If no token found, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Verify the token with our Express API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const response = await fetch(`${apiUrl}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      // If token is invalid, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Token is valid, continue with the request
    return NextResponse.next();
  } catch (error) {
    // If there's an error (e.g. API is down), redirect to login as a fallback
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

/**
 * Define which routes this middleware should run on
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/user-management/:path*',
    '/admin/:path*',
    '/settings/:path*',
  ],
};
