import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This is now a proxy to our Express backend
export async function POST(request: NextRequest) {
  try {
    // Extract the token from the request headers
    const authHeader = request.headers.get('authorization');
    
    // Get the API URL from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    
    // Forward the request to our Express backend
    const response = await fetch(`${apiUrl}/user-management/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(await request.json()),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response
    return NextResponse.json(data, { status: response.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
