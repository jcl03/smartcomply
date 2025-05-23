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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/authController"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Wrapper for async route handlers to ensure they are compatible with Express
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Route to handle user signup
router.post('/signup', asyncHandler(authController.signup));
// Route to handle user signin
router.post('/signin', asyncHandler(authController.login));
// Route to handle user signout
router.post('/signout', authMiddleware_1.authMiddleware, asyncHandler(authController.logout));
// Route to request a password reset
router.post('/request-password-reset', asyncHandler(authController.requestPasswordReset));
// Route to reset password using a token from the request body
// This should ideally be a different controller, e.g., authController.performPasswordReset
// For now, using updatePassword as a placeholder, assuming it can handle this context or will be adapted.
// authModel.updateUserPassword is called by authController.updatePassword, which expects a JWT.
// A dedicated model function for resetting password with a temporary token might be needed.
router.post('/reset-password', asyncHandler(authController.resetPasswordWithToken));
// Route to verify a user token (e.g., on app load)
router.get('/verify-token', authMiddleware_1.authMiddleware, asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // If authMiddleware passes, token is valid and req.user is set.
    res.status(200).json({ valid: true, user: req.user });
})));
// Route to verify a password reset token (usually from a link in an email)
// This controller should validate the token (e.g., against DB) and not expect a JWT
router.get('/verify-reset-token', asyncHandler(authController.verifyResetToken));
// Route to update user password while authenticated
router.post('/update-password', authMiddleware_1.authMiddleware, asyncHandler(authController.updatePassword));
// Route to update user profile information
router.post('/update-profile', authMiddleware_1.authMiddleware, asyncHandler(authController.updateUserProfile));
exports.default = router;
