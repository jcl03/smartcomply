import { Request, Response, NextFunction, Router } from 'express';
import * as userManagementController from '../controllers/userManagementController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Wrapper for async route handlers to ensure they are compatible with Express
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// Route to get all users
router.get('/', asyncHandler(userManagementController.getAllUsers));

// Route to get a specific user by ID
router.get('/:id', asyncHandler(userManagementController.getUserProfile)); // Corrected to use existing controller function name: getUserProfile

// Route to create a new user
router.post('/', asyncHandler(userManagementController.inviteUser)); // Corrected to use existing controller function name: inviteUser

// Route to update an existing user
router.put('/:id', asyncHandler(userManagementController.updateProfile)); // Corrected to use existing controller function name: updateProfile

// Route to delete a user
router.delete('/:id', asyncHandler(userManagementController.deleteUser));

export default router;