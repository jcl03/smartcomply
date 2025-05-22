import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { handleInviteUserController } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json();
    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const result: { data?: any; error?: any } = await handleInviteUserController(email, role);
    if (result && result.error) {
      const message =
        typeof result.error === 'string'
          ? result.error
          : result.error?.message || String(result.error) || 'Unknown error';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ data: result?.data || null }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
