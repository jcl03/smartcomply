'use client';

import { useState } from 'react';
import Link from 'next/link';
import { handleSignupController } from '@/controllers/authController';
import './css/signup.css';

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
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join SmartComply to manage compliance easily</p>
        </div>
        
        <div className="signup-form">
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}
          
          <form onSubmit={handleSignup}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="displayName" className="form-label">Display Name</label>
                <input
                  id="displayName"
                  type="text"
                  placeholder="How others will see you"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                  className="form-input"
                  disabled={loading}
                />
                <span className="form-hint">This will be visible to other users</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="Your legal name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="form-input"
                  disabled={loading}
                />
                <span className="form-hint">Your real name (private)</span>
              </div>
            </div>
            
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
            
            <div className="form-row">
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
                {password && (
                  <div className="password-strength">
                    <div className={`password-strength-bar ${
                      password.length < 8 ? 'strength-weak' : 
                      password.length < 12 ? 'strength-medium' : 
                      'strength-strong'
                    }`}></div>
                  </div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className="form-input"
                  disabled={loading}
                />
                {password && confirmPassword && (
                  <span className="form-hint" style={{color: password === confirmPassword ? '#15803d' : '#b91c1c'}}>
                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="role" className="form-label">Role</label>
              <select 
                id="role"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="form-select"
                disabled={loading}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="external_auditor">External Auditor</option>
              </select>
              <span className="form-hint">Select the role that best describes your position</span>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`signup-button ${loading ? 'signup-button-loading' : ''}`}
            >
              <span>{loading ? 'Creating your account...' : 'Create Account'}</span>
            </button>
          </form>
        </div>
        
        <div className="signup-footer">
          <Link href="/auth/login" className="signup-footer-link">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
