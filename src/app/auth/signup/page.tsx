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
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
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
    const { error: err } = await handleSignupController(
      email, 
      password, 
      displayName, 
      role,
      fullName,
      confirmPassword
    );
    
    // Update view based on controller response
    setLoading(false);
    if (err) setError(err.message);
    else setMessage('Signup successful! Check your email for confirmation.');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Sign Up</h1>
      <form onSubmit={handleSignup} className="flex flex-col gap-3">
        <div className="flex flex-col">
          <label htmlFor="displayName" className="text-sm text-gray-600 mb-1">Display Name (what others see)</label>
          <input
            id="displayName"
            type="text"
            placeholder="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="fullName" className="text-sm text-gray-600 mb-1">Full Name (your real name)</label>
          <input
            id="fullName"
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm text-gray-600 mb-1">Email</label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm text-gray-600 mb-1">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
        </div>
        
        <div className="flex flex-col">
          <label htmlFor="confirmPassword" className="text-sm text-gray-600 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
            className="border px-2 py-1 rounded"
          />
        </div>
          <div className="flex flex-col border px-2 py-1 rounded">
          <label htmlFor="role" className="block text-sm text-gray-600 mb-1">Role</label>
          <select 
            id="role"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full"
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="external_auditor">External Auditor</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 mt-2 rounded disabled:opacity-50"
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
      
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
      
      <div className="mt-4 text-center">
        <a href="/auth/login" className="text-blue-600 hover:underline">Already have an account? Log in</a>
      </div>
    </div>
  );
}
