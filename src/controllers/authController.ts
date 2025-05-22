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
  processAuthCode,
  updateUserMetadata,
  updateProfile,
  inviteUserModel
} from '@/models/authModel';

/**
 * Handle user signup
 */
export async function handleSignupController(
  email: string, 
  password: string, 
  displayName: string = '', 
  role: string = 'user',
  fullName: string = '',
  confirmPassword: string = ''
) {  // Validation logic belongs in the controller
  if (!email || !email.includes('@')) {
    return { error: { message: 'Please provide a valid email address.' } };
  }
  
  if (!password || password.length < 6) {
    return { error: { message: 'Password must be at least 6 characters.' } };
  }
  
  if (confirmPassword && password !== confirmPassword) {
    return { error: { message: 'Passwords do not match.' } };
  }
  
  if (!displayName.trim()) {
    return { error: { message: 'Display name is required.' } };
  }
  
  // Validate role (optional security measure)
  const validRoles = ['user', 'manager', 'admin', 'external_auditor']; // Updated roles
  if (!validRoles.includes(role)) {
    role = 'user'; // Default to user role if invalid role provided
  }
  
  // Business logic and model interaction
  return await signupWithEmail(email, password, displayName, role, fullName);
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

/**
 * Update user display name and profile
 */
export async function updateUserProfileController(userId: string, displayName: string, fullName?: string) {
  // Validation
  if (!displayName || !displayName.trim()) {
    return { error: { message: 'Display name is required.' } };
  }
  
  // Full name defaults to display name if not provided
  const actualFullName = fullName || displayName;
  
  // Update both the auth metadata and profile table
  const [metadataResult, profileResult] = await Promise.all([
    // Update auth metadata
    updateUserMetadata({ display_name: displayName }),
    
    // Update profile table
    updateProfile(userId, { full_name: actualFullName })
  ]);
  
  // Return error from either operation
  if (metadataResult.error) {
    return { error: metadataResult.error };
  }
  
  if (profileResult.error) {
    return { error: profileResult.error };
  }
  
  return { data: { user: metadataResult.data.user, profile: profileResult.data }, error: null };
}

/**
 * Handle user invitation
 */
export async function handleInviteUserController(email: string, role: string) {
  // Validation
  if (!email || !email.includes('@')) {
    return { error: { message: 'Please provide a valid email address.' } };
  }
  const validRoles = ['user', 'manager', 'admin', 'external_auditor'];
  if (!validRoles.includes(role)) {
    return { error: { message: 'Invalid role.' } };
  }
  // Orchestrate business logic
  return await inviteUserModel(email, role);
}

