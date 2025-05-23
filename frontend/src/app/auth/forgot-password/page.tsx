// filepath: src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { handlePasswordResetController } from '@/controllers/authController';

/**
 * Forgot Password Page Component
 * Following MVC principles:
 * - View: This component (JSX rendering)
 * - Controller: handlePasswordResetController function
 * - Model: resetPassword function in authModel.ts
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update view state
    setLoading(true);
    setError(null);
    
    // Call controller (business logic) and get result
    const { error: err } = await handlePasswordResetController(email);
    
    // Update view based on controller response
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setMessage('If the email is registered, a reset link has been sent. Check your inbox.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Reset Password</h1>
      <form onSubmit={handleReset} className="flex flex-col gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border px-2 py-1"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-1 disabled:opacity-50"
        >
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <p className="mt-4">
        <Link href="/auth/login" className="text-blue-600 underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
