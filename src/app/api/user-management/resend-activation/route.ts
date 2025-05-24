import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resendActivationLink } from '@/models/userManagementModel';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await resendActivationLink(email);
    
    // Type guard to check if result has error property
    if ('error' in result) {
      const message = typeof result.error === 'string'
        ? result.error
        : result.error?.message || String(result.error);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}