'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/supabaseClient';
import { handleLoginController } from '@/controllers/authController';
import './css/login.css';

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
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">SmartComply</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>
        
        <div className="login-form">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="form-input"
                disabled={loading}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`login-button ${loading ? 'login-button-loading' : ''}`}
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>
        
        <div className="login-footer">
          <Link href="/auth/forgot-password" className="login-footer-link">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}

// No changes needed in this file as long as all controller/model imports use '@/lib/supabase/supabaseClient' for client-side logic.
// If you see this error, check '@/controllers/authController.ts' and '@/models/authModel.ts' to ensure they use the browser client for login/session logic.
