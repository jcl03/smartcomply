import { Request, Response } from 'express';
import * as userManagementModel from '../models/userManagementModel';

/**
 * Invite a user to the application
 */
export const inviteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, role } = req.body;
    
    // Validation
    if (!email || !email.includes('@')) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    
    const validRoles = ['user', 'manager', 'admin', 'external_auditor'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ error: 'Invalid role.' });
      return;
    }
      // Perform invitation
    const { data, error } = await userManagementModel.inviteUser(email, role);
    
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
 * Get all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // This should be protected by middleware that checks admin role
    const { data, error } = await userManagementModel.getAllUsers();
    
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
 * Get user profile
 */
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const userIdToFetch = req.params.id || req.user.id; // Use req.params.id if available
    
    // Check if requesting user has permission to view this profile
    // req.user.id is the authenticated user's ID
    // req.user.user_metadata?.role is the authenticated user's role
    if (userIdToFetch !== req.user.id && req.user.user_metadata?.role !== 'admin') {
      res.status(403).json({ error: 'Permission denied to view this profile' });
      return;
    }
    
    const { data, error } = await userManagementModel.getUserProfile(userIdToFetch);
    
    if (error) {
      res.status(404).json({ error: error.message || 'User profile not found' }); // 404 if not found
      return;
    }
    
    // If an admin is fetching another user's profile, req.user is the admin, data is the fetched profile
    // If a user is fetching their own profile, req.user is the user, data is their profile
    res.status(200).json({ 
      // Clarify what req.user represents here vs the profile data
      // For now, returning the fetched profile data directly
      profile: data
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const userIdToUpdate = req.params.id || req.user.id; // Use req.params.id if available
    
    // Check if requesting user has permission to update this profile
    if (userIdToUpdate !== req.user.id && req.user.user_metadata?.role !== 'admin') {
      res.status(403).json({ error: 'Permission denied to update this profile' });
      return;
    }
    
    const { data, error } = await userManagementModel.updateProfile(userIdToUpdate, req.body);
    
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
 * Delete a user (admin only or self-deletion - adjust logic as needed)
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userIdToDelete = req.params.id;

    if (!userIdToDelete) {
      res.status(400).json({ error: 'User ID is required for deletion.' });
      return;
    }

    // Authorization: Allow admin to delete any user, or user to delete themselves.
    // Adjust this logic based on your application's requirements.
    // For Supabase, deleting a user from auth schema often requires admin privileges.
    if (req.user.user_metadata?.role !== 'admin' && req.user.id !== userIdToDelete) {
      res.status(403).json({ error: 'Permission denied to delete this user.' });
      return;
    }
    
    // If it's not an admin deleting someone else, and the user is trying to delete themselves
    // ensure they are not trying to delete another user if they are not an admin.
    if (req.user.user_metadata?.role !== 'admin' && req.user.id !== userIdToDelete) {
        res.status(403).json({ error: 'You can only delete your own account.' });
        return;
    }


    const { error } = await userManagementModel.deleteUser(userIdToDelete, req.user.id, req.user.user_metadata?.role === 'admin');

    if (error) {
      res.status(400).json({ error: error.message || 'Failed to delete user.' });
      return;
    }

    res.status(200).json({ message: 'User deleted successfully.' });

  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred while deleting the user.' });
  }
};
