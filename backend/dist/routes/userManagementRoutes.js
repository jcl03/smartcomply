"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userManagementController = __importStar(require("../controllers/userManagementController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Wrapper for async route handlers to ensure they are compatible with Express
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Apply authMiddleware to all routes in this router
router.use(authMiddleware_1.authMiddleware);
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
exports.default = router;
