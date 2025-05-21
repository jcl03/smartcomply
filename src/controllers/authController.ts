/**
 * Auth Controller Layer
 * 
 * Traditional MVC Controller:
 * - Handles all business logic
 * - Performs validation
 * - Orchestrates data flow between View and Model
 * - Returns processed data for the View
 */

import { 
  signupWithEmail, 
  loginWithEmail, 
  logout, 
  resetPassword, 
  getSession, 
  updateUserPassword, 
  processAuthCode 
} from '@/models/authModel';

/**
 * Handle user signup
 */
export async function handleSignupController(email: string, password: string) {
  // Validation logic belongs in the controller
  if (!email || !email.includes('@')) {
    return { error: { message: 'Please provide a valid email address.' } };
  }
  
  if (!password || password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters.' } };
  }
  
  // Business logic and model interaction
  return await signupWithEmail(email, password);
}

/**
 * Handle user login
 */
export async function handleLoginController(email: string, password: string) {
  // Validation
  if (!email || !email.includes('@')) {
    return { error: { message: 'Please provide a valid email address.' } };
  }
  
  if (!password) {
    return { error: { message: 'Password is required.' } };
  }
  
  // Process login
  return await loginWithEmail(email, password);
}

export async function handleLogoutController() {
  // You can add controller-specific logic here if needed
  return await logout();
}

/**
 * Handle password reset request
 */
export async function handlePasswordResetController(email: string) {
  // Validation
  if (!email || !email.includes('@')) {
    return { error: { message: 'Please provide a valid email address.' } };
  }
  
  // Get the redirect URL
  const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
  
  // Process request
  return await resetPassword(email, redirectUrl);
}

export async function verifyResetTokenController() {
  // Get session and determine if token is valid
  const { data, error } = await getSession();
  
  if (error) {
    return { error, isValid: false };
  }
  
  return { 
    data, 
    isValid: !!data?.session,
    error: null
  };
}

/**
 * Update user password
 */
export async function updatePasswordController(password: string, confirmPassword?: string) {
  // Validation
  if (confirmPassword && password !== confirmPassword) {
    return { error: { message: 'Passwords do not match.' } };
  }
  
  if (password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters.' } };
  }
  
  // Update password
  return await updateUserPassword(password);
}

/**
 * Process authentication code
 */
export async function processAuthCodeController() {
  try {
    // Process auth code through model
    const { data, error } = await processAuthCode();
    
    if (error) {
      throw error;
    }
    
    return { 
      success: true, 
      data,
      error: null 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error,
      data: null 
    };
  }
}

