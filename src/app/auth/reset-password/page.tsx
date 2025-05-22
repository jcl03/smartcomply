'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyResetTokenController, updatePasswordController } from '@/controllers/authController';

/**
 * Reset Password Page Component
 * Following MVC principles:
 * - View: This component (JSX rendering)
 * - Controller: Functions in authController.ts 
 * - Model: Data operations in authModel.ts
 */
export default function ResetPassword() {
  // View state (UI-related state)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    // If no code is present, redirect to forgot-password page
    if (!code) {
      setError('Invalid password reset link. Please request a new one.');
      // Optional: redirect after a delay
      setTimeout(() => {
        router.push('/forgot-password');
      }, 3000);
      return;
    }

    // Use controller to verify token 
    // This follows MVC by delegating business logic to the controller
    const verifyToken = async () => {
      setLoading(true);
      try {
        // Call the controller function
        const { isValid, error } = await verifyResetTokenController();
        
        // Update view state based on controller response
        if (isValid) {
          setIsValidToken(true);
        } else {
          setError('This password reset link is invalid or has expired. Please request a new one.');
          setTimeout(() => {
            router.push('/forgot-password');
          }, 3000);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while verifying your reset link.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [code, router]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic form validation only (not business logic)
    if (!code || !isValidToken) {
      setError('Invalid password reset link. Please request a new one.');
      return;
    }
    
    // Update view state
    setLoading(true);
    setError(null);
    
    try {
      // Call controller with both passwords - let controller handle validation 
      const { error } = await updatePasswordController(password, confirmPassword);
      
      if (error) {
        throw error;
      }
      
      // Handle successful response in the view
      setMessage('Password has been successfully reset. You will be redirected to login.');
      
      // Redirect to login page after successful reset
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred while resetting your password.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      // Show success for 2 seconds, then redirect
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [code, router]);

  if (code) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Password Reset Successful</h1>
          <p className="mb-2">Your password has been reset. You will be redirected to the login page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">        <div>
          <h2 className="text-2xl font-bold text-center">Reset Your Password</h2>
          {!code && (
            <p className="mt-2 text-center text-red-600">
              Invalid reset link. Please request a new password reset link.
            </p>
          )}
        </div>
        
        {loading && (
          <div className="mt-4 text-center">
            <p>Verifying your reset link...</p>
          </div>
        )}
        
        {isValidToken && code && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Reset Password'}
              </button>            </div>
          </form>
        )}
        
        {error && (
          <div className="mt-4 text-center text-red-600">
            {error}
          </div>
        )}
        
        {message && (
          <div className="mt-4 text-center text-green-600">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
