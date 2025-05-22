'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/supabaseClient';
import { handleLoginController } from '@/controllers/authController';

/**
 * Login Page (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI
 * - Captures user input
 * - Calls controller methods
 * - Displays results to the user
 * - Does NOT contain business logic
 */
export default function LoginPage() {
  // View state (UI-related state only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Only redirect if user is actually authenticated
  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        router.replace('/dashboard');
      }
    };
    checkUser();
  }, [router]);

  // Handle form submission - delegates to controller
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update view state
    setLoading(true);
    setError(null);
    
    // Call controller (business logic) and get result
    const { error: err } = await handleLoginController(email, password);
    
    // Update view based on controller response
    setLoading(false);
    if (err) setError(err.message);
    else router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border px-2 py-1"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border px-2 py-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-1 disabled:opacity-50"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <p className="mt-2">
        <Link href="/forgot-password" className="text-blue-600 underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}

// No changes needed in this file as long as all controller/model imports use '@/lib/supabase/supabaseClient' for client-side logic.
// If you see this error, check '@/controllers/authController.ts' and '@/models/authModel.ts' to ensure they use the browser client for login/session logic.
