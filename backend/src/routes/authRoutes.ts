import express, { Router, Request, Response, NextFunction } from 'express';
import * as authController from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Wrapper for async route handlers to ensure they are compatible with Express
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Route to handle user signup
router.post('/signup', asyncHandler(authController.signup));

// Route to handle user signin
router.post('/signin', asyncHandler(authController.login));

// Route to handle user signout
router.post('/signout', authMiddleware, asyncHandler(authController.logout));

// Route to request a password reset
router.post('/request-password-reset', asyncHandler(authController.requestPasswordReset));

// Route to reset password using a token from the request body
// This should ideally be a different controller, e.g., authController.performPasswordReset
// For now, using updatePassword as a placeholder, assuming it can handle this context or will be adapted.
// authModel.updateUserPassword is called by authController.updatePassword, which expects a JWT.
// A dedicated model function for resetting password with a temporary token might be needed.
router.post('/reset-password', asyncHandler(authController.resetPasswordWithToken));

// Route to verify a user token (e.g., on app load)
router.get('/verify-token', authMiddleware, asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // If authMiddleware passes, token is valid and req.user is set.
  res.status(200).json({ valid: true, user: req.user });
}));

// Route to verify a password reset token (usually from a link in an email)
// This controller should validate the token (e.g., against DB) and not expect a JWT
router.get('/verify-reset-token', asyncHandler(authController.verifyResetToken));

// Route to update user password while authenticated
router.post('/update-password', authMiddleware, asyncHandler(authController.updatePassword));

// Route to update user profile information
router.post('/update-profile', authMiddleware, asyncHandler(authController.updateUserProfile));

export default router;