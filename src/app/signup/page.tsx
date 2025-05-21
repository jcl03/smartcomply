'use client';

import { useState } from 'react';
import { handleSignupController } from '@/controllers/authController';

/**
 * Signup Page (View Component)
 * 
 * Traditional MVC View:
 * - Renders UI
 * - Captures user input
 * - Calls controller methods
 * - Displays results to the user
 * - Does NOT contain business logic
 */
export default function SignupPage() {
  // View state (UI-related state only)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission - delegates to controller
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update view state
    setLoading(true);
    setError(null);
    
    // Call controller (business logic) and get result
    const { error: err } = await handleSignupController(email, password);
    
    // Update view based on controller response
    setLoading(false);
    if (err) setError(err.message);
    else setMessage('Signup successful! Check your email for confirmation.');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-2">
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
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
