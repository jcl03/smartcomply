''use client'';

import { useState, useEffect } from ''react'';
import Link from ''next/link'';
import { useRouter } from ''next/navigation'';
import { useAuth } from ''@/lib/auth/AuthContext'';

/**
 * Login Page (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI
 * - Captures user input
 * - Calls API methods through AuthContext
 * - Displays results to the user
 */
export default function LoginPage() {
  // View state (UI-related state only)
  const [email, setEmail] = useState('''');
  const [password, setPassword] = useState('''');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, loading, login } = useAuth();

  // Only redirect if user is actually authenticated
  useEffect(() => {
    if (user) {
      router.replace(''/dashboard'');
    }
  }, [user, router]);

  // Handle form submission - delegates to AuthContext
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      await login(email, password);
      // Login successful, AuthContext will update the user state
      // and the above useEffect will handle the redirect
    } catch (err: any) {
      setError(err.message || ''Login failed'');
    }
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
          {loading ? ''Logging in'' : ''Login''}
        </button>
      </form>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <p className="mt-2">
        <Link href="/forgot-password" className="text-blue-600 underline">
          Forgot Password?
        </Link>
      </p>
    </div>
  );
}