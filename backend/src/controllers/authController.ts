import { Request, Response } from 'express';
import * as authModel from '../models/authModel';
import * as userManagementModel from '../models/userManagementModel';

/**
 * Handle user signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, displayName, role, fullName, confirmPassword } = req.body;
    
    // Validation
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }
    
    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }
    
    if (!displayName?.trim()) {
      res.status(400).json({ error: 'Display name is required.' });
      return;
    }
    
    // Validate role (optional security measure)
    const validRoles = ['user', 'manager', 'admin', 'external_auditor'];
    let finalRole = role;
    if (!validRoles.includes(role)) {
      finalRole = 'user'; // Default to user role if invalid role provided
    }
    
    // Call model function
    const { data, error } = await authModel.signupWithEmail(
      email, 
      password, 
      displayName, 
      finalRole, 
      fullName
    );
    
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(200).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle user login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    
    if (!password) {
      res.status(400).json({ error: 'Password is required.' });
      return;
    }
    
    // Process login
    const { data, error } = await authModel.loginWithEmail(email, password);
    if (error) {
      res.status(401).json({ error: error.message });
      return;
    }
    
    if (!data || !data.session) {
      res.status(401).json({ 
        error: 'Login failed. Please check your credentials or confirm your email.'
      });
      return;
    }
    
    res.status(200).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle user logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const { error } = await authModel.logout(token);
    
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle password reset request
 */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    
    // Validation
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    
    // Get the redirect URL from frontend
    const redirectUrl = req.body.redirectUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    
    // Process request
    const { error } = await authModel.resetPassword(email, redirectUrl);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(200).json({ 
      message: 'Password reset email sent. Please check your inbox.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify reset token
 */
export const verifyResetToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get authenticated user using the token in the authorization header
    const token = req.headers.authorization?.split(' ')[1];
    const { data, error } = await authModel.getAuthenticatedUser(token);
    
    if (error) {
      res.status(401).json({ error: error.message, isValid: false });
      return;
    }
    
    res.status(200).json({ 
      data, 
      isValid: !!data?.user 
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user password
 */
export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { password, confirmPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    
    // Validation
    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }
    
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }
    
    // Update password
    const { data, error } = await authModel.updateUserPassword(password, token);
    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }
    
    res.status(200).json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Process authentication code
 */
export const processAuthCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    
    if (!code) {
      res.status(400).json({ 
        success: false, 
        error: 'No authentication code provided'
      });
      return;
    }
    
    // Process auth code through model
    const { data, error } = await authModel.processAuthCode(code);
    
    if (error) {
      res.status(400).json({ 
        success: false, 
        error: error?.message || 'Authentication code processing failed'
      });
      return;
    }
    
    res.status(200).json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const userId = req.user.id;
    const { displayName, fullName } = req.body;
    
    // Validation
    if (!displayName || !displayName.trim()) {
      res.status(400).json({ error: 'Display name is required.' });
      return;
    }
    
    // Full name defaults to display name if not provided
    const actualFullName = fullName || displayName;
    
    // Update both the auth metadata and profile table
    const [metadataResult, profileResult] = await Promise.all([
      // Update auth metadata
      userManagementModel.updateUserMetadata(
        { display_name: displayName },
        req.headers.authorization?.split(' ')[1]
      ),
      
      // Update profile table
      userManagementModel.updateProfile(userId, { full_name: actualFullName })
    ]);
    
    // Return error from either operation
    if (metadataResult.error) {
      res.status(400).json({ error: metadataResult.error.message });
      return;
    }
    
    if (profileResult.error) {
      res.status(400).json({ error: profileResult.error.message });
      return;
    }
    
    res.status(200).json({ 
      data: { 
        user: metadataResult.data.user, 
        profile: profileResult.data 
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Handle password reset with a token
 */
export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      res.status(400).json({ error: 'Reset token is required.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    // It seems Supabase does not directly support password reset with a custom token via client library like this.
    // Password reset is typically handled by the user clicking a link sent to their email,
    // which takes them to a page where they can enter a new password.
    // The actual update happens via `supabase.auth.updateUser({ password: newPassword })`
    // AFTER the user has been authenticated through that reset link (which sets a session).

    // For an API-driven flow using a token you manage:
    // 1. Verify the token's validity (e.g., check against a database table where you stored it with an expiry).
    // 2. If valid, find the user associated with the token.
    // 3. Programmatically update the user's password. This might require admin privileges
    //    or a different Supabase method if not operating within the user's authenticated session.

    // Placeholder for the logic to verify the custom token and update the password.
    // This will likely involve a custom model function.
    // For now, let's assume authModel.performPasswordResetWithToken handles this.
    const { error } = await authModel.performPasswordResetWithToken(token, newPassword);

    if (error) {
      res.status(400).json({ error: error.message || 'Failed to reset password.' });
      return;
    }

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error: any) {
    console.error('Error in resetPasswordWithToken:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
};